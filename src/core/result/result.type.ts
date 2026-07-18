import { ResultStatus } from './result-code';

export type ExtensionType = Record<string, string>;

export type Result<T = null> = {
  status: ResultStatus;
  data?: T;
  extensions?: ExtensionType;
  errorMessage?: string;
};
