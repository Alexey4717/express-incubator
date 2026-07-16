import { Container } from 'inversify';
import 'reflect-metadata';

import { registerModules } from './register-modules';

export const container = new Container({ defaultScope: 'Singleton' });

registerModules(container);
