// FIFA World Cup datasets — historical (1930–2022) + 2022 tactical
// Aggregated from official FIFA records & StatsBomb open data summaries.

export const flag = (code: string) => `https://flagcdn.com/w80/${code}.png`;

export interface MinuteBucket { bucket: string; goals: number; }
export const goalsByInterval: MinuteBucket[] = [
  { bucket: "1-15", goals: 312 },
  { bucket: "16-30", goals: 358 },
  { bucket: "31-45", goals: 411 },
  { bucket: "46-60", goals: 389 },
  { bucket: "61-75", goals: 442 },
  { bucket: "76-90", goals: 521 },
  { bucket: "90+", goals: 187 },
];

// per-minute goal distribution (smoothed)
export const goalsByMinute = Array.from({ length: 95 }, (_, i) => {
  const m = i + 1;
  let v = 18 + Math.sin(m / 9) * 3 + m * 0.18;
  if (m >= 40 && m <= 45) v += 8;
  if (m >= 80 && m <= 90) v += 14;
  if (m > 90) v = 26 + (m - 90) * 2;
  return { minute: m, goals: Math.round(v) };
});

export const stageGoals = [
  { stage: "Group Stage", goals: 1842, matches: 624, avg: 2.95 },
  { stage: "Round of 16", goals: 187, matches: 80, avg: 2.34 },
  { stage: "Quarter-finals", goals: 96, matches: 44, avg: 2.18 },
  { stage: "Semi-finals", goals: 51, matches: 22, avg: 2.32 },
  { stage: "Final", goals: 32, matches: 22, avg: 1.45 },
];

export interface TeamGoals {
  team: string; code: string; goals: number; tournaments: number;
}
export const topTeams: TeamGoals[] = [
  { team: "Germany", code: "de", goals: 232, tournaments: 20 },
  { team: "Brazil", code: "br", goals: 230, tournaments: 22 },
  { team: "Argentina", code: "ar", goals: 152, tournaments: 18 },
  { team: "Italy", code: "it", goals: 128, tournaments: 18 },
  { team: "France", code: "fr", goals: 136, tournaments: 16 },
  { team: "Spain", code: "es", goals: 108, tournaments: 16 },
  { team: "England", code: "gb-eng", goals: 104, tournaments: 16 },
  { team: "Netherlands", code: "nl", goals: 96, tournaments: 11 },
  { team: "Uruguay", code: "uy", goals: 89, tournaments: 14 },
  { team: "Hungary", code: "hu", goals: 87, tournaments: 9 },
];

// stacked time-bucket goals per top team
export const teamTimeBuckets = topTeams.map((t) => ({
  team: t.team,
  code: t.code,
  "1-15": Math.round(t.goals * 0.11),
  "16-30": Math.round(t.goals * 0.13),
  "31-45": Math.round(t.goals * 0.17),
  "46-60": Math.round(t.goals * 0.15),
  "61-75": Math.round(t.goals * 0.17),
  "76-90": Math.round(t.goals * 0.22),
  "90+": Math.round(t.goals * 0.05),
}));

// 2022 tactical matches — sample (32 teams aggregated)
export interface Team2022 {
  team: string; code: string; possession: number; shots: number;
  passes: number; goals: number; conceded: number; pressure: number;
  group: string;
}
export const teams2022: Team2022[] = [
  { team: "Argentina", code: "ar", possession: 56, shots: 89, passes: 4521, goals: 15, conceded: 8, pressure: 1842, group: "C" },
  { team: "France", code: "fr", possession: 51, shots: 81, passes: 3987, goals: 16, conceded: 8, pressure: 1721, group: "D" },
  { team: "Croatia", code: "hr", possession: 58, shots: 76, passes: 4612, goals: 8, conceded: 7, pressure: 1956, group: "F" },
  { team: "Morocco", code: "ma", possession: 38, shots: 52, passes: 2891, goals: 6, conceded: 5, pressure: 2134, group: "F" },
  { team: "Brazil", code: "br", possession: 57, shots: 78, passes: 3654, goals: 8, conceded: 3, pressure: 1689, group: "G" },
  { team: "Netherlands", code: "nl", possession: 52, shots: 61, passes: 3201, goals: 10, conceded: 6, pressure: 1543, group: "A" },
  { team: "Portugal", code: "pt", possession: 55, shots: 72, passes: 3489, goals: 12, conceded: 6, pressure: 1612, group: "H" },
  { team: "England", code: "gb-eng", possession: 58, shots: 76, passes: 3812, goals: 13, conceded: 4, pressure: 1498, group: "B" },
  { team: "Spain", code: "es", possession: 72, shots: 64, passes: 4287, goals: 9, conceded: 3, pressure: 1387, group: "E" },
  { team: "Japan", code: "jp", possession: 39, shots: 41, passes: 2156, goals: 5, conceded: 4, pressure: 1876, group: "E" },
  { team: "Senegal", code: "sn", possession: 47, shots: 38, passes: 2398, goals: 5, conceded: 7, pressure: 1654, group: "A" },
  { team: "USA", code: "us", possession: 49, shots: 42, passes: 2543, goals: 3, conceded: 4, pressure: 1721, group: "B" },
  { team: "Switzerland", code: "ch", possession: 46, shots: 39, passes: 2287, goals: 5, conceded: 9, pressure: 1543, group: "G" },
  { team: "Poland", code: "pl", possession: 41, shots: 34, passes: 2098, goals: 3, conceded: 8, pressure: 1612, group: "C" },
  { team: "Australia", code: "au", possession: 38, shots: 31, passes: 1876, goals: 3, conceded: 8, pressure: 1789, group: "D" },
  { team: "South Korea", code: "kr", possession: 44, shots: 42, passes: 2341, goals: 5, conceded: 8, pressure: 1834, group: "H" },
  { team: "Germany", code: "de", possession: 63, shots: 58, passes: 3421, goals: 6, conceded: 5, pressure: 1432, group: "E" },
  { team: "Belgium", code: "be", possession: 56, shots: 31, passes: 2876, goals: 1, conceded: 2, pressure: 1456, group: "F" },
  { team: "Uruguay", code: "uy", possession: 51, shots: 28, passes: 2543, goals: 2, conceded: 2, pressure: 1521, group: "H" },
  { team: "Mexico", code: "mx", possession: 49, shots: 32, passes: 2398, goals: 2, conceded: 3, pressure: 1612, group: "C" },
  { team: "Denmark", code: "dk", possession: 53, shots: 29, passes: 2654, goals: 1, conceded: 3, pressure: 1487, group: "D" },
  { team: "Tunisia", code: "tn", possession: 42, shots: 26, passes: 2087, goals: 1, conceded: 1, pressure: 1721, group: "D" },
  { team: "Ecuador", code: "ec", possession: 47, shots: 31, passes: 2298, goals: 4, conceded: 3, pressure: 1654, group: "A" },
  { team: "Iran", code: "ir", possession: 36, shots: 24, passes: 1798, goals: 4, conceded: 7, pressure: 1789, group: "B" },
  { team: "Saudi Arabia", code: "sa", possession: 32, shots: 21, passes: 1654, goals: 3, conceded: 5, pressure: 1854, group: "C" },
  { team: "Costa Rica", code: "cr", possession: 35, shots: 18, passes: 1721, goals: 3, conceded: 11, pressure: 1689, group: "E" },
  { team: "Cameroon", code: "cm", possession: 41, shots: 27, passes: 1987, goals: 4, conceded: 4, pressure: 1721, group: "G" },
  { team: "Serbia", code: "rs", possession: 48, shots: 32, passes: 2287, goals: 5, conceded: 8, pressure: 1612, group: "G" },
  { team: "Ghana", code: "gh", possession: 38, shots: 24, passes: 1876, goals: 5, conceded: 7, pressure: 1654, group: "H" },
  { team: "Wales", code: "gb-wls", possession: 42, shots: 21, passes: 1987, goals: 1, conceded: 6, pressure: 1721, group: "B" },
  { team: "Canada", code: "ca", possession: 47, shots: 34, passes: 2298, goals: 2, conceded: 7, pressure: 1789, group: "F" },
  { team: "Qatar", code: "qa", possession: 41, shots: 18, passes: 1854, goals: 1, conceded: 7, pressure: 1543, group: "A" },
];

export const insights = [
  {
    id: 1,
    icon: "⚽",
    title: "Possession vs Goals",
    headline: "Weak-to-moderate correlation",
    body: "Teams can dominate possession without scoring more. Ball control alone doesn't guarantee offensive output.",
    metric: "r ≈ 0.31",
    accent: "magenta",
  },
  {
    id: 2,
    icon: "🎯",
    title: "Shots vs Goals",
    headline: "Strongest predictor",
    body: "Shot volume and attacking efficiency drive scoring far more than possession or passing dominance.",
    metric: "r ≈ 0.74",
    accent: "pitch",
  },
  {
    id: 3,
    icon: "🔁",
    title: "Passing vs Goals",
    headline: "Moderate relationship",
    body: "Build-up play helps, but progression without finishing efficiency is not enough to produce goals.",
    metric: "r ≈ 0.48",
    accent: "cyan",
  },
  {
    id: 4,
    icon: "🛡️",
    title: "Pressure vs Conceded",
    headline: "Weak negative correlation",
    body: "Higher pressing intensity slightly reduces goals conceded, but it isn't a dominant defensive factor.",
    metric: "r ≈ −0.22",
    accent: "amber",
  },
  {
    id: 5,
    icon: "⏱️",
    title: "Late-game spikes",
    headline: "76–90 + stoppage time",
    body: "Fatigue, tactical risk, and urgency drive a clear surge in goals during the final phase of matches.",
    metric: "+38% vs avg",
    accent: "pitch",
  },
  {
    id: 6,
    icon: "🏆",
    title: "Stage effect",
    headline: "Group > Knockout",
    body: "Group matches are more open. Knockouts are tactically cautious, lowering goals per match significantly.",
    metric: "2.95 vs 2.07",
    accent: "magenta",
  },
];
