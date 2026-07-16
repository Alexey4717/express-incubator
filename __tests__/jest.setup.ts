import { resetRateLimitConnections } from '../src/core/middlewares/rate-limit-middleware';

beforeEach(() => {
  resetRateLimitConnections();
});

afterEach(() => {
  resetRateLimitConnections();
});
