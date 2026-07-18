export class UpdateCommentCommand {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly userId: string,
  ) {}
}
