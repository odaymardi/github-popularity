
import { scoreRepositories } from './scoring';
import { Repository } from './types';

describe('scoreRepositories', () => {
  it('assigns higher score to repo with more stars', () => {
    const now = new Date();
    const repos: Repository[] = [
      {
        id: 1,
        name: 'low-stars',
        fullName: 'test/low',
        htmlUrl: 'https://github.com/test/low',
        stars: 10,
        forks: 1,
        updatedAt: now,
        createdAt: now,
        language: 'TypeScript'
      },
      {
        id: 2,
        name: 'high-stars',
        fullName: 'test/high',
        htmlUrl: 'https://github.com/test/high',
        stars: 100,
        forks: 1,
        updatedAt: now,
        createdAt: now,
        language: 'TypeScript'
      }
    ];

    const [scoredLow, scoredHigh] = scoreRepositories(repos);

    expect(scoredHigh.popularityScore).toBeGreaterThan(scoredLow.popularityScore);
  });

  it('returns empty array for no repos', () => {
    const result = scoreRepositories([]);
    expect(result).toEqual([]);
  });
});
