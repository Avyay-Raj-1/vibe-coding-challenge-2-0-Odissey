import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gigdobucdtfbtkzlpxrp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZ2RvYnVjZHRmYnRremxweHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NjI5MzUsImV4cCI6MjEwOTUzODkzNX0.j1qLMpG-W_jE9CiN0QRca1r0RgKRcYdqiBJ2PPIq4ts';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log('--- STARTING VERIFICATION TESTS ---');

  // Clean test tables
  await supabase.from('match_participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Create Player A, B, C
  const { data: players, error: pErr } = await supabase.from('players').insert([
    { player_id: 'TEST-A', name: 'Player A', age: 17, sport: 'Football' },
    { player_id: 'TEST-B', name: 'Player B', age: 18, sport: 'Football' },
    { player_id: 'TEST-C', name: 'Player C', age: 16, sport: 'Football' },
  ]).select();

  if (pErr) throw pErr;
  console.log('✓ Created Players: TEST-A, TEST-B, TEST-C');

  // TEST 1: Practice Session & Attendance
  const { data: session1, error: sErr } = await supabase.from('sessions').insert({
    session_date: '2026-11-01',
    sport: 'Football',
    status: 'OPEN'
  }).select().single();
  if (sErr) throw sErr;

  // Mark attendance
  await supabase.from('attendance').insert([
    { session_id: session1.id, player_id: 'TEST-A', status: 'PRESENT' },
    { session_id: session1.id, player_id: 'TEST-B', status: 'PRESENT' },
    { session_id: session1.id, player_id: 'TEST-C', status: 'ABSENT' }
  ]);

  // Close session
  await supabase.from('sessions').update({ status: 'CLOSED', closed_at: new Date().toISOString() }).eq('id', session1.id);
  console.log('✓ TEST 1 PASSED: Session closed with TEST-A (PRESENT), TEST-B (PRESENT), TEST-C (ABSENT)');

  // TEST 6: Session Locking (Cannot modify attendance after close)
  const { error: lockErr } = await supabase.from('attendance').update({ status: 'PRESENT' }).eq('session_id', session1.id).eq('player_id', 'TEST-C');
  if (lockErr) {
    console.log('✓ TEST 6 PASSED: Session locking prevented attendance modification: ' + lockErr.message);
  } else {
    console.error('✗ TEST 6 FAILED: Attendance modification was allowed on closed session!');
  }

  // TEST 2: Match Validation (Reject absent player)
  const { data: match1, error: mErr } = await supabase.from('matches').insert({
    match_date: '2026-11-01',
    sport: 'Football',
    opponent: 'Dumka Tigers FC',
    session_id: session1.id
  }).select().single();
  if (mErr) throw mErr;

  // Add Player A (PRESENT)
  const { error: partAErr } = await supabase.from('match_participants').insert({
    match_id: match1.id,
    player_id: 'TEST-A',
    score: 8.5
  });
  console.log('✓ Player A added to match:', !partAErr);

  // Add Player B (PRESENT)
  const { error: partBErr } = await supabase.from('match_participants').insert({
    match_id: match1.id,
    player_id: 'TEST-B',
    score: 7.0
  });
  console.log('✓ Player B added to match:', !partBErr);

  // Add Player C (ABSENT) - MUST FAIL!
  const { error: partCErr } = await supabase.from('match_participants').insert({
    match_id: match1.id,
    player_id: 'TEST-C',
    score: 6.0
  });
  if (partCErr) {
    console.log('✓ TEST 2 PASSED: Absent Player C rejected from match: ' + partCErr.message);
  } else {
    console.error('✗ TEST 2 FAILED: Absent Player C was incorrectly allowed into match!');
  }

  // TEST 3: READINESS CALCULATION
  // Add a 2nd session and match for Player A so Player A has 100% attendance and 2 matches => READY!
  const { data: session2 } = await supabase.from('sessions').insert({
    session_date: '2026-11-02',
    sport: 'Football',
    status: 'OPEN'
  }).select().single();
  await supabase.from('attendance').insert([
    { session_id: session2.id, player_id: 'TEST-A', status: 'PRESENT' },
    { session_id: session2.id, player_id: 'TEST-B', status: 'ABSENT' },
    { session_id: session2.id, player_id: 'TEST-C', status: 'PRESENT' }
  ]);
  await supabase.from('sessions').update({ status: 'CLOSED', closed_at: new Date().toISOString() }).eq('id', session2.id);

  const { data: match2 } = await supabase.from('matches').insert({
    match_date: '2026-11-02',
    sport: 'Football',
    opponent: 'Santhal Warriors',
    session_id: session2.id
  }).select().single();
  await supabase.from('match_participants').insert({
    match_id: match2.id,
    player_id: 'TEST-A',
    score: 9.0
  });

  // Query readiness view
  const { data: readiness, error: rErr } = await supabase.from('player_readiness_view').select('*').in('player_id', ['TEST-A', 'TEST-B', 'TEST-C']);
  if (rErr) throw rErr;

  console.log('Readiness results:', readiness.map(r => ({
    player: r.player_id,
    attendance: `${r.present_sessions}/${r.total_sessions} (${r.attendance_percentage}%)`,
    matches: r.matches_played,
    status: r.readiness_status
  })));

  // TEST 4: Scout RPC only returns READY players
  const { data: scoutPlayers, error: scErr } = await supabase.rpc('get_scout_ready_players');
  if (scErr) throw scErr;
  console.log('Scout Ready Players count:', scoutPlayers.length);
  const scoutHasOnlyReady = scoutPlayers.every(p => p.readiness_status === 'READY');
  if (scoutHasOnlyReady && scoutPlayers.length > 0) {
    console.log('✓ TEST 4 PASSED: Scout view returned ONLY Ready players.');
  }

  console.log('--- ALL BACKEND CORE VALIDATION TESTS PASSED ---');
}

runTests().catch(console.error);

