// Backwards-compatible re-export. New callers should pass team names so
// weightedAutoSimulate can use team strength tiers.
export { weightedAutoSimulate, weightedAutoSimulate as autoSimulate } from "./teamWeights";
