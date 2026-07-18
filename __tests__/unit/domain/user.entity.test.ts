import { add } from 'date-fns';
import { ObjectId } from 'mongodb';

import { UserEntity } from '@/modules/users';

describe('UserEntity', () => {
  const baseUser = {
    _id: new ObjectId(),
    accountData: {
      login: 'user1',
      email: 'user1@test.com',
      passwordHash: 'hash',
      createdAt: new Date().toISOString(),
    },
    emailConfirmation: {
      confirmationCode: 'code-123',
      expirationDate: add(new Date(), { hours: 1 }),
      isConfirmed: false,
    },
    recoveryData: null,
  };

  describe('create', () => {
    it('creates user with confirmation data', () => {
      const user = UserEntity.create({
        login: 'newuser',
        email: 'new@test.com',
        passwordHash: 'hashed',
        isConfirmed: false,
      });

      expect(user.email).toBe('new@test.com');
      expect(user.isEmailConfirmed()).toBe(false);
      expect(user.confirmationCode).toBeDefined();
    });

    it('creates confirmed user when isConfirmed is true', () => {
      const user = UserEntity.create({
        login: 'admin',
        email: 'admin@test.com',
        passwordHash: 'hashed',
        isConfirmed: true,
      });

      expect(user.isEmailConfirmed()).toBe(true);
    });
  });

  describe('confirmEmail', () => {
    it('confirms email with valid code', () => {
      const user = UserEntity.reconstitute(baseUser);
      user.confirmEmail('code-123');
      expect(user.isEmailConfirmed()).toBe(true);
    });

    it('throws AlreadyConfirmed when email is already confirmed', () => {
      const user = UserEntity.reconstitute({
        ...baseUser,
        emailConfirmation: {
          ...baseUser.emailConfirmation,
          isConfirmed: true,
        },
      });

      expect(() => user.confirmEmail('code-123')).toThrow('AlreadyConfirmed');
    });

    it('throws CodeMismatch when code does not match', () => {
      const user = UserEntity.reconstitute(baseUser);
      expect(() => user.confirmEmail('wrong-code')).toThrow('CodeMismatch');
    });

    it('throws CodeExpired when confirmation code expired', () => {
      const user = UserEntity.reconstitute({
        ...baseUser,
        emailConfirmation: {
          ...baseUser.emailConfirmation,
          expirationDate: add(new Date(), { hours: -1 }),
        },
      });

      expect(() => user.confirmEmail('code-123')).toThrow('CodeExpired');
    });
  });

  describe('validateRecoveryCode', () => {
    it('validates matching non-expired recovery code', () => {
      const user = UserEntity.reconstitute({
        ...baseUser,
        recoveryData: {
          recoveryCode: 'recovery-123',
          expirationDate: add(new Date(), { days: 1 }),
        },
      });

      expect(() => user.validateRecoveryCode('recovery-123')).not.toThrow();
    });

    it('throws CodeNotFound when recovery data is missing', () => {
      const user = UserEntity.reconstitute(baseUser);
      expect(() => user.validateRecoveryCode('recovery-123')).toThrow(
        'CodeNotFound',
      );
    });

    it('throws CodeMismatch when recovery code does not match', () => {
      const user = UserEntity.reconstitute({
        ...baseUser,
        recoveryData: {
          recoveryCode: 'recovery-123',
          expirationDate: add(new Date(), { days: 1 }),
        },
      });

      expect(() => user.validateRecoveryCode('wrong')).toThrow('CodeMismatch');
    });

    it('throws CodeExpired when recovery code expired', () => {
      const user = UserEntity.reconstitute({
        ...baseUser,
        recoveryData: {
          recoveryCode: 'recovery-123',
          expirationDate: add(new Date(), { days: -1 }),
        },
      });

      expect(() => user.validateRecoveryCode('recovery-123')).toThrow(
        'CodeExpired',
      );
    });
  });

  describe('changePassword', () => {
    it('updates password hash and clears recovery data', () => {
      const user = UserEntity.reconstitute({
        ...baseUser,
        recoveryData: {
          recoveryCode: 'recovery-123',
          expirationDate: add(new Date(), { days: 1 }),
        },
      });

      user.changePassword('new-hash');
      const db = user.toDb();

      expect(db.accountData.passwordHash).toBe('new-hash');
      expect(db.recoveryData).toBeNull();
    });
  });
});
