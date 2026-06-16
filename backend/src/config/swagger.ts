import fs from 'fs';
import path from 'path';
import { Express, Request, Response } from 'express';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';

function loadOpenApiSpec(): Record<string, unknown> {
  const specPath = path.join(process.cwd(), 'openapi.yaml');

  if (!fs.existsSync(specPath)) {
    throw new Error(`OpenAPI spec not found at ${specPath}`);
  }

  const fileContents = fs.readFileSync(specPath, 'utf8');
  const document = yaml.load(fileContents);

  if (!document || typeof document !== 'object') {
    throw new Error('Invalid OpenAPI spec format');
  }

  return document as Record<string, unknown>;
}

export function setupSwagger(app: Express): void {
  const openApiDocument = loadOpenApiSpec();

  app.get('/api/docs/openapi.yaml', (_req: Request, res: Response) => {
    const specPath = path.join(process.cwd(), 'openapi.yaml');
    res.type('text/yaml').send(fs.readFileSync(specPath, 'utf8'));
  });

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: 'TechX To-Do API Docs',
      swaggerOptions: {
        persistAuthorization: true,
        withCredentials: true,
      },
    }),
  );
}
