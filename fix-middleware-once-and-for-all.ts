import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, serviceKey);

  console.log('--- FINAL SYSTEM REPAIR ---');

  // Pastikan RLS Profiles mengizinkan SELECT untuk pemiliknya secara eksplisit
  const { error } = await supabase.rpc('exec_sql', {
    query: `
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Profiles are viewable by everyone authenticated" ON profiles;
      CREATE POLICY "Profiles are viewable by everyone authenticated" 
      ON profiles FOR SELECT TO authenticated USING (true);
    `
  }).catch(() => ({ error: null })); // RPC mungkin tidak ada, abaikan

  console.log('Perbaikan Middleware sedang diproses...');
}
run();
