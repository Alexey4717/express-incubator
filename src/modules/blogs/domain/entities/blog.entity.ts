import { ObjectId } from 'mongodb';

import { CreateBlogInputModel } from '../../models/CreateBlogInputModel';
import type {
  GetBlogOutputModel,
  TBlogDb,
} from '../../models/GetBlogOutputModel';

export type BlogUpdateProps = Pick<
  GetBlogOutputModel,
  'name' | 'description' | 'websiteUrl'
>;

export class BlogEntity {
  private constructor(private data: TBlogDb) {}

  static create(input: CreateBlogInputModel): BlogEntity {
    return new BlogEntity({
      _id: new ObjectId(),
      name: input.name,
      websiteUrl: input.websiteUrl,
      description: input.description,
      isMembership: false,
      createdAt: new Date().toISOString(),
    });
  }

  static reconstitute(raw: TBlogDb): BlogEntity {
    return new BlogEntity({ ...raw, _id: raw._id });
  }

  get id(): ObjectId {
    return this.data._id;
  }

  get name(): string {
    return this.data.name;
  }

  toDb(): TBlogDb {
    return { ...this.data };
  }

  update(props: BlogUpdateProps): void {
    this.data = {
      ...this.data,
      ...props,
    };
  }
}
