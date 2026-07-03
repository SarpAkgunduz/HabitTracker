export type GameTheme = 'warrior' | 'garden';

export interface GamificationState {
  totalDP: number;
  level: number;
  tier: number; // increases every 10 levels
  rebirthCount: number;
  theme: GameTheme;
}
