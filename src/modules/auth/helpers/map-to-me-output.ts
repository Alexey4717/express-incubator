import { TUserDb } from '../../users/models/GetUserOutputModel';
import { MeOutputModel } from '../models/MeOutputModel';

export const getMappedMeViewModel = ({
  _id,
  accountData,
}: TUserDb): MeOutputModel => ({
  email: accountData.email,
  login: accountData.login,
  userId: _id.toString(),
});
