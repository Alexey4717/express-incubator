import {
  GetMappedVideoOutputModel,
  TVideoDb,
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
}: TVideoDb): GetMappedVideoOutputModel => ({
  id: _id.toString(),
  title,
  author,
  canBeDownloaded,
  minAgeRestriction,
  createdAt,
  publicationDate,
  availableResolutions,
});
