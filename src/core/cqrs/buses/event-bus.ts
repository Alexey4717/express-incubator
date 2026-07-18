import { injectable } from 'inversify';

import type { IEventHandler } from '../contracts/i-event-handler';

type EventConstructor<T extends object = object> = new (...args: never[]) => T;

@injectable()
export class EventBus {
  private readonly handlers = new Map<
    EventConstructor,
    IEventHandler<object>[]
  >();

  registerHandler<TEvent extends object>(
    eventType: EventConstructor<TEvent>,
    handler: IEventHandler<TEvent>,
  ): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler as IEventHandler<object>);
    this.handlers.set(eventType, existing);
  }

  async publish(event: object): Promise<void> {
    const eventHandlers =
      this.handlers.get(event.constructor as EventConstructor) ?? [];

    const results = await Promise.allSettled(
      eventHandlers.map((handler) => handler.handle(event)),
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `Event handler failed for ${event.constructor.name} [${index}]:`,
          result.reason,
        );
      }
    });
  }
}
