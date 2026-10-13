import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { catalog } from '../catalog';
import type { Input } from '../catalog/schema';
import { eligibility } from '../engine/eligibility';
import { eligibleMovies, recommend, replacement, suggestAdjustment } from '../engine';
import type { EngineContext, Result } from '../engine/types';
import { addId, clearHistory, chooseGuest, seenGuest, readState, saveState } from '../storage';
import type { LocalState, StorageStatus } from '../storage';
import { number, translator } from '../i18n';
import { InputScreen } from '../components/InputScreens';
import { MovieCard } from '../components/MovieCard';
import { MovieArtwork } from '../components/MovieArtwork';
import { DiaryPanel } from '../components/DiaryPanel';
import { accountController } from '../diary/runtime';
import type { AccountState } from '../diary/controller';
import { diaryT } from '../diary/i18n';
import { guestImport, snapshot, today } from '../diary/guest';

type Slot = { pick: Result | null; replaced: boolean };
const headings = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'] as const;

export function App() {
  const account = useSyncExternalStore(accountController.subscribe,accountController.getSnapshot);
  const [diaryOpen,setDiaryOpen] = useState(window.location.pathname === '/auth/callback');
  useEffect(() => {
    void accountController.initialize();
    const refresh = () => { if (accountController.getSnapshot().identity) void accountController.reload(); };
    window.addEventListener('focus',refresh);
    return () => window.removeEventListener('focus',refresh);
  },[]);
  // Remount transient selection UI on an owner change; account history never goes into guest storage.
  return <PickerApp key={account.identity?.id ?? 'guest'} account={account} diaryOpen={diaryOpen} setDiaryOpen={setDiaryOpen} />;
}

function PickerApp({ account,diaryOpen,setDiaryOpen }: { account: AccountState; diaryOpen: boolean; setDiaryOpen: (open: boolean) => void }) {
  const [boot] = useState(() => readState());
  const [local,setLocal] = useState(boot.state);
  const [storageStatus,setStorageStatus] = useState<StorageStatus>(boot.status);
  const [step,setStep] = useState(0);
  const [slots,setSlots] = useState<Slot[]>([]);
  const [clock,setClock] = useState(() => new Date());
  const [chosenId,setChosenId] = useState<string | null>(null);
  const [privateRejected,setPrivateRejected] = useState<string[]>([]);
  const [notice,setNotice] = useState('');
  const [modal,setModal] = useState<'clear' | 'availability' | 'import' | 'delete' | 'clearPrivate' | null>(null);
  const [privateRewatch,setPrivateRewatch] = useState(false);
  const [deleteId,setDeleteId] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [sessionNumber,setSessionNumber] = useState(0);
  const input = account.identity ? { ...local.preferences,excludeWatched: !privateRewatch } : local.preferences;
  const t = translator(input.locale);
  const dt = diaryT(input.locale);
  const watchedIds = account.identity ? [...new Set(account.entries.filter(entry => entry.status === 'watched').map(entry => entry.movie_id))] : local.watchedIds;
  const imports = guestImport(local,catalog.movies,catalog.version);

  useEffect(() => { document.documentElement.lang = input.locale; document.documentElement.dir = input.locale === 'ar' ? 'rtl' : 'ltr'; document.title = t('brand'); }, [input.locale,t]);
  useEffect(() => { heading.current?.focus(); window.scrollTo({ top: 0, behavior: 'instant' }); }, [step,diaryOpen]);
  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()),1000);
    return () => window.clearInterval(timer);
  },[]);
  useEffect(() => {
    if (modal) modalRef.current?.showModal();
    else { modalRef.current?.close(); trigger.current?.focus(); }
  },[modal]);

  function persist(state: LocalState) {
    setLocal(state);
    if (storageStatus !== 'future' && !saveState(state)) setStorageStatus('unavailable');
  }
  function update(patch: Partial<Input>) {
    const saved = { ...patch };
    if (account.identity && saved.excludeWatched !== undefined) { setPrivateRewatch(!saved.excludeWatched); delete saved.excludeWatched; }
    persist({ ...local, preferences: { ...local.preferences,...saved } }); setNotice('');
  }
  function context(state = local,rejected = account.identity ? privateRejected : state.rejectedIds): EngineContext { return { now: new Date(), watchedIds: account.identity ? watchedIds : state.watchedIds, rejectedIds: rejected, seed: `session-${sessionNumber}` }; }
  function finish(preferences = input) {
    if (account.identity && !account.historyReady) { setNotice(dt('historyFailed')); return; }
    if (account.phase === 'restoring' || account.phase === 'signing-out') { setNotice(dt('restoring')); return; }
    const answer = recommend(catalog,preferences,context());
    setSlots(answer.picks.map(pick => ({ pick, replaced: false })));
    setChosenId(null); setNotice(''); setStep(7);
  }
  function start() { setSessionNumber(sessionNumber + 1); setNotice(''); setStep(1); }
  function navigateNext() { if (step === 6) finish(); else setStep(step + 1); }
  function openModal(value: 'clear' | 'availability' | 'import' | 'delete' | 'clearPrivate') { trigger.current = document.activeElement as HTMLElement; setModal(value); }
  function openDiary() { setDiaryOpen(true); if (account.identity) void accountController.reload(); else void accountController.checkGoogle(); }
  async function choose(index: number) {
    if (account.busy || account.phase === 'restoring' || account.phase === 'signing-out') return;
    const pick = slots[index].pick;
    if (!pick) return;
    const movie = catalog.movies.find(movie => movie.id === pick.movieId)!;
    if (eligibility(movie,input,catalog.availability,context()).length) {
      setSlots(slots.map((slot,i) => i === index ? { ...slot, pick: null } : slot));
      setNotice(t('emptyCopy')); return;
    }
    if (account.identity) {
      if (!await accountController.choose(snapshot(movie,catalog.version))) return;
      setChosenId(pick.movieId); setNotice(dt('saved'));
    } else { persist(chooseGuest(local,pick.movieId)); setChosenId(pick.movieId); setNotice(t('chosenNote')); }
  }
  async function markSeen(index: number) {
    if (account.busy || account.phase === 'restoring' || account.phase === 'signing-out') return;
    const pick = slots[index].pick;
    if (!pick) return;
    if (account.identity) {
      const movie = catalog.movies.find(movie => movie.id === pick.movieId)!;
      if (!await accountController.seen(snapshot(movie,catalog.version),today())) return;
    } else persist(seenGuest(local,pick.movieId,today()));
    if (input.excludeWatched) setSlots(slots.map((slot,i) => i === index ? { ...slot, pick: null } : slot));
    if (chosenId === pick.movieId) setChosenId(null);
    setNotice(account.identity ? dt('seenSaved') : t('seenNote'));
  }
  function replace(index: number) {
    const slot = slots[index];
    if (slot.replaced || !slot.pick) return;
    const state = { ...local, rejectedIds: addId(account.identity ? privateRejected : local.rejectedIds,slot.pick.movieId) };
    const ids = slots.flatMap(slot => slot.pick ? [slot.pick.movieId] : []);
    const pick = replacement(catalog,input,context(state,state.rejectedIds),ids);
    // Exhaustion retains the valid original and does not record it as rejected.
    if (!pick) { setSlots(slots.map((slot,i) => i === index ? { ...slot, replaced: true } : slot)); setNotice(t('exhausted')); return; }
    if (account.identity) setPrivateRejected(state.rejectedIds); else persist(state);
    setSlots(slots.map((slot,i) => i === index ? { pick, replaced: true } : slot));
    if (chosenId === slot.pick.movieId) setChosenId(null);
    setNotice(t('replaceNote'));
  }

  const renderContext: EngineContext = { now: clock, watchedIds, rejectedIds: account.identity ? privateRejected : local.rejectedIds, seed: `session-${sessionNumber}` };
  const visibleSlots = slots.map((slot,index) => ({ slot,index })).filter(({ slot }) => slot.pick
    && eligibility(catalog.movies.find(movie => movie.id === slot.pick!.movieId)!,input,catalog.availability,renderContext).length === 0);
  const eligibleCount = eligibleMovies(catalog,input,renderContext).length;
  const adjustment = suggestAdjustment(catalog,input,renderContext);
  function adjust() {
    if (adjustment.kind === 'review') { setStep(6); return; }
    const preferences = adjustment.kind === 'availability' ? { ...input, availabilityMode: 'self-check' as const } : { ...input, maxRuntimeMinutes: adjustment.minutes };
    persist({ ...local, preferences }); finish(preferences);
  }
  const warning = storageStatus === 'recovered' ? t('storageRecovered') : storageStatus === 'unavailable' ? t('storageUnavailable') : storageStatus === 'future' ? t('storageFuture') : null;
  const strictMissing = input.availabilityMode === 'strict' && input.providerIds.length === 0;

  return <>
    <header className="site-header"><a className="brand" href="#" onClick={event => { event.preventDefault(); setDiaryOpen(false); setStep(0); }}><svg className="brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="1" y="1" width="38" height="38" rx="12" stroke="currentColor" /><path d="M16 12L29 20L16 28V12Z" fill="currentColor" /><circle cx="10" cy="10" r="2" fill="currentColor" /><circle cx="30" cy="30" r="2" fill="currentColor" /></svg><span className="brand-copy">{t('brand')}<span>{t('brandSmall')}</span></span></a>
      <div className="header-actions"><button className="text-button language-button" onClick={() => update({ locale: input.locale === 'en' ? 'ar' : 'en' })}>{input.locale === 'en' ? 'العربية' : 'English'}</button><button className="text-button" onClick={() => openModal(account.identity ? 'clearPrivate' : 'clear')}>{account.identity ? dt('clear') : t('clear')}</button><button className="secondary account-button" onClick={openDiary}>{dt('title')}</button></div>
    </header>
    <main id="main-content">
      <aside className="demo-banner"><span className="demo-dot" aria-hidden="true" /><strong>{t('demo')}</strong><details><summary>{t('demoAbout')}</summary><p>{t('demoDetail')}</p></details></aside>
      {warning && <p className="notice warning" role="status">{warning}</p>}
      {notice && <p className="notice" role="status">{notice}</p>}
      {account.error && !diaryOpen && <p className="notice" role="status">{dt(account.error)}</p>}
      {diaryOpen ? <DiaryPanel headingRef={heading} account={account} controller={accountController} locale={input.locale} guestCount={imports.length} onBack={() => setDiaryOpen(false)} onImport={() => openModal('import')} onClear={() => openModal('clearPrivate')} onDelete={id => { setDeleteId(id); openModal('delete'); }} /> : step === 0 ? <section className="landing"><div className="landing-copy"><h1 ref={heading} tabIndex={-1}>{t('startTitle')}</h1><p className="lead">{t('startCopy')}</p><button className="primary hero-cta" onClick={start}><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6 3L16 10L6 17V3Z" fill="currentColor" /></svg>{t('start')}</button><p className="hero-note">{t('heroNote')}</p><p className="privacy">{dt('guests')}</p></div>
        <div className="cover-gallery" aria-label={t('coverLabel')}><div className="gallery-orbit" aria-hidden="true" />{[catalog.movies[7],catalog.movies[3],catalog.movies[0]].map(movie => <div className="gallery-cover" key={movie.id}><MovieArtwork movie={movie} locale={input.locale} /></div>)}<span className="gallery-caption">{t('coverLabel')}</span></div>
      </section> : step <= 6 ? <div className="flow-layout"><aside className="flow-overview"><p className="overview-title">{t('flowAside')}</p><ol>{headings.map((key,index) => <li key={key} className={step === index + 1 ? 'active-step' : step > index + 1 ? 'complete-step' : ''} aria-current={step === index + 1 ? 'step' : undefined}><span>{number(index + 1,input.locale)}</span>{t(key)}</li>)}</ol><p className="privacy">{account.identity ? dt('intro') : dt('guests')}</p></aside><section className="flow"><div className="progress"><span>{t('step')} {number(step,input.locale)} {t('of')} {number(6,input.locale)}</span><progress max={6} value={step} aria-label={`${t('step')} ${step}`} /></div>
        <h1 ref={heading} tabIndex={-1}>{t(headings[step - 1])}</h1>
        <InputScreen step={step} input={input} update={update} />
        {strictMissing && step >= 4 && <p className="notice" role="status">{t('chooseProvider')}</p>}
        <nav className="flow-actions" aria-label={input.locale === 'en' ? 'Steps' : 'الخطوات'}><button className="secondary" onClick={() => { setNotice(''); setStep(step - 1); }}>{t('back')}</button><button className="primary" disabled={step >= 4 && strictMissing} onClick={navigateNext}>{step === 6 ? t('finish') : t('next')}</button></nav>
      </section></div> : <section className="results">
        <div className="results-heading"><div><h1 ref={heading} tabIndex={-1}>{visibleSlots.length ? t('resultsTitle') : t('emptyTitle')}</h1><p className="lead">{visibleSlots.length ? t('resultIntro') : t('emptyCopy')}</p></div><button className="secondary" onClick={() => setStep(1)}>{t('edit')}</button></div>
        <label className="rewatch-control"><input type="checkbox" checked={!input.excludeWatched} onChange={() => { const preferences = { ...input,excludeWatched: !input.excludeWatched }; update({ excludeWatched: preferences.excludeWatched }); finish(preferences); }} />{dt('rewatch')}</label><p className="help">{dt('rewatchHelp')}</p>
        {visibleSlots.length > 0 && visibleSlots.length < 3 && <p className="notice">{t('fewer')}</p>}
        {visibleSlots.length > 0 && <div className="result-context"><span>{t(input.mood)}</span><span>{number(input.maxRuntimeMinutes + (input.allowOverrun ? 10 : 0),input.locale)} {t('minutes')}</span><span>{t(input.watchingMode)}</span><span>{t(input.countryCode)}</span><p>{number(eligibleCount,input.locale)} {t('eligible')}</p></div>}
        {visibleSlots.length === 0 ? <div className="empty-panel"><button className="primary" onClick={adjust}>{adjustment.kind === 'availability' ? t('adjustAvailability') : adjustment.kind === 'runtime' ? `${t('adjustRuntime')} ${number(adjustment.minutes,input.locale)} ${t('minutes')}` : t('adjustReview')}</button></div> : <div className="movie-grid">
          {visibleSlots.map(({ slot,index },displayIndex) => <MovieCard key={`${index}:${slot.pick!.movieId}`} movie={catalog.movies.find(movie => movie.id === slot.pick!.movieId)!}
            result={slot.pick!} input={input} now={clock.getTime()} index={displayIndex} busy={account.busy || !!account.identity && !account.historyReady} chosen={chosenId === slot.pick!.movieId || account.entries.some(entry => entry.movie_id === slot.pick!.movieId && entry.status === 'chosen')} seen={watchedIds.includes(slot.pick!.movieId)} replaced={slot.replaced}
            onChoose={() => { void choose(index); }} onSeen={() => { void markSeen(index); }} onReplace={() => replace(index)} onCheck={() => openModal('availability')} />)}
        </div>}
      </section>}
      {!account.identity && <details className="history"><summary>{t('history')}<span>{number(local.watchedIds.length,input.locale)} {t('watchedCount')} · {number(local.selectedIds.length,input.locale)} {t('selectedCount')} · {number(local.rejectedIds.length,input.locale)} {t('rejectedCount')}</span></summary><p className="help">{dt('guests')}</p>{local.watchedIds.length ? <ul>{local.watchedIds.map(id => <li key={id}>{catalog.movies.find(movie => movie.id === id)?.titles[input.locale] ?? id}</li>)}</ul> : <p>{t('historyEmpty')}</p>}</details>}
    </main>
    <footer>{t('footer')}</footer>
    <dialog ref={modalRef} onCancel={event => { event.preventDefault(); setModal(null); }} onClose={() => setModal(null)} aria-labelledby="dialog-title">
      <h2 id="dialog-title">{modal === 'clear' ? t('clear') : modal === 'import' ? dt('import') : modal === 'delete' ? dt('delete') : modal === 'clearPrivate' ? dt('clear') : t('checkAction')}</h2><p>{modal === 'clear' ? t('clearConfirm') : modal === 'import' ? dt('importConfirm') : modal === 'delete' ? dt('deleteConfirm') : modal === 'clearPrivate' ? dt('clearConfirm') : t('checkHelp')}</p><div className="dialog-actions">
        <button className="secondary" autoFocus disabled={account.busy} onClick={() => setModal(null)}>{modal === 'availability' ? t('close') : t('cancel')}</button>
        {modal === 'clear' && <button className="primary" onClick={() => { persist(clearHistory(local)); setChosenId(null); setSlots([]); setStep(0); setNotice(t('cleared')); setModal(null); }}>{t('confirmClear')}</button>}
        {modal === 'import' && <button className="primary" disabled={account.busy} onClick={async () => { persist(local); const result = await accountController.import(imports); if (result) { setNotice(dt('importDone').replace('{inserted}',number(result.inserted,input.locale)).replace('{skipped}',number(result.skipped,input.locale))); setModal(null); } }}>{dt('importConfirmButton')}</button>}
        {modal === 'delete' && <button className="primary" disabled={account.busy} onClick={async () => { if (deleteId && await accountController.delete(deleteId)) setModal(null); }}>{dt('deleteConfirmButton')}</button>}
        {modal === 'clearPrivate' && <button className="primary" disabled={account.busy} onClick={async () => { if (await accountController.clear()) { setChosenId(null); setNotice(dt('cleared')); setModal(null); } }}>{dt('clearConfirmButton')}</button>}
      </div>
    </dialog>
  </>;
}
