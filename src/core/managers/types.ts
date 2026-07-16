import { GetUserOutputModelFromMongoDB } from '../../modules/users/models/UserModels/GetUserOutputModel';

export type SendEmailConfirmationMessageInputType = {
  user: GetUserOutputModelFromMongoDB;
  confirmationCode?: string;
};
