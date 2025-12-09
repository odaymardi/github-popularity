
import express from 'express';
import { createRootRouter } from './routes';
import { errorMiddleware } from './middleware/errorMiddleware';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use('/', createRootRouter());

  app.use(errorMiddleware);

  return app;
}
