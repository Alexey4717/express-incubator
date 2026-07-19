import { ObjectId } from 'mongodb';

import { CreateVideoInputModel } from '../../models/CreateVideoInputModel';
import type { TVideoDb } from '../../models/GetVideoOutputModel';
import { UpdateVideoInputModel } from '../../models/UpdateVideoInputModel';

export class VideoEntity {
  private constructor(private data: TVideoDb) {}

  static create(input: CreateVideoInputModel): VideoEntity {
    const currentDate = new Date();
    const createdAt = currentDate.toISOString();
    const publicationDate = new Date(
      new Date(currentDate).setDate(currentDate.getDate() + 1),
    ).toISOString();

    return new VideoEntity({
      _id: new ObjectId(),
      title: input.title,
      author: input.author,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt,
      publicationDate,
      availableResolutions: input.availableResolutions ?? null,
    });
  }

  static reconstitute(raw: TVideoDb): VideoEntity {
    return new VideoEntity({ ...raw, _id: raw._id });
  }

  get id(): ObjectId {
    return this.data._id;
  }

  toDb(): TVideoDb {
    return { ...this.data };
  }

  update(input: UpdateVideoInputModel): void {
    this.data = {
      ...this.data,
      title: input.title,
      author: input.author,
      ...(input.availableResolutions !== undefined && {
        availableResolutions: input.availableResolutions,
      }),
      ...(input.canBeDownloaded !== undefined && {
        canBeDownloaded: input.canBeDownloaded,
      }),
      ...(input.minAgeRestriction !== undefined && {
        minAgeRestriction: input.minAgeRestriction,
      }),
      ...(input.publicationDate !== undefined && {
        publicationDate: input.publicationDate,
      }),
    };
  }
}
