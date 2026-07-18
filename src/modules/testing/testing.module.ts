import { Container } from 'inversify';

import { TestingControllers } from './controllers/testing-controllers';

export const bindTestingModule = (container: Container): void => {
  container.bind(TestingControllers).toSelf();
};
