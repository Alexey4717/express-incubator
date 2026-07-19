import { add } from 'date-fns';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

import {
  DomainException,
  domainException,
} from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';

import type {
  AccountDataType,
  EmailConfirmationType,
  RecoveryDataType,
} from '../../models/CreateUserInsertToDBModel';
import type { TUserDb } from '../../models/GetUserOutputModel';

export type UserCreateProps = {
  login: string;
  email: string;
  passwordHash: string;
  isConfirmed: boolean;
};

export class UserEntity {
  private constructor(
    private readonly _id: ObjectId,
    private accountData: AccountDataType,
    private emailConfirmation: EmailConfirmationType,
    private recoveryData: RecoveryDataType | null,
  ) {}

  static create(props: UserCreateProps): UserEntity {
    return new UserEntity(
      new ObjectId(),
      {
        login: props.login,
        email: props.email,
        passwordHash: props.passwordHash,
        createdAt: new Date().toISOString(),
      },
      {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmed: props.isConfirmed,
      },
      null,
    );
  }

  static reconstitute(raw: TUserDb): UserEntity {
    return new UserEntity(
      raw._id,
      { ...raw.accountData },
      { ...raw.emailConfirmation },
      raw.recoveryData ? { ...raw.recoveryData } : null,
    );
  }

  get id(): ObjectId {
    return this._id;
  }

  get email(): string {
    return this.accountData.email;
  }

  get confirmationCode(): string {
    return this.emailConfirmation.confirmationCode;
  }

  toDb(): TUserDb {
    return {
      _id: this._id,
      accountData: { ...this.accountData },
      emailConfirmation: { ...this.emailConfirmation },
      recoveryData: this.recoveryData ? { ...this.recoveryData } : null,
    };
  }

  isEmailConfirmed(): boolean {
    return this.emailConfirmation.isConfirmed;
  }

  assertNotConfirmed(): void {
    if (this.isEmailConfirmed()) {
      throw domainException(DomainExceptionCode.BadRequest, 'AlreadyConfirmed');
    }
  }

  confirmEmail(code: string): void {
    this.assertNotConfirmed();
    if (this.emailConfirmation.confirmationCode !== code) {
      throw domainException(DomainExceptionCode.BadRequest, 'CodeMismatch');
    }
    if (this.emailConfirmation.expirationDate <= new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeExpired,
        message: 'CodeExpired',
        extensions: [{ key: 'reason', message: 'CodeExpired' }],
      });
    }
    this.emailConfirmation = {
      ...this.emailConfirmation,
      isConfirmed: true,
    };
  }

  validateRecoveryCode(recoveryCode: string): void {
    if (!this.recoveryData) {
      throw domainException(DomainExceptionCode.BadRequest, 'CodeNotFound');
    }
    if (this.recoveryData.recoveryCode !== recoveryCode) {
      throw domainException(DomainExceptionCode.BadRequest, 'CodeMismatch');
    }
    if (this.recoveryData.expirationDate <= new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'CodeExpired',
        extensions: [{ key: 'reason', message: 'CodeExpired' }],
      });
    }
  }

  changePassword(passwordHash: string): void {
    this.accountData = { ...this.accountData, passwordHash };
    this.recoveryData = null;
  }

  setRecoveryData(recoveryData: RecoveryDataType): void {
    this.recoveryData = recoveryData;
  }

  updateConfirmationCode(newCode: string): void {
    this.emailConfirmation = {
      ...this.emailConfirmation,
      confirmationCode: newCode,
      expirationDate: add(new Date(), { hours: 1 }),
    };
  }
}
