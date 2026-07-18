import { GetUserOutputModelFromMongoDB } from '../../users/models/GetUserOutputModel';
import { MeOutputModel } from '../models/MeOutputModel';

export const getMappedMeViewModel = ({
  _id,
  accountData,
}: GetUserOutputModelFromMongoDB): MeOutputModel => ({
  email: accountData.email,
  login: accountData.login,
  userId: _id.toString(),
});
