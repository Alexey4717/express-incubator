import { injectable } from 'inversify';

import type { ICommandHandler } from '../contracts/i-command-handler';

type CommandConstructor<T extends object = object> = new (
  ...args: never[]
) => T;

@injectable()
export class CommandBus {
  private readonly handlers = new Map<
    CommandConstructor,
    ICommandHandler<object, unknown>
  >();

  registerHandler<TCommand extends object, TResult>(
    commandType: CommandConstructor<TCommand>,
    handler: ICommandHandler<TCommand, TResult>,
  ): void {
    this.handlers.set(commandType, handler as ICommandHandler<object, unknown>);
  }

  execute<TResult>(command: object): Promise<TResult> {
    const handler = this.handlers.get(
      command.constructor as CommandConstructor,
    );
    if (!handler) {
      throw new Error(
        `No handler registered for command ${command.constructor.name}`,
      );
    }
    return handler.execute(command) as Promise<TResult>;
  }
}
