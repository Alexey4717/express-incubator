import { ADMIN_PASSWORD, ADMIN_USERNAME } from './settings/config';
import { AvailableResolutions, LikeStatus } from './types/common';

export const getCorrectIncludesAvailableResolutions = (
  availableResolutions: AvailableResolutions[],
): boolean => {
  const enumValues = Object.values(AvailableResolutions);
  const intersections = availableResolutions.filter(
    (key) => !enumValues.includes(key),
  );
  return Boolean(intersections.length);
};

export const getCorrectCommentLikeStatus = (
  commentLikeStatus: LikeStatus,
): boolean => {
  const enumValues = Object.values(LikeStatus);
  return enumValues.includes(commentLikeStatus);
};

export const getEncodedAuthToken = () => {
  return Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`, 'utf-8').toString(
    'base64',
  );
};

type CalculateAndGetSkipValueArgs = {
  pageNumber: number;
  pageSize: number;
};

export const calculateAndGetSkipValue = ({
  pageNumber,
  pageSize,
}: CalculateAndGetSkipValueArgs) => {
  return (pageNumber - 1) * pageSize;
};
