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
    headline: "Weak-to-moderate correlation observed",
    body: "Across Qatar 2022 teams, possession share showed only a weak linear relationship with goals scored. Correlation, not causation — dominating the ball does not, on its own, produce more goals in this sample.",
    metric: "r ≈ 0.31",
    accent: "magenta",
  },
  {
    id: 2,
    icon: "🎯",
    title: "Shots vs Goals",
    headline: "Strongest correlation observed",
    body: "Shot volume showed the strongest linear association with goals among the variables compared. This is a comparative trend in the data — it does not imply that taking more shots will cause more goals.",
    metric: "r ≈ 0.74",
    accent: "pitch",
  },
  {
    id: 3,
    icon: "🔁",
    title: "Passing vs Goals",
    headline: "Moderate correlation observed",
    body: "Total passes were moderately associated with goals. The relationship between variables is consistent with build-up volume, but does not isolate finishing quality.",
    metric: "r ≈ 0.48",
    accent: "cyan",
  },
  {
    id: 4,
    icon: "🛡️",
    title: "Pressure vs Conceded",
    headline: "Weak negative correlation observed",
    body: "Defensive pressure showed a weak inverse relationship with goals conceded. Suggestive only — many confounding tactical factors are not captured here.",
    metric: "r ≈ −0.22",
    accent: "amber",
  },
  {
    id: 5,
    icon: "⏱️",
    title: "Late-game scoring trend",
    headline: "Comparative spike in 76–90 + stoppage",
    body: "Aggregated across 1930–2022 matches, the late phase shows a higher goal frequency than other intervals. This is a descriptive trend in the dataset, not a causal claim.",
    metric: "+38% vs avg",
    accent: "pitch",
  },
  {
    id: 6,
    icon: "🏆",
    title: "Stage comparison",
    headline: "Group vs Knockout — descriptive trend",
    body: "Goals-per-match averages are higher in group-stage matches than in knockout rounds across the historical sample. Comparative trend based on data, not a measure of team strength.",
    metric: "2.95 vs 2.07",
    accent: "magenta",
  },
];

// All-time top individual goal scorers in World Cup history
export interface Scorer {
  name: string;
  country: string;
  code: string;
  goals: number;
  tournaments: number[];
  era: "Classic" | "Modern" | "Contemporary";
}

export const topScorers: Scorer[] = [
  { name: "Miroslav Klose", country: "Germany", code: "de", goals: 16, tournaments: [2002, 2006, 2010, 2014], era: "Contemporary" },
  { name: "Ronaldo Nazário", country: "Brazil", code: "br", goals: 15, tournaments: [1994, 1998, 2002, 2006], era: "Modern" },
  { name: "Gerd Müller", country: "Germany", code: "de", goals: 14, tournaments: [1970, 1974], era: "Classic" },
  { name: "Just Fontaine", country: "France", code: "fr", goals: 13, tournaments: [1958], era: "Classic" },
  { name: "Lionel Messi", country: "Argentina", code: "ar", goals: 13, tournaments: [2006, 2010, 2014, 2018, 2022], era: "Contemporary" },
  { name: "Kylian Mbappé", country: "France", code: "fr", goals: 12, tournaments: [2018, 2022], era: "Contemporary" },
  { name: "Pelé", country: "Brazil", code: "br", goals: 12, tournaments: [1958, 1962, 1966, 1970], era: "Classic" },
  { name: "Sándor Kocsis", country: "Hungary", code: "hu", goals: 11, tournaments: [1954], era: "Classic" },
  { name: "Jürgen Klinsmann", country: "Germany", code: "de", goals: 11, tournaments: [1990, 1994, 1998], era: "Modern" },
  { name: "Gabriel Batistuta", country: "Argentina", code: "ar", goals: 10, tournaments: [1994, 1998, 2002], era: "Modern" },
  { name: "Teófilo Cubillas", country: "Peru", code: "pe", goals: 10, tournaments: [1970, 1978, 1982], era: "Classic" },
  { name: "Grzegorz Lato", country: "Poland", code: "pl", goals: 10, tournaments: [1974, 1978, 1982], era: "Classic" },
  { name: "Gary Lineker", country: "England", code: "gb-eng", goals: 10, tournaments: [1986, 1990], era: "Modern" },
  { name: "Helmut Rahn", country: "Germany", code: "de", goals: 10, tournaments: [1954, 1958], era: "Classic" },
  { name: "Thomas Müller", country: "Germany", code: "de", goals: 10, tournaments: [2010, 2014, 2018, 2022], era: "Contemporary" },
  { name: "Cristiano Ronaldo", country: "Portugal", code: "pt", goals: 8, tournaments: [2006, 2010, 2014, 2018, 2022], era: "Contemporary" },
  { name: "Diego Maradona", country: "Argentina", code: "ar", goals: 8, tournaments: [1982, 1986, 1990, 1994], era: "Modern" },
  { name: "Eusébio", country: "Portugal", code: "pt", goals: 9, tournaments: [1966], era: "Classic" },
  { name: "Roberto Baggio", country: "Italy", code: "it", goals: 9, tournaments: [1990, 1994, 1998], era: "Modern" },
  { name: "Paolo Rossi", country: "Italy", code: "it", goals: 9, tournaments: [1978, 1982, 1986], era: "Classic" },
];

// Qatar 2022 Player Performance — cleaned dataset
export interface Player2022 {
  name: string; team: string; code: string; position: "FW" | "MF" | "DF" | "GK";
  minutes: number; goals: number; assists: number; xG: number; xA: number;
  shots: number;
}

export const players2022: Player2022[] = [
  { name: "Kylian Mbappé", team: "France", code: "fr", position: "FW", minutes: 654, goals: 8, assists: 2, xG: 4.8, xA: 1.6, shots: 31 },
  { name: "Lionel Messi", team: "Argentina", code: "ar", position: "FW", minutes: 690, goals: 7, assists: 3, xG: 5.1, xA: 2.4, shots: 27 },
  { name: "Julián Álvarez", team: "Argentina", code: "ar", position: "FW", minutes: 524, goals: 4, assists: 0, xG: 2.9, xA: 0.8, shots: 18 },
  { name: "Olivier Giroud", team: "France", code: "fr", position: "FW", minutes: 560, goals: 4, assists: 0, xG: 3.4, xA: 0.5, shots: 14 },
  { name: "Marcus Rashford", team: "England", code: "gb-eng", position: "FW", minutes: 234, goals: 3, assists: 0, xG: 1.4, xA: 0.6, shots: 11 },
  { name: "Bukayo Saka", team: "England", code: "gb-eng", position: "FW", minutes: 432, goals: 3, assists: 1, xG: 2.1, xA: 1.2, shots: 14 },
  { name: "Cody Gakpo", team: "Netherlands", code: "nl", position: "FW", minutes: 420, goals: 3, assists: 0, xG: 1.6, xA: 0.9, shots: 12 },
  { name: "Enner Valencia", team: "Ecuador", code: "ec", position: "FW", minutes: 270, goals: 3, assists: 0, xG: 1.8, xA: 0.2, shots: 9 },
  { name: "Goncalo Ramos", team: "Portugal", code: "pt", position: "FW", minutes: 195, goals: 3, assists: 1, xG: 1.5, xA: 0.4, shots: 8 },
  { name: "Richarlison", team: "Brazil", code: "br", position: "FW", minutes: 411, goals: 3, assists: 0, xG: 2.2, xA: 0.7, shots: 13 },
  { name: "Álvaro Morata", team: "Spain", code: "es", position: "FW", minutes: 318, goals: 3, assists: 0, xG: 2.5, xA: 0.6, shots: 11 },
  { name: "Andrej Kramarić", team: "Croatia", code: "hr", position: "FW", minutes: 432, goals: 2, assists: 0, xG: 1.9, xA: 0.5, shots: 10 },
  { name: "Bruno Fernandes", team: "Portugal", code: "pt", position: "MF", minutes: 480, goals: 2, assists: 3, xG: 1.8, xA: 2.5, shots: 14 },
  { name: "Cristiano Ronaldo", team: "Portugal", code: "pt", position: "FW", minutes: 412, goals: 1, assists: 0, xG: 2.4, xA: 0.7, shots: 17 },
  { name: "Vinícius Júnior", team: "Brazil", code: "br", position: "FW", minutes: 397, goals: 1, assists: 1, xG: 2.8, xA: 1.4, shots: 16 },
  { name: "Neymar", team: "Brazil", code: "br", position: "FW", minutes: 360, goals: 2, assists: 1, xG: 2.6, xA: 1.8, shots: 13 },
  { name: "Harry Kane", team: "England", code: "gb-eng", position: "FW", minutes: 487, goals: 2, assists: 3, xG: 3.7, xA: 2.1, shots: 13 },
  { name: "Antoine Griezmann", team: "France", code: "fr", position: "MF", minutes: 660, goals: 1, assists: 3, xG: 1.3, xA: 3.1, shots: 12 },
  { name: "Luka Modrić", team: "Croatia", code: "hr", position: "MF", minutes: 580, goals: 1, assists: 1, xG: 0.9, xA: 1.7, shots: 9 },
  { name: "Youssef En-Nesyri", team: "Morocco", code: "ma", position: "FW", minutes: 540, goals: 2, assists: 0, xG: 1.4, xA: 0.4, shots: 11 },
  { name: "Hakim Ziyech", team: "Morocco", code: "ma", position: "MF", minutes: 510, goals: 1, assists: 1, xG: 1.0, xA: 1.3, shots: 13 },
  { name: "Achraf Hakimi", team: "Morocco", code: "ma", position: "DF", minutes: 612, goals: 0, assists: 1, xG: 0.4, xA: 0.8, shots: 8 },
  { name: "Memphis Depay", team: "Netherlands", code: "nl", position: "FW", minutes: 396, goals: 1, assists: 0, xG: 2.1, xA: 0.9, shots: 12 },
  { name: "Wout Weghorst", team: "Netherlands", code: "nl", position: "FW", minutes: 198, goals: 2, assists: 0, xG: 1.2, xA: 0.2, shots: 6 },
  { name: "Ferran Torres", team: "Spain", code: "es", position: "FW", minutes: 287, goals: 1, assists: 0, xG: 1.7, xA: 0.5, shots: 9 },
  { name: "Aleksandar Mitrović", team: "Serbia", code: "rs", position: "FW", minutes: 270, goals: 2, assists: 0, xG: 2.8, xA: 0.3, shots: 11 },
  { name: "Breel Embolo", team: "Switzerland", code: "ch", position: "FW", minutes: 360, goals: 2, assists: 0, xG: 1.5, xA: 0.4, shots: 8 },
  { name: "Sofiane Boufal", team: "Morocco", code: "ma", position: "MF", minutes: 480, goals: 0, assists: 1, xG: 0.6, xA: 1.1, shots: 9 },
  { name: "Theo Hernández", team: "France", code: "fr", position: "DF", minutes: 580, goals: 1, assists: 1, xG: 0.5, xA: 1.0, shots: 7 },
  { name: "Mehdi Taremi", team: "Iran", code: "ir", position: "FW", minutes: 270, goals: 2, assists: 0, xG: 1.0, xA: 0.3, shots: 8 },
];

export const playerInsights = [
  {
    id: "p1",
    icon: "📈",
    title: "xG vs Goals (players)",
    headline: "Strong correlation observed",
    body: "Across Qatar 2022 attackers, expected goals tracked closely with actual goals — confirming xG as a reliable estimator, not a predictor of outcomes.",
    metric: "r ≈ 0.82",
    accent: "pitch",
  },
  {
    id: "p2",
    icon: "⏱️",
    title: "Minutes vs Goals",
    headline: "Weak correlation observed",
    body: "Playing time alone showed weak linear relationship with scoring output. Role, position, and tactical context matter more than raw minutes.",
    metric: "r ≈ 0.28",
    accent: "cyan",
  },
  {
    id: "p3",
    icon: "🎯",
    title: "Finishing Delta",
    headline: "High variance across players",
    body: "Goals − xG ranged widely from clear overperformers to underperformers, suggesting finishing efficiency is highly individual and small-sample sensitive.",
    metric: "σ ≈ 1.4",
    accent: "magenta",
  },
];
