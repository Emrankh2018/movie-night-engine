import { AccountController } from './controller';
import { gateways, publicConfig } from './supabase';

const config = publicConfig(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
const { auth,diary } = gateways(config);
export const accountController = new AccountController(auth,diary);
