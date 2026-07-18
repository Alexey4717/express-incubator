import { GetMappedVideoOutputModel } from '../../models/GetVideoOutputModel';

export interface IVideosQueryRepository {
  getVideos(): Promise<GetMappedVideoOutputModel[]>;
  findVideoById(id: string): Promise<GetMappedVideoOutputModel | null>;
}
