
import { GitHubRepo } from '../services/github.types';
import { Repository } from '../domain/types';

export function mapGitHubRepoToDomain(repo: GitHubRepo): Repository {
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    htmlUrl: repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    updatedAt: new Date(repo.updated_at),
    createdAt: new Date(repo.created_at),
    language: repo.language
  };
}
