import { resetRateLimitConnections } from '@/core/middlewares/rate-limit-middleware';

beforeEach(() => {
  resetRateLimitConnections();
});

afterEach(() => {
  resetRateLimitConnections();
});
