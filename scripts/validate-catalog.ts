import { fixtureCatalog } from '../data/fixtures/catalog';
import { catalogSchema } from '../src/catalog/schema';

const result = catalogSchema.safeParse(fixtureCatalog);
if (!result.success) {
  console.error(result.error.message);
  process.exitCode = 1;
} else {
  console.log(`Validated ${result.data.movies.length} synthetic movies and ${result.data.availability.length} simulated availability records (${result.data.version}).`);
}
