/**
 * Created by andrew on 4/23/16.
 */
import type from './type';

export class AppError extends Error {
  constructor(errType, msg) {
    super(`CT_${errType}. Message: ${msg}`);
  }
}

/**
 *
 * @throws Error
 * @param errType
 * @param msg
 */
export default function error(errType, msg) {
  if (type.isUndefined(msg)) {
    msg = errType;
    errType = 'Generic';
  }
  throw new AppError(errType, msg);
}