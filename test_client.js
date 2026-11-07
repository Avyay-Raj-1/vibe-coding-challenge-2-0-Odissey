import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gigdobucdtfbtkzlpxrp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZ2RvYnVjZHRmYnRremxweHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NjI5MzUsImV4cCI6MjEwOTUzODkzNX0.j1qLMpG-W_jE9CiN0QRca1r0RgKRcYdqiBJ2PPIq4ts';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('players').select('*');
  console.log('Players query:', { data, error });
}

test();

