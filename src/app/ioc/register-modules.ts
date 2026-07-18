import { Container } from 'inversify';

import { bindCoreModule } from '@/core/core.module';

import { bindAuthModule } from '@/modules/auth';
import { bindBlogsModule } from '@/modules/blogs';
import { bindCommentsModule } from '@/modules/comments';
import { bindPostsModule } from '@/modules/posts';
import { bindSecurityDevicesModule } from '@/modules/security-devices';
import { bindTestingModule } from '@/modules/testing';
import { bindUsersModule } from '@/modules/users';
import { bindVideosModule } from '@/modules/videos';

import { isProduction } from '../settings/env';

export const registerModules = (container: Container): void => {
  bindCoreModule(container);
  bindUsersModule(container);
  bindAuthModule(container);
  bindBlogsModule(container);
  bindPostsModule(container);
  bindCommentsModule(container);
  bindVideosModule(container);
  bindSecurityDevicesModule(container);

  if (!isProduction()) {
    bindTestingModule(container);
  }
};
