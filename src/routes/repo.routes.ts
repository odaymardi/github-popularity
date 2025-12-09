
import { Router } from 'express';
import { RepoController } from '../controllers/repo.controller';
import { RepoService } from '../services/repo.service';
import { GitHubService } from '../services/github.service';

export function createRepoRouter(): Router {
  const router = Router();

  const githubService = new GitHubService();
  const repoService = new RepoService(githubService);
  const controller = new RepoController(repoService);

  router.get('/popular', controller.getPopular);

  return router;
}
