"""Build a local Graphify AST graph plus native Markdown links. No LLM/network API."""
import argparse
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "graphify-out"
MANIFEST = OUT / "project-snapshot.json"


def run(args, capture=False):
    prefix = [shutil.which("rtk"), "proxy"] if shutil.which("rtk") else []
    return subprocess.run(prefix + [str(arg) for arg in args], cwd=ROOT,
                          check=True, text=True, encoding="utf-8", errors="replace",
                          stdout=subprocess.PIPE if capture else None).stdout


def sources():
    # Only tracked source + intentionally added project documents/scripts.
    tracked = run(["git", "ls-files", "-z"], capture=True).split("\0")
    candidates = set(tracked) | {"AGENTS.md", ".graphifyignore"}
    for folder in ("src", "data", "scripts", "supabase", "tests", "docs"):
        candidates.update(path.relative_to(ROOT).as_posix() for path in (ROOT / folder).rglob("*") if path.is_file())
    extensions = {".ts", ".tsx", ".js", ".mjs", ".py", ".sql", ".md", ".html", ".css"}
    blocked = {".git", "node_modules", "dist", ".tmp", "test-results", "graphify-out", ".temp", ".branches", "__pycache__"}
    for name in sorted(candidates):
        path = ROOT / name
        if not path.is_file() or path.is_symlink() or blocked.intersection(path.parts):
            continue
        if not path.resolve().is_relative_to(ROOT) or path.name.startswith(".env") or path.name.endswith(".local"):
            continue
        if path.suffix in extensions or name in {"package.json", ".graphifyignore", ".gitignore", ".gitattributes"}:
            yield name, path


def snapshot():
    return {name: hashlib.sha256(path.read_bytes()).hexdigest() for name, path in sources()}


def add_documents():
    # Runs inside the already-installed Graphify tool environment, not a new venv.
    from graphify.extractors.markdown import extract_markdown
    from graphify.extractors.base import _make_id
    graph_path = OUT / "graph.json"
    graph = json.loads(graph_path.read_text(encoding="utf-8"))
    # --code-only can preserve old documentation layers; replace our AST pass,
    # including its old edges, rather than accumulating duplicate/stale links.
    doc_ids = {node["id"] for node in graph["nodes"]
               if node.get("source_file", "").lower().endswith(".md") or node.get("_origin") == "markdown-ast"}
    graph["nodes"] = [node for node in graph["nodes"] if node["id"] not in doc_ids]
    graph["edges"] = [edge for edge in graph["edges"] if edge.get("source") not in doc_ids
                      and edge.get("target") not in doc_ids and edge.get("_origin") != "markdown-ast"]
    id_prefix = _make_id(str(ROOT)) + "_"
    docs = [ROOT / "README.md", ROOT / "AGENTS.md", *sorted((ROOT / "docs").glob("*.md"))]
    errors = []
    for path in docs:
        if not path.is_file() or path.is_symlink():
            continue
        result = extract_markdown(path)
        if result.get("error"):
            errors.append({"file": path.relative_to(ROOT).as_posix(), "error": result["error"]})
            continue
        for collection in ("nodes", "edges"):
            for item in result.get(collection, []):
                for field in ("id", "source", "target"):
                    if isinstance(item.get(field), str) and item[field].startswith(id_prefix):
                        item[field] = item[field][len(id_prefix):]
                if item.get("source_file"):
                    source = Path(item["source_file"])
                    if source.is_absolute():
                        if not source.resolve().is_relative_to(ROOT):
                            continue
                        item["source_file"] = source.relative_to(ROOT).as_posix()
                item["_origin"] = "markdown-ast"
                graph[collection].append(item)
    graph["nodes"] = list({node["id"]: node for node in graph["nodes"]}.values())
    graph_path.write_text(json.dumps(graph, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({"markdown_files": len(docs), "markdown_errors": errors}))
    if errors:
        raise SystemExit(1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--status", action="store_true")
    parser.add_argument("--docs-only", action="store_true", help=argparse.SUPPRESS)
    args = parser.parse_args()
    if args.docs_only:
        add_documents()
        return
    current = snapshot()
    if args.status:
        previous = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
        fresh = previous.get("files") == current and (OUT / "graph.json").exists()
        print(json.dumps({"fresh": fresh, "tracked_inputs": len(current), "rebuild": "npm run graph:build"}))
        raise SystemExit(0 if fresh else 2)
    if not shutil.which("graphify") or not shutil.which("uv"):
        raise SystemExit("Graphify/uv unavailable. Use focused rg reads; do not install or call a paid backend automatically.")
    # Force only regenerates the ignored navigation cache, pruning stale nodes.
    run(["graphify", "extract", ".", "--code-only", "--no-cluster", "--force", "--max-workers", "2"])
    tool_dir = Path(run(["uv", "tool", "dir"], capture=True).strip()) / "graphifyy"
    tool_python = tool_dir / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
    if not tool_python.is_file():
        raise SystemExit("Local Graphify Python environment unavailable; code graph exists, Markdown pass incomplete.")
    run([tool_python, Path(__file__).resolve(), "--docs-only"])
    # Preserve relation-bearing raw edges; clustering may collapse same-endpoint edges.
    shutil.copyfile(OUT / "graph.json", OUT / "graph.raw.json")
    run(["graphify", "cluster-only", ".", "--no-label"])
    graph = json.loads((OUT / "graph.json").read_text(encoding="utf-8"))
    raw = json.loads((OUT / "graph.raw.json").read_text(encoding="utf-8"))
    if raw.get("input_tokens", 0) or raw.get("output_tokens", 0):
        raise SystemExit("Unexpected LLM usage in graph output; inspect the local build before using it.")
    metadata = {"files": current, "mode": "code-and-markdown-ast-only", "llm_calls": 0,
                "nodes": len(graph["nodes"]), "edges": len(graph.get("links", graph.get("edges", []))),
                "raw_edges": len(raw["edges"]), "source_commit": run(["git", "rev-parse", "HEAD"], capture=True).strip()}
    MANIFEST.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(json.dumps({key: value for key, value in metadata.items() if key != "files"}))


if __name__ == "__main__":
    main()
