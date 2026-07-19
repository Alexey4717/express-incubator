const JWT_EXPIRATION_UNITS: Record<string, string> = {
  s: 'second',
  m: 'minute',
  h: 'hour',
  d: 'day',
};

export const formatJwtExpiration = (expiration: string): string => {
  const match = expiration.match(/^(\d+)([smhd])$/);

  if (!match) {
    return expiration;
  }

  const count = Number(match[1]);
  const unit = JWT_EXPIRATION_UNITS[match[2]];
  const pluralSuffix = count === 1 ? '' : 's';

  return `${count} ${unit}${pluralSuffix}`;
};

export const buildTokenPairResponseDescription = (
  accessExpiration: string,
  refreshExpiration: string,
): string => {
  const accessTtl = formatJwtExpiration(accessExpiration);
  const refreshTtl = formatJwtExpiration(refreshExpiration);

  return `Returns JWT accessToken (expired after ${accessTtl}) in body and JWT refreshToken in cookie (http-only, Secure) (expired after ${refreshTtl}).`;
};

type OpenApiResponse = {
  description?: string;
};

type OpenApiOperation = {
  responses?: Record<string, OpenApiResponse>;
};

type OpenApiSpec = {
  paths?: Record<string, Record<string, OpenApiOperation>>;
};

const TOKEN_PAIR_RESPONSE_PATHS = [
  '/api/auth/login',
  '/api/auth/refresh-token',
] as const;

export const injectTokenTtlDescriptions = (
  spec: OpenApiSpec,
  accessExpiration: string,
  refreshExpiration: string,
): OpenApiSpec => {
  const description = buildTokenPairResponseDescription(
    accessExpiration,
    refreshExpiration,
  );

  for (const path of TOKEN_PAIR_RESPONSE_PATHS) {
    const response = spec.paths?.[path]?.post?.responses?.['200'];

    if (response) {
      response.description = description;
    }
  }

  return spec;
};
