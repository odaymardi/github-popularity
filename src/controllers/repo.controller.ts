
import { Request, Response, NextFunction } from 'express';
import { RepoService } from '../services/repo.service';
import { getPopularReposQuerySchema } from '../validators/repo.validator';

export class RepoController {
  constructor(private readonly repoService: RepoService) {}

  getPopular = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = getPopularReposQuerySchema.parse(req.query);

      const result = await this.repoService.getPopularRepositories({
        language: validated.language,
        createdAfter: validated.created_after,
        page: validated.page,
        perPage: validated.per_page
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
