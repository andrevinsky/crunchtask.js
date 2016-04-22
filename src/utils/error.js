/**
 * Created by andrew on 4/23/16.
 */
import type from './type';

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
  throw new Error(['`CT_', errType, '`. Message: ', msg].join(''));
}