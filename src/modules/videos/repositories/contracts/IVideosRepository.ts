import { ObjectId } from 'mongodb';

import { TVideoDb } from '../../models/GetVideoOutputModel';
import { UpdateVideoInputModel } from '../../models/UpdateVideoInputModel';

interface UpdateVideoArgs {
  id: string;
  input: UpdateVideoInputModel;
}

export interface IVideosRepository {
  createVideo(newVideo: TVideoDb): Promise<ObjectId | null>;
  updateVideo(args: UpdateVideoArgs): Promise<boolean>;
  deleteVideoById(id: string): Promise<boolean>;
}
