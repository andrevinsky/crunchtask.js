/**
 * Created by andrew on 4/23/16.
 */

import Range from '../essentials/range';

export function normalizeRanges (...args) {
  return new Range(args);
};