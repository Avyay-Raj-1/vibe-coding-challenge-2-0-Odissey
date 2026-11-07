export function fmtDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function generatePlayerId(name: string, sport: string): string {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const sportCode = sport.slice(0, 3).toUpperCase();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${initials}-${sportCode}-${num}`;
}

export const SPORTS = [
  'Football', 'Cricket', 'Basketball', 'Volleyball',
  'Athletics', 'Kabaddi', 'Hockey', 'Badminton', 'Tennis', 'Wrestling'
];

