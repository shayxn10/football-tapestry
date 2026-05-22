// Weighted auto-simulation based on rough FIFA-style strength tiers.
// Used by Journey mode (and any auto-sim path) to produce realistic results.

export const TEAM_TIER: Record<string, number> = {
  // Tier 1 — World class
  "Argentina": 96, "France": 95, "Brazil": 94, "Spain": 93, "England": 91,
  "Portugal": 90, "Germany": 89, "Netherlands": 88, "Belgium": 87, "Uruguay": 85,
  // Tier 2 — Strong
  "Colombia": 82, "Mexico": 80, "USA": 79, "Morocco": 78, "Japan": 77,
  "Senegal": 77, "Switzerland": 76, "Croatia": 76, "Sweden": 74, "Ecuador": 74,
  "Australia": 74, "Korea Republic": 73, "South Korea": 73, "Türkiye": 73,
  "Poland": 72, "IR Iran": 72, "Iran": 72, "Côte d'Ivoire": 72, "Ivory Coast": 72,
  "Norway": 71, "Canada": 70, "Austria": 69, "Serbia": 69, "Saudi Arabia": 68,
  "Scotland": 68, "Czechia": 68, "Czech Republic": 68, "Denmark": 75,
  "Algeria": 67, "Egypt": 66, "Tunisia": 65, "Slovakia": 65, "Ghana": 64,
  "Cameroon": 63,
  // Tier 3 — Mid
  "Bosnia and Herzegovina": 62, "Paraguay": 58, "Congo DR": 56, "Uzbekistan": 55,
  "South Africa": 55, "Cabo Verde": 54, "Iraq": 54, "Qatar": 52, "Jordan": 50,
  "Panama": 50,
  // Tier 4 — Lower
  "New Zealand": 48, "Haiti": 46, "Bolivia": 45, "Curaçao": 44,
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

  const team1WinProb = 1 / (1 + Math.pow(10, -diff / 20));
  const drawProb = Math.max(0.08, 0.22 - Math.abs(diff) * 0.002);

  const rand = Math.random();
  let winner: "team1" | "team2" | "draw";
  // partition: team1Win | draw | team2Win
  const winBand = team1WinProb * (1 - drawProb);
  const drawBand = winBand + drawProb;
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
