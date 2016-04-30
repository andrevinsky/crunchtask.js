/**
 * Created by andrew on 4/20/16.
 */
import mirror from '../utils/mirror';

export const EVENT_NAMES = mirror({
  run: null,
  done: null,
  fail: null,
  abort: null,
  error: null,
  progress: null,
  idle: null
}, 'event.');

export const STATE_NAMES = mirror({
  init    : null,
  error   : null,
  running : null,
  paused  : null,
  resolved: null,
  rejected: null,
  aborted : null
}, 'state.');

export const NEED_REPEAT_STATES = {
  [STATE_NAMES.running]: true,
  [STATE_NAMES.paused]: true
};

export const VERBOSE_STATES = {
  [STATE_NAMES.resolved]: 'success',
  [STATE_NAMES.rejected]: 'failure',
  [STATE_NAMES.error]: 'error',
  [STATE_NAMES.aborted]: 'aborted'
};

export const SETTLED_STATES = {
  [STATE_NAMES.error]: true,
  [STATE_NAMES.resolved]: true,
  [STATE_NAMES.rejected]: true,
  [STATE_NAMES.aborted]: true
};

export const ERROR_CODES = {
  DESCRIPTION_FN_MISS: 'DESCRIPTION_FN_MISS',
  DESCRIPTION_INSIDE: 'DESCRIPTION_INSIDE',
  DESCRIPTION_INIT_FN_MISS: 'DESCRIPTION_INIT_FN_MISS',
  TASK_INIT_INSIDE: 'TASK_INIT_INSIDE',
  TASK_BODY_INSIDE: 'TASK_BODY_INSIDE',
  TASK_FIN_INSIDE: 'TASK_FIN_INSIDE',
  DESCRIPTION_BODY_FN_MISS: 'DESCRIPTION_BODY_FN_MISS',
  DESCRIPTION_BODY_REPEAT_WRONG: 'DESCRIPTION_BODY_REPEAT_WRONG',
  DESCRIPTION_BODY_TIMEOUT_WRONG: 'DESCRIPTION_BODY_TIMEOUT_WRONG',
  DESCRIPTION_FIN_FN_MISS: 'DESCRIPTION_FIN_FN_MISS'
};

export const ERROR_MESSAGES = {
  [ERROR_CODES.DESCRIPTION_INIT_FN_MISS]: 'Init setup expects an optional parameter of type function only.',
  [ERROR_CODES.DESCRIPTION_BODY_FN_MISS]: 'Body setup expects a function as the first optional arg.',
  [ERROR_CODES.DESCRIPTION_BODY_REPEAT_WRONG]: 'Body setup expects a number or false as the second optional arg.',
  [ERROR_CODES.DESCRIPTION_BODY_TIMEOUT_WRONG]: 'Body setup expects a number as the 3rd optional arg.',
  [ERROR_CODES.DESCRIPTION_FIN_FN_MISS]: 'Fin setup expects a function as a first optional arg.'
};