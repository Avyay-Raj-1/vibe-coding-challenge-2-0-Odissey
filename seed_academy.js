import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gigdobucdtfbtkzlpxrp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZ2RvYnVjZHRmYnRremxweHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NjI5MzUsImV4cCI6MjEwOTUzODkzNX0.j1qLMpG-W_jE9CiN0QRca1r0RgKRcYdqiBJ2PPIq4ts';
const token = process.env.SUPABASE_ACCESS_TOKEN || '';
const projectRef = process.env.SUPABASE_PROJECT_ID || 'gigdobucdtfbtkzlpxrp';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runSql(query) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  const res = await response.text();
  return res;
}

async function seed() {
  console.log('Seeding Dumka Sports Academy ready-made dataset...');

  // 1. Create or confirm Player auth user
  let playerAuthId = null;
  const { data: signUpData, error: sErr } = await supabase.auth.signUp({
    email: 'player@academydesk.in',
    password: 'Player@1234'
  });

  if (signUpData?.user) {
    playerAuthId = signUpData.user.id;
  } else {
    // Already exists, fetch auth_id
    const sqlRes = await runSql("SELECT id FROM auth.users WHERE email = 'player@academydesk.in';");
    const parsed = JSON.parse(sqlRes);
    if (parsed[0]?.id) playerAuthId = parsed[0].id;
  }

  // Auto-confirm all users
  await runSql("UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;");

  // 2. Clear previous test data cleanly
  const truncRes = await runSql(`
    TRUNCATE TABLE public.match_participants, public.matches, public.attendance, public.sessions, public.players CASCADE;
  `);
  console.log('Truncate result:', truncRes);

  // 3. Insert real Dumka sports academy players
  const players = [
    { player_id: 'PLY-101', name: 'Rohit Soren', age: 17, sport: 'Football', joining_date: '2026-06-15', active: true },
    { player_id: 'PLY-102', name: 'Manoj Marandi', age: 18, sport: 'Football', joining_date: '2026-07-01', active: true },
    { player_id: 'PLY-103', name: 'Sunita Hansda', age: 16, sport: 'Football', joining_date: '2026-08-10', active: true },
    { player_id: 'PLY-104', name: 'Vikash Murmu', age: 19, sport: 'Cricket', joining_date: '2026-05-20', active: true },
    { player_id: 'PLY-105', name: 'Deepak Besra', age: 17, sport: 'Cricket', joining_date: '2026-06-11', active: true },
    { player_id: 'PLY-106', name: 'Priya Hembrom', age: 16, sport: 'Athletics', joining_date: '2026-04-18', active: true },
    { player_id: 'PLY-107', name: 'Rajesh Tudu', age: 18, sport: 'Kabaddi', joining_date: '2026-07-22', active: true },
    { player_id: 'PLY-108', name: 'Anjali Kisku', age: 17, sport: 'Badminton', joining_date: '2026-09-01', active: true },
  ];

  await supabase.from('players').insert(players);
  console.log('✓ Inserted 8 academy players');

  // Link Rohit Soren to player@academydesk.in
  await runSql(`
    DELETE FROM public.profiles WHERE email = 'player@academydesk.in';
    INSERT INTO public.profiles (auth_id, email, name, role, player_id)
    VALUES ('${playerAuthId}', 'player@academydesk.in', 'Rohit Soren', 'player', 'PLY-101');
  `);
  console.log('✓ Linked player@academydesk.in to Rohit Soren (PLY-101)');

  // 4. Create Sessions
  // Football Sessions
  const { data: sFoot1, error: sf1Err } = await supabase.from('sessions').insert({
    session_date: '2026-11-01', sport: 'Football', status: 'OPEN', created_by: 'coach'
  }).select().single();
  if (sf1Err) console.error('sFoot1 error:', sf1Err);
  await supabase.from('attendance').insert([
    { session_id: sFoot1.id, player_id: 'PLY-101', status: 'PRESENT' },
    { session_id: sFoot1.id, player_id: 'PLY-102', status: 'PRESENT' },
    { session_id: sFoot1.id, player_id: 'PLY-103', status: 'PRESENT' }
  ]);
  await supabase.from('sessions').update({ status: 'CLOSED', closed_at: '2026-11-01T10:00:00Z' }).eq('id', sFoot1.id);

  const { data: sFoot2 } = await supabase.from('sessions').insert({
    session_date: '2026-11-03', sport: 'Football', status: 'OPEN', created_by: 'coach'
  }).select().single();
  await supabase.from('attendance').insert([
    { session_id: sFoot2.id, player_id: 'PLY-101', status: 'PRESENT' },
    { session_id: sFoot2.id, player_id: 'PLY-102', status: 'ABSENT' },
    { session_id: sFoot2.id, player_id: 'PLY-103', status: 'PRESENT' }
  ]);
  await supabase.from('sessions').update({ status: 'CLOSED', closed_at: '2026-11-03T10:00:00Z' }).eq('id', sFoot2.id);

  const { data: sFoot3 } = await supabase.from('sessions').insert({
    session_date: '2026-11-05', sport: 'Football', status: 'OPEN', created_by: 'coach'
  }).select().single();
  await supabase.from('attendance').insert([
    { session_id: sFoot3.id, player_id: 'PLY-101', status: 'PRESENT' },
    { session_id: sFoot3.id, player_id: 'PLY-102', status: 'PRESENT' },
    { session_id: sFoot3.id, player_id: 'PLY-103', status: 'ABSENT' }
  ]);
  await supabase.from('sessions').update({ status: 'CLOSED', closed_at: '2026-11-05T10:00:00Z' }).eq('id', sFoot3.id);

  // Cricket Sessions
  const { data: sCric1 } = await supabase.from('sessions').insert({
    session_date: '2026-11-02', sport: 'Cricket', status: 'OPEN', created_by: 'coach'
  }).select().single();
  await supabase.from('attendance').insert([
    { session_id: sCric1.id, player_id: 'PLY-104', status: 'PRESENT' },
    { session_id: sCric1.id, player_id: 'PLY-105', status: 'PRESENT' }
  ]);
  await supabase.from('sessions').update({ status: 'CLOSED', closed_at: '2026-11-02T11:00:00Z' }).eq('id', sCric1.id);

  const { data: sCric2 } = await supabase.from('sessions').insert({
    session_date: '2026-11-04', sport: 'Cricket', status: 'OPEN', created_by: 'coach'
  }).select().single();
  await supabase.from('attendance').insert([
    { session_id: sCric2.id, player_id: 'PLY-104', status: 'PRESENT' },
    { session_id: sCric2.id, player_id: 'PLY-105', status: 'ABSENT' }
  ]);
  await supabase.from('sessions').update({ status: 'CLOSED', closed_at: '2026-11-04T11:00:00Z' }).eq('id', sCric2.id);

  // Athletics Sessions
  const { data: sAth1 } = await supabase.from('sessions').insert({
    session_date: '2026-11-02', sport: 'Athletics', status: 'OPEN', created_by: 'coach'
  }).select().single();
  await supabase.from('attendance').insert([
    { session_id: sAth1.id, player_id: 'PLY-106', status: 'PRESENT' }
  ]);
  await supabase.from('sessions').update({ status: 'CLOSED', closed_at: '2026-11-02T08:00:00Z' }).eq('id', sAth1.id);

  const { data: sAth2 } = await supabase.from('sessions').insert({
    session_date: '2026-11-04', sport: 'Athletics', status: 'OPEN', created_by: 'coach'
  }).select().single();
  await supabase.from('attendance').insert([
    { session_id: sAth2.id, player_id: 'PLY-106', status: 'PRESENT' }
  ]);
  await supabase.from('sessions').update({ status: 'CLOSED', closed_at: '2026-11-04T08:00:00Z' }).eq('id', sAth2.id);

  // Today's Open Practice Session (Football) for immediate coach testing
  const todayStr = new Date().toISOString().slice(0, 10);
  await supabase.from('sessions').insert({
    session_date: todayStr, sport: 'Football', status: 'OPEN', created_by: 'coach'
  });
  console.log('✓ Created 7 practice sessions (6 closed + 1 open today)');

  // 5. Create Matches
  // Match 1: Football vs Dumka Tigers FC (Session 1)
  const { data: m1 } = await supabase.from('matches').insert({
    match_date: '2026-11-01', sport: 'Football', opponent: 'Dumka Tigers FC', session_id: sFoot1.id
  }).select().single();
  await supabase.from('match_participants').insert([
    { match_id: m1.id, player_id: 'PLY-101', score: 8.5 },
    { match_id: m1.id, player_id: 'PLY-102', score: 7.0 },
    { match_id: m1.id, player_id: 'PLY-103', score: 8.0 }
  ]);

  // Match 2: Football vs Deoghar Warriors (Session 3)
  const { data: m2 } = await supabase.from('matches').insert({
    match_date: '2026-11-05', sport: 'Football', opponent: 'Deoghar Warriors', session_id: sFoot3.id
  }).select().single();
  await supabase.from('match_participants').insert([
    { match_id: m2.id, player_id: 'PLY-101', score: 9.2 },
    { match_id: m2.id, player_id: 'PLY-102', score: 7.5 }
    // PLY-103 was ABSENT in Session 3, so not added!
  ]);

  // Match 3: Cricket vs Ranchi Strikers (Session 1)
  const { data: m3 } = await supabase.from('matches').insert({
    match_date: '2026-11-02', sport: 'Cricket', opponent: 'Ranchi Strikers', session_id: sCric1.id
  }).select().single();
  await supabase.from('match_participants').insert([
    { match_id: m3.id, player_id: 'PLY-104', score: 76.0 },
    { match_id: m3.id, player_id: 'PLY-105', score: 42.0 }
  ]);

  // Match 4: Cricket vs Dhanbad Champions (Session 2)
  const { data: m4 } = await supabase.from('matches').insert({
    match_date: '2026-11-04', sport: 'Cricket', opponent: 'Dhanbad Champions', session_id: sCric2.id
  }).select().single();
  await supabase.from('match_participants').insert([
    { match_id: m4.id, player_id: 'PLY-104', score: 88.0 }
  ]);

  // Match 5: Athletics vs State District Championship (Session 1 & 2)
  const { data: m5 } = await supabase.from('matches').insert({
    match_date: '2026-11-02', sport: 'Athletics', opponent: 'State District Meet', session_id: sAth1.id
  }).select().single();
  await supabase.from('match_participants').insert([
    { match_id: m5.id, player_id: 'PLY-106', score: 9.5 }
  ]);

  const { data: m6 } = await supabase.from('matches').insert({
    match_date: '2026-11-04', sport: 'Athletics', opponent: 'Inter-Academy Sprint', session_id: sAth2.id
  }).select().single();
  await supabase.from('match_participants').insert([
    { match_id: m6.id, player_id: 'PLY-106', score: 9.8 }
  ]);

  console.log('✓ Inserted 6 real matches and performance scores');

  // 6. Check readiness results
  const { data: readiness } = await supabase.from('player_readiness_view').select('player_id, name, sport, attendance_percentage, matches_played, readiness_status');
  console.log('\n--- LIVE READINESS RESULTS ---');
  console.table(readiness);
  console.log('\nSeed completed successfully!');
}

seed().catch(console.error);
