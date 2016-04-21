/**
 * Created by andrew on 4/20/16.
 */
const __hasOwnProperty = {}.hasOwnProperty;

export default function mirror(obj, prefix = '') {
  for (let prop in obj) {
    //noinspection JSUnfilteredForInLoop
    if (__hasOwnProperty.call(obj, prop)) {
      //noinspection JSUnfilteredForInLoop
      obj[prop] = prefix + prop;
    }
  }
  return obj;
}