// ─────────────────────────────────────────────────────
// teamWeights.ts
// Weighted auto-simulation based on FIFA team strength.
// Used to auto-sim non-user matches with realistic outcomes.
// ─────────────────────────────────────────────────────

export const TEAM_TIER: Record<string, number> = {
  // TIER 1 — Elite world class (88-96)
  "Argentina": 96, "France": 95, "Brazil": 94, "Spain": 93,
  "England": 91, "Portugal": 90, "Germany": 89, "Netherlands": 88,

  // TIER 2 — Strong contenders (78-87)
  "Belgium": 87, "Uruguay": 85, "Colombia": 83, "Morocco": 82,
  "Mexico": 80, "Croatia": 80, "USA": 79, "Japan": 78,

  // TIER 3 — Competitive (68-77)
  "Senegal": 77, "Switzerland": 76, "Denmark": 75, "Sweden": 74,
  "Ecuador": 74, "Australia": 73, "Korea Republic": 73, "South Korea": 73,
  "Türkiye": 73, "IR Iran": 72, "Iran": 72, "Côte d'Ivoire": 72,
  "Ivory Coast": 72, "Poland": 72, "Norway": 71, "Canada": 70,
  "Serbia": 69, "Austria": 69, "Ghana": 68, "Czechia": 68, "Czech Republic": 68,

  // TIER 4 — Mid-level (50-67)
  "Scotland": 66, "Tunisia": 65, "Algeria": 65, "Slovakia": 65,
  "Egypt": 64, "Paraguay": 62, "Bosnia and Herzegovina": 62,
  "South Africa": 58, "Uzbekistan": 57, "Congo DR": 56,
  "Saudi Arabia": 56, "Iraq": 54, "Cabo Verde": 54, "Panama": 52,
  "Cameroon": 63,

  // TIER 5 — Underdogs (35-49)
  "Qatar": 48, "Jordan": 46, "Bolivia": 45, "Haiti": 44,
  "Curaçao": 40, "New Zealand": 38,
};

export function getTeamStrength(team: string): number {
  return TEAM_TIER[team] ?? 58;
}

export function weightedAutoSimulate(
  team1: string,
  team2: string,
): { goals1: number; goals2: number } {
  const r1 = getTeamStrength(team1);
  const r2 = getTeamStrength(team2);
  const diff = r1 - r2;

  // Elo-style win probability
  const team1WinProb = 1 / (1 + Math.pow(10, -diff / 20));
  const drawProb = Math.max(0.06, 0.22 - Math.abs(diff) * 0.003);

  const rand = Math.random();
  const winBand = team1WinProb * (1 - drawProb);
  const drawBand = winBand + drawProb;

  let winner: "team1" | "team2" | "draw";
  if (rand < winBand) winner = "team1";
  else if (rand < drawBand) winner = "draw";
  else winner = "team2";

  const winScores: Array<[number, number]> = [
    [1,0],[1,0],[1,0],[2,0],[2,0],[2,1],[2,1],[2,1],
    [3,0],[3,1],[3,2],[4,0],[4,1],[1,0],[2,1],
  ];
  const drawScores: Array<[number, number]> = [
    [0,0],[0,0],[1,1],[1,1],[1,1],[2,2],
  ];

  if (winner === "draw") {
    const p = drawScores[Math.floor(Math.random() * drawScores.length)];
    return { goals1: p[0], goals2: p[1] };
  }
  const p = winScores[Math.floor(Math.random() * winScores.length)];
  return winner === "team1"
    ? { goals1: p[0], goals2: p[1] }
    : { goals1: p[1], goals2: p[0] };
}
