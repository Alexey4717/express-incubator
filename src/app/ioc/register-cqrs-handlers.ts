import { Container } from 'inversify';

import { CommandBus } from '@/core/cqrs/buses/command-bus';
import { EventBus } from '@/core/cqrs/buses/event-bus';
import { QueryBus } from '@/core/cqrs/buses/query-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';
import {
  registerCommandHandlers,
  registerEventHandlers,
  registerQueryHandlers,
} from '@/core/cqrs/register-handlers';

import {
  authCommandRegistrations,
  authEventRegistrations,
} from '@/modules/auth';
import {
  blogsCommandRegistrations,
  blogsQueryRegistrations,
} from '@/modules/blogs';
import {
  commentsCommandRegistrations,
  commentsQueryRegistrations,
} from '@/modules/comments';
import {
  postsCommandRegistrations,
  postsQueryRegistrations,
} from '@/modules/posts';
import {
  securityDevicesCommandRegistrations,
  securityDevicesQueryRegistrations,
} from '@/modules/security-devices';
import {
  usersCommandRegistrations,
  usersQueryRegistrations,
} from '@/modules/users';
import {
  videosCommandRegistrations,
  videosQueryRegistrations,
} from '@/modules/videos';

export const registerAllCqrsHandlers = (container: Container): void => {
  const commandBus = container.get<CommandBus>(CQRS_TYPES.CommandBus);
  const queryBus = container.get<QueryBus>(CQRS_TYPES.QueryBus);
  const eventBus = container.get<EventBus>(CQRS_TYPES.EventBus);

  registerCommandHandlers(container, commandBus, [
    ...usersCommandRegistrations,
    ...authCommandRegistrations,
    ...securityDevicesCommandRegistrations,
    ...blogsCommandRegistrations,
    ...postsCommandRegistrations,
    ...commentsCommandRegistrations,
    ...videosCommandRegistrations,
  ]);

  registerQueryHandlers(container, queryBus, [
    ...usersQueryRegistrations,
    ...blogsQueryRegistrations,
    ...postsQueryRegistrations,
    ...commentsQueryRegistrations,
    ...videosQueryRegistrations,
    ...securityDevicesQueryRegistrations,
  ]);

  registerEventHandlers(container, eventBus, [...authEventRegistrations]);
};
