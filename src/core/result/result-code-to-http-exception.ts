import { constants } from 'http2';

import { ResultStatus } from './result-code';

export const resultCodeToHttpStatus = (status: ResultStatus): number => {
  switch (status) {
    case ResultStatus.Unauthorized:
      return constants.HTTP_STATUS_UNAUTHORIZED;
    case ResultStatus.NotFound:
      return constants.HTTP_STATUS_NOT_FOUND;
    case ResultStatus.BadRequest:
      return constants.HTTP_STATUS_BAD_REQUEST;
    case ResultStatus.Forbidden:
      return constants.HTTP_STATUS_FORBIDDEN;
    default:
      return constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
  }
};
