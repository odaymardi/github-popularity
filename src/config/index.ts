
export interface AppConfig {
  port: number;
  githubToken?: string;
  githubBaseUrl: string;
  requestTimeoutMs: number;
  defaultLanguage?: string;
  defaultCreatedAfter?: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

function getEnv(name: string, defaultValue?: string): string | undefined {
  const value = process.env[name];
  return value ?? defaultValue;
}

function getNumberEnv(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

export const config: AppConfig = {
  port: getNumberEnv('PORT', 3000),
  githubToken: getEnv('GITHUB_TOKEN'),
  githubBaseUrl: getEnv('GITHUB_API_BASE_URL', 'https://api.github.com')!,
  requestTimeoutMs: getNumberEnv('REQUEST_TIMEOUT_MS', 5000),
  defaultLanguage: getEnv('DEFAULT_LANGUAGE'),
  defaultCreatedAfter: getEnv('DEFAULT_CREATED_AFTER'),
  logLevel: (getEnv('LOG_LEVEL', 'info') as AppConfig['logLevel'])
};
