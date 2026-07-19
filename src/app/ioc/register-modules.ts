import { Container } from 'inversify';

import { bindCoreModule } from '@/core/core.module';
import { isProduction } from '@/core/settings/env';

import { bindAuthModule } from '@/modules/auth';
import { bindBlogsModule } from '@/modules/blogs';
import { bindCommentsModule } from '@/modules/comments';
import { bindPostsModule } from '@/modules/posts';
import { bindSecurityDevicesModule } from '@/modules/security-devices';
import { bindTestingModule } from '@/modules/testing';
import { bindUsersModule } from '@/modules/users';
import { bindVideosModule } from '@/modules/videos';

import { registerAllCqrsHandlers } from './register-cqrs-handlers';

export const registerModules = (container: Container): void => {
  bindCoreModule(container);
  bindUsersModule(container);
  bindPostsModule(container);
  bindBlogsModule(container);
  bindCommentsModule(container);
  bindVideosModule(container);
  bindSecurityDevicesModule(container);
  bindAuthModule(container);

  registerAllCqrsHandlers(container);

  if (!isProduction()) {
    bindTestingModule(container);
  }
};
