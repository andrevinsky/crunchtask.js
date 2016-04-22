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