import { injectable } from 'inversify';

import type { IQueryHandler } from '../contracts/i-query-handler';

type QueryConstructor<T extends object = object> = new (...args: never[]) => T;

@injectable()
export class QueryBus {
  private readonly handlers = new Map<
    QueryConstructor,
    IQueryHandler<object, unknown>
  >();

  registerHandler<TQuery extends object, TResult>(
    queryType: QueryConstructor<TQuery>,
    handler: IQueryHandler<TQuery, TResult>,
  ): void {
    this.handlers.set(queryType, handler as IQueryHandler<object, unknown>);
  }

  execute<TResult>(query: object): Promise<TResult> {
    const handler = this.handlers.get(query.constructor as QueryConstructor);
    if (!handler) {
      throw new Error(
        `No handler registered for query ${query.constructor.name}`,
      );
    }
    return handler.execute(query) as Promise<TResult>;
  }
}
