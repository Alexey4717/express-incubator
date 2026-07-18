export class GetPostByIdQuery {
  constructor(
    public readonly id: string,
    public readonly currentUserId?: string,
  ) {}
}
