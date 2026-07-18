export const CQRS_TYPES = {
  CommandBus: Symbol.for('CommandBus'),
  QueryBus: Symbol.for('QueryBus'),
  EventBus: Symbol.for('EventBus'),
} as const;
