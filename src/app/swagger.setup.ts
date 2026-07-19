import { Express } from 'express';

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { settings } from '@/core/settings/index';

import { injectTokenTtlDescriptions } from './swagger-token-ttl';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express Incubator API',
      version: '1.0.0',
      description: 'API documentation',
    },
  },
  apis: ['./src/**/*.swagger.yml'],
};

const swaggerSpec = injectTokenTtlDescriptions(
  swaggerJsdoc(swaggerOptions),
  String(settings.JWT_ACCESS_EXPIRATION ?? '10m'),
  String(settings.JWT_REFRESH_EXPIRATION ?? '24h'),
);

export const setupSwagger = (app: Express) => {
  app.use(
    '/api',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        withCredentials: true,
      },
    }),
  );
};
