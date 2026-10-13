import { fixtureCatalog } from '../../data/fixtures/catalog';
import { catalogSchema } from './schema';

// Curated mode loads reviewed bundled fixtures. No real-data/network adapter exists.
export const CATALOG_MODE = 'curated' as const;
export const catalog = catalogSchema.parse(fixtureCatalog);
