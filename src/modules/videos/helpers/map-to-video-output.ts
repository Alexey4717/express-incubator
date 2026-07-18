import {
  GetMappedVideoOutputModel,
  GetVideoOutputModelFromMongoDB,
} from '../models/GetVideoOutputModel';

export const getMappedVideoViewModel = ({
  _id,
  title,
  author,
  canBeDownloaded,
  minAgeRestriction,
  createdAt,
  publicationDate,
  availableResolutions,
}: GetVideoOutputModelFromMongoDB): GetMappedVideoOutputModel => ({
  id: _id.toString(),
  title,
  author,
  canBeDownloaded,
  minAgeRestriction,
  createdAt,
  publicationDate,
  availableResolutions,
});
