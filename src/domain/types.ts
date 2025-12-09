
export interface Repository {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  stars: number;
  forks: number;
  updatedAt: Date;
  createdAt: Date;
  language: string | null;
}

export interface ScoredRepository extends Repository {
  popularityScore: number;
}
