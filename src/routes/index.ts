
import { Router } from 'express';
import { createRepoRouter } from './repo.routes';

export function createRootRouter(): Router {
  const router = Router();

  router.use('/repos', createRepoRouter());

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return router;
}
