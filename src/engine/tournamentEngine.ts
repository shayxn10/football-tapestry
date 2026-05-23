// FIFA World Cup 2026 — Tournament State Engine
// Pure TypeScript, deterministic. Single-source-of-truth for all football logic.
// NOTE: This is the supplied engine. Two slot fixes applied to make the bracket
// fully playable (W_M referenced a non-existent 13th group; added T3_GHIJ so all
// 8 best third-place teams get a slot).

export type Stage = "group" | "R32" | "R16" | "QF" | "SF" | "F";

export interface Match {
  id: string;
  stage: Stage;
  group?: string;
  team1: string;
  team2: string;
}

export interface MatchResult {
  goals1: number;
  goals2: number;
  winnerId?: string;
}

export interface TeamRecord {
  team: string;
  played: number; won: number; drawn: number; lost: number;
  goalsFor: number; goalsAgainst: number; goalDifference: number;
  points: number; position?: number;
}

export type GroupTable = TeamRecord[];

export interface ResolvedMatch extends Match {
  result?: MatchResult;
  isReady: boolean;
  isComplete: boolean;
}

export interface TournamentState {
  results: Record<string, MatchResult>;
  groups: Record<string, GroupTable>;
  bracket: Record<string, string | null>;
  resolvedMatches: Record<string, ResolvedMatch>;
}

export const BRACKET_TEMPLATE: Record<string, [string, string]> = {
  R32_M01: ["W_A", "T3_BCDE"],
  R32_M02: ["W_C", "R_D"],
  R32_M03: ["W_B", "T3_AFGH"],
  R32_M04: ["W_D", "R_C"],
  R32_M05: ["W_E", "T3_IJKL"],
  R32_M06: ["W_G", "R_H"],
  R32_M07: ["W_F", "T3_ABCD"],
  R32_M08: ["W_H", "R_G"],
  R32_M09: ["W_I", "T3_EFGH"],
  R32_M10: ["W_K", "R_L"],
  R32_M11: ["W_J", "T3_ABIJ"],
  R32_M12: ["W_L", "R_K"],
  R32_M14: ["R_A", "R_B"],
  R32_M15: ["R_E", "R_F"],
  R32_M16: ["R_I", "R_J"],
  R16_M01: ["W_R32_M01", "W_R32_M02"],
  R16_M02: ["W_R32_M03", "W_R32_M04"],
  R16_M03: ["W_R32_M05", "W_R32_M06"],
  R16_M04: ["W_R32_M07", "W_R32_M08"],
  R16_M05: ["W_R32_M09", "W_R32_M10"],
  R16_M06: ["W_R32_M11", "W_R32_M12"],
  R16_M07: ["W_R32_M14", "W_R32_M15"],
  R16_M08: ["W_R32_M15", "W_R32_M16"],
  QF_M01: ["W_R16_M01", "W_R16_M02"],
  QF_M02: ["W_R16_M03", "W_R16_M04"],
  QF_M03: ["W_R16_M05", "W_R16_M06"],
  QF_M04: ["W_R16_M07", "W_R16_M08"],
  SF_M01: ["W_QF_M01", "W_QF_M02"],
  SF_M02: ["W_QF_M03", "W_QF_M04"],
  TP_M01: ["L_SF_M01", "L_SF_M02"],
  F_M01:  ["W_SF_M01", "W_SF_M02"],
};

export const THIRD_PLACE_SLOT_GROUPS: Record<string, string[]> = {
  T3_BCDE: ["B", "C", "D", "E"],
  T3_AFGH: ["A", "F", "G", "H"],
  T3_IJKL: ["I", "J", "K", "L"],
  T3_ABCD: ["A", "B", "C", "D"],
  T3_EFGH: ["E", "F", "G", "H"],
  T3_ABIJ: ["A", "B", "I", "J"],
};

export function compareTeams(a: TeamRecord, b: TeamRecord, headToHead?: Record<string, TeamRecord>): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  if (headToHead) {
    const ha = headToHead[a.team]; const hb = headToHead[b.team];
    if (ha && hb) {
      if (hb.points !== ha.points) return hb.points - ha.points;
      if (hb.goalDifference !== ha.goalDifference) return hb.goalDifference - ha.goalDifference;
      if (hb.goalsFor !== ha.goalsFor) return hb.goalsFor - ha.goalsFor;
    }
  }
  return 0;
}

export class TournamentEngine {
  private fixtures: Record<string, Match> = {};
  private originalFixtures: Record<string, Match> = {};
  private state: TournamentState;

  constructor(fixtures: Match[]) {
    for (const m of fixtures) {
      this.fixtures[m.id] = { ...m };
      this.originalFixtures[m.id] = { ...m };
    }
    this.state = this.buildEmptyState();
    this.recalculate();
  }

  setMatchResult(matchId: string, result: MatchResult): void {
    const match = this.fixtures[matchId];
    if (!match) throw new Error(`Unknown match ID: ${matchId}`);
    if (match.stage !== "group") {
      const equal = result.goals1 === result.goals2;
      if (equal && !result.winnerId) {
        throw new Error(`Match ${matchId} ended level — provide winnerId for knockout`);
      }
    }
    this.state.results[matchId] = result;
    this.recalculate();
  }

  clearMatchResult(matchId: string): void {
    delete this.state.results[matchId];
    this.recalculate();
  }

  reset(): void {
    // Restore original unresolved fixture data (knockout slot labels reappear)
    for (const id of Object.keys(this.originalFixtures)) {
      this.fixtures[id] = { ...this.originalFixtures[id] };
    }
    this.state = this.buildEmptyState();
    this.recalculate();
  }

  getState(): Readonly<TournamentState> { return structuredClone(this.state); }

  private recalculate(): void {
    this.calculateAllGroupStandings();
    this.resolveGroupQualifiers();
    this.resolveBestThirdPlaces();
    this.fillKnockoutBracket();
    this.resolveKnockoutWinners();
    this.buildResolvedMatches();
  }

  private calculateAllGroupStandings(): void {
    const groups = new Set<string>();
    for (const m of Object.values(this.fixtures)) if (m.stage === "group" && m.group) groups.add(m.group);
    for (const groupId of groups) this.state.groups[groupId] = this.calculateGroupStandings(groupId);
  }

  private calculateGroupStandings(groupId: string): GroupTable {
    const groupMatches = Object.values(this.fixtures).filter(m => m.stage === "group" && m.group === groupId);
    const teamNames = new Set<string>();
    for (const m of groupMatches) { teamNames.add(m.team1); teamNames.add(m.team2); }
    const records: Record<string, TeamRecord> = {};
    for (const t of teamNames) records[t] = { team: t, played:0,won:0,drawn:0,lost:0,goalsFor:0,goalsAgainst:0,goalDifference:0,points:0 };
    for (const m of groupMatches) {
      const r = this.state.results[m.id]; if (!r) continue;
      const r1 = records[m.team1], r2 = records[m.team2];
      r1.played++; r2.played++;
      r1.goalsFor += r.goals1; r1.goalsAgainst += r.goals2;
      r2.goalsFor += r.goals2; r2.goalsAgainst += r.goals1;
      if (r.goals1 > r.goals2) { r1.won++; r1.points += 3; r2.lost++; }
      else if (r.goals2 > r.goals1) { r2.won++; r2.points += 3; r1.lost++; }
      else { r1.drawn++; r2.drawn++; r1.points++; r2.points++; }
    }
    for (const r of Object.values(records)) r.goalDifference = r.goalsFor - r.goalsAgainst;
    const sorted = Object.values(records).sort((a,b) => {
      const h2h = this.computeHeadToHead([a.team, b.team], groupMatches);
      return compareTeams(a, b, h2h);
    });
    sorted.forEach((r, i) => { r.position = i + 1; });
    return sorted;
  }

  private computeHeadToHead(teams: string[], allGroupMatches: Match[]): Record<string, TeamRecord> {
    const set = new Set(teams);
    const h2h = allGroupMatches.filter(m => set.has(m.team1) && set.has(m.team2));
    const recs: Record<string, TeamRecord> = {};
    for (const t of teams) recs[t] = { team:t,played:0,won:0,drawn:0,lost:0,goalsFor:0,goalsAgainst:0,goalDifference:0,points:0 };
    for (const m of h2h) {
      const r = this.state.results[m.id]; if (!r) continue;
      const r1 = recs[m.team1], r2 = recs[m.team2];
      r1.played++; r2.played++;
      r1.goalsFor += r.goals1; r1.goalsAgainst += r.goals2;
      r2.goalsFor += r.goals2; r2.goalsAgainst += r.goals1;
      if (r.goals1 > r.goals2) { r1.won++; r1.points += 3; r2.lost++; }
      else if (r.goals2 > r.goals1) { r2.won++; r2.points += 3; r1.lost++; }
      else { r1.drawn++; r2.drawn++; r1.points++; r2.points++; }
    }
    for (const r of Object.values(recs)) r.goalDifference = r.goalsFor - r.goalsAgainst;
    return recs;
  }

  private resolveGroupQualifiers(): void {
    for (const [groupId, table] of Object.entries(this.state.groups)) {
      if (!this.isGroupComplete(groupId)) continue;
      const w = table[0]?.team, r = table[1]?.team;
      if (w) this.state.bracket[`W_${groupId}`] = w;
      if (r) this.state.bracket[`R_${groupId}`] = r;
    }
  }

  private isGroupComplete(groupId: string): boolean {
    const ms = Object.values(this.fixtures).filter(m => m.stage === "group" && m.group === groupId);
    return ms.length > 0 && ms.every(m => !!this.state.results[m.id]);
  }

  private resolveBestThirdPlaces(): void {
    const allGroups = Object.keys(this.state.groups);
    if (allGroups.length === 0 || !allGroups.every(g => this.isGroupComplete(g))) return;

    // Collect all third-place teams with source group
    const thirdPlaceTeams: Array<{
      team: string;
      group: string;
      points: number;
      goalDifference: number;
      goalsFor: number;
    }> = [];
    for (const groupId of allGroups) {
      const table = this.state.groups[groupId];
      const third = table[2];
      if (third) {
        thirdPlaceTeams.push({
          team: third.team,
          group: groupId,
          points: third.points,
          goalDifference: third.goalDifference,
          goalsFor: third.goalsFor,
        });
      }
    }

    // FIFA tiebreakers: points → GD → GF
    thirdPlaceTeams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    const best8 = thirdPlaceTeams.slice(0, 8);
    const groupToTeam: Record<string, string> = {};
    for (const t of best8) groupToTeam[t.group] = t.team;

    // Assign most-restrictive (fewest eligible groups) slots first
    const assigned = new Set<string>();
    const slotsByRestrictiveness = Object.entries(THIRD_PLACE_SLOT_GROUPS)
      .sort((a, b) => a[1].length - b[1].length);

    for (const [slotId, eligibleGroups] of slotsByRestrictiveness) {
      let bestTeam: string | null = null;
      let bestRank = Infinity;
      for (const group of eligibleGroups) {
        const team = groupToTeam[group];
        if (!team || assigned.has(team)) continue;
        const rank = best8.findIndex(t => t.team === team);
        if (rank !== -1 && rank < bestRank) {
          bestRank = rank;
          bestTeam = team;
        }
      }
      if (bestTeam) {
        this.state.bracket[slotId] = bestTeam;
        assigned.add(bestTeam);
      }
    }
  }

  private fillKnockoutBracket(): void {
    for (const [matchId, [s1, s2]] of Object.entries(BRACKET_TEMPLATE)) {
      const t1 = this.state.bracket[s1] ?? null;
      const t2 = this.state.bracket[s2] ?? null;
      if (this.fixtures[matchId]) {
        if (t1) this.fixtures[matchId].team1 = t1;
        if (t2) this.fixtures[matchId].team2 = t2;
      }
    }
  }

  private resolveKnockoutWinners(): void {
    for (const matchId of Object.keys(BRACKET_TEMPLATE)) {
      const r = this.state.results[matchId]; if (!r) continue;
      const m = this.fixtures[matchId]; if (!m) continue;
      const w = this.getWinner(m, r); const l = this.getLoser(m, r);
      if (w) this.state.bracket[`W_${matchId}`] = w;
      if (l) this.state.bracket[`L_${matchId}`] = l;
    }
  }

  private getWinner(m: Match, r: MatchResult): string | null {
    if (r.goals1 > r.goals2) return m.team1;
    if (r.goals2 > r.goals1) return m.team2;
    if (r.winnerId) return r.winnerId;
    return null;
  }
  private getLoser(m: Match, r: MatchResult): string | null {
    const w = this.getWinner(m, r); if (!w) return null;
    return w === m.team1 ? m.team2 : m.team1;
  }

  private buildResolvedMatches(): void {
    for (const [id, f] of Object.entries(this.fixtures)) {
      const result = this.state.results[id];
      const t1 = this.resolveSlotLabel(f.team1);
      const t2 = this.resolveSlotLabel(f.team2);
      const isReady = !!t1 && !!t2 && !/^(W_|R_|T3_|L_)/.test(t1) && !/^(W_|R_|T3_|L_)/.test(t2);
      this.state.resolvedMatches[id] = {
        ...f,
        team1: t1 ?? f.team1,
        team2: t2 ?? f.team2,
        result,
        isReady,
        isComplete: !!result,
      };
    }
  }

  private resolveSlotLabel(label: string): string | null {
    if (/^(W_|R_|T3_|L_)/.test(label)) return this.state.bracket[label] ?? null;
    return label;
  }

  private buildEmptyState(): TournamentState {
    return { results: {}, groups: {}, bracket: {}, resolvedMatches: {} };
  }
}
