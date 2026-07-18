import { Container, interfaces } from 'inversify';

import { CommandBus } from './buses/command-bus';
import { EventBus } from './buses/event-bus';
import { QueryBus } from './buses/query-bus';
import type { ICommandHandler } from './contracts/i-command-handler';
import type { IEventHandler } from './contracts/i-event-handler';
import type { IQueryHandler } from './contracts/i-query-handler';

type Constructor<T extends object = object> = new (...args: never[]) => T;

type CommandRegistration = {
  command: Constructor;
  handler: interfaces.ServiceIdentifier<ICommandHandler<object, unknown>>;
};

type QueryRegistration = {
  query: Constructor;
  handler: interfaces.ServiceIdentifier<IQueryHandler<object, unknown>>;
};

type EventRegistration = {
  event: Constructor;
  handler: interfaces.ServiceIdentifier<IEventHandler<object>>;
};

export function registerCommandHandlers(
  container: Container,
  commandBus: CommandBus,
  registrations: CommandRegistration[],
): void {
  for (const { command, handler } of registrations) {
    commandBus.registerHandler(command, container.get(handler));
  }
}

export function registerQueryHandlers(
  container: Container,
  queryBus: QueryBus,
  registrations: QueryRegistration[],
): void {
  for (const { query, handler } of registrations) {
    queryBus.registerHandler(query, container.get(handler));
  }
}

export function registerEventHandlers(
  container: Container,
  eventBus: EventBus,
  registrations: EventRegistration[],
): void {
  for (const { event, handler } of registrations) {
    eventBus.registerHandler(event, container.get(handler));
  }
}
