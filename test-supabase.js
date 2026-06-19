const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, slug, name, sort_order), brands(id, slug, name, sort_order)")
    .limit(1);
  console.dir(data, { depth: null });
  console.error("Error:", error);
}
run();
