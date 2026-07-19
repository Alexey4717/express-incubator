import { constants } from 'http2';

import { DomainExceptionCode } from '../domain-exception-code';

export const mapDomainExceptionCodeToHttpStatus = (
  code: DomainExceptionCode,
): number => {
  switch (code) {
    case DomainExceptionCode.Unauthorized:
      return constants.HTTP_STATUS_UNAUTHORIZED;
    case DomainExceptionCode.NotFound:
      return constants.HTTP_STATUS_NOT_FOUND;
    case DomainExceptionCode.Forbidden:
      return constants.HTTP_STATUS_FORBIDDEN;
    case DomainExceptionCode.InternalServerError:
      return constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
    case DomainExceptionCode.BadRequest:
    case DomainExceptionCode.ValidationError:
    case DomainExceptionCode.ConfirmationCodeExpired:
    case DomainExceptionCode.EmailNotConfirmed:
    case DomainExceptionCode.PasswordRecoveryCodeExpired:
    default:
      return constants.HTTP_STATUS_BAD_REQUEST;
  }
};
