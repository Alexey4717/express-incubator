export interface IQueryHandler<TQuery, TResult = unknown> {
  execute(query: TQuery): Promise<TResult>;
}
