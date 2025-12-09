
import { Repository, ScoredRepository } from './types';

export interface PopularityConfig {
  starWeight: number;
  forkWeight: number;
  recencyWeight: number;
  recencyHalfLifeDays: number;
}

const defaultConfig: PopularityConfig = {
  starWeight: 0.6,
  forkWeight: 0.3,
  recencyWeight: 0.1,
  recencyHalfLifeDays: 30
};

function computeRecencyScore(updatedAt: Date, halfLifeDays: number): number {
  const now = Date.now();
  const ageDays = (now - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays < 0) return 1;
  return Math.exp(-ageDays / halfLifeDays);
}

export function scoreRepositories(
  repos: Repository[],
  config: PopularityConfig = defaultConfig
): ScoredRepository[] {
  if (repos.length === 0) return [];

  const maxStars = Math.max(...repos.map((r) => r.stars));
  const maxForks = Math.max(...repos.map((r) => r.forks));

  return repos.map((repo) => {
    const starsScore = maxStars ? repo.stars / maxStars : 0;
    const forksScore = maxForks ? repo.forks / maxForks : 0;
    const recencyScore = computeRecencyScore(repo.updatedAt, config.recencyHalfLifeDays);

    const raw =
      config.starWeight * starsScore +
      config.forkWeight * forksScore +
      config.recencyWeight * recencyScore;

    return {
      ...repo,
      popularityScore: Number((raw * 100).toFixed(2))
    };
  });
}
