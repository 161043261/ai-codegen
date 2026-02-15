export interface CodeQualityResult {
  passed: boolean;
  qualityScore: number;
  issues: string[];
  suggestions: string[];
}
