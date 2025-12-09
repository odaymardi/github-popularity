
import { GitHubService, SearchReposOptions } from './github.service';
import { scoreRepositories } from '../domain/scoring';
import { ScoredRepository } from '../domain/types';

export interface GetPopularReposInput extends SearchReposOptions {}

export interface GetPopularReposOutput {
  items: ScoredRepository[];
  total: number;
  page: number;
  perPage: number;
}

export class RepoService {
  constructor(private readonly github: GitHubService) {}

  async getPopularRepositories(input: GetPopularReposInput): Promise<GetPopularReposOutput> {
    const { language, createdAfter, page = 1, perPage = 20 } = input;

    const { items, total } = await this.github.searchRepositories({
      language,
      createdAfter,
      page,
      perPage
    });

    const scored = scoreRepositories(items).sort(
      (a, b) => b.popularityScore - a.popularityScore
    );

    return {
      items: scored,
      total,
      page,
      perPage
    };
  }
}
