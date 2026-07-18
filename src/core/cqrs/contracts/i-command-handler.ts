export interface ICommandHandler<TCommand, TResult = unknown> {
  execute(command: TCommand): Promise<TResult>;
}
