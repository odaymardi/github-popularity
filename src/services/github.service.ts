
import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { logger } from '../lib/logger';
import { GitHubSearchResponse } from './github.types';
import { Repository } from '../domain/types';
import { mapGitHubRepoToDomain } from '../utils/repoFormatter';
import { HttpError } from '../errors/HttpError';

export interface SearchReposOptions {
  language?: string;
  createdAfter?: string;
  page?: number;
  perPage?: number;
}

export class GitHubService {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: config.githubBaseUrl,
      timeout: config.requestTimeoutMs,
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(config.githubToken
          ? { Authorization: `Bearer ${config.githubToken}` }
          : {})
      }
    });
  }

  async searchRepositories(options: SearchReposOptions): Promise<{ items: Repository[]; total: number }> {
    const { language, createdAfter, page = 1, perPage = 20 } = options;

    const qParts = ['stars:>0'];
    if (language) qParts.push(`language:${language}`);
    if (createdAfter) qParts.push(`created:>=${createdAfter}`);

    const q = qParts.join(' ');

    try {
      const start = Date.now();
      const response = await this.http.get<GitHubSearchResponse>('/search/repositories', {
        params: {
          q,
          sort: 'stars',
          order: 'desc',
          page,
          per_page: perPage
        }
      });
      const duration = Date.now() - start;

      logger.info('GitHub searchRepositories call completed', {
        durationMs: duration,
        status: response.status
      });

      const repos: Repository[] = response.data.items.map(mapGitHubRepoToDomain);

      return {
        items: repos,
        total: response.data.total_count
      };
    } catch (err: any) {
      if (err.response) {
        const { status, data, headers } = err.response;
        logger.error('GitHub API error', { status, data });
        if (status === 403 && headers['x-ratelimit-remaining'] === '0') {
          throw new HttpError(
            503,
            'GitHub rate limit exceeded. Please try again later.',
            { retryAfter: headers['retry-after'] }
          );
        }
        throw new HttpError(
          502,
          'GitHub API returned an error',
          { status, data }
        );
      }
      if (err.code === 'ECONNABORTED') {
        logger.error('GitHub API request timed out');
        throw new HttpError(504, 'GitHub API request timed out');
      }
      logger.error('Unknown error calling GitHub API', { error: String(err) });
      throw new HttpError(502, 'Unknown error calling GitHub API');
    }
  }
}
