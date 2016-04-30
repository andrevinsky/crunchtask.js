/**
 * Created by andrew on 4/23/16.
 */
import error from '../utils/error';
import type from '../utils/type';

class Range {
  constructor(...args) {
    if ((args.length > 1) || (!type.isArray(args[0]))) {
      error('Ranges', 'Pass strictly a single arguments of type array');
    }
    const [ data ] = args;
    this.data = translateRangeArgs(parseRangeArgs(data));
  }
  
  toString() {
    return verbose.apply(this);
  }
  
  valueOf() {
    return verbose.apply(this);
  }
  
  canAdvance(justCheck) {
    var currentR = 0,
      ranges = this.data,
      maxR = ranges.length,
      range,
      counterOverflow,
      rangeInBounds;

    do {
      counterOverflow = false;
      range = ranges[currentR];

      if (justCheck !== true) {
        range.current += range.step;
      }

      if ((!range.inclusive && (range.current === range.to)) || ((range.step > 0) ? (range.current > range.to) : (range.current < range.to))) {
        range.current = range.from;
        counterOverflow = true;
        currentR++;
      }

      rangeInBounds = (currentR < maxR);

    } while (counterOverflow && rangeInBounds);

    return (!counterOverflow && rangeInBounds);
  }
}

function map(arr, fn) {
  const result = new Array(arr.length);
  
  for (let i = 0, maxI = arr.length; i < maxI; i++) {
    result[i] = fn(arr[i], i);
  }
  
  return result;
}

function verbose() {
  return map(this.data, (v) => v.current);
}

function translateRangeArgs(args) {
  return map(args, translateRangeSet);
}

function translateRangeSet(rangeSet) {
  const rangeLength = rangeSet.length,
    last = rangeLength - 1,
    lastIsBool = type.isBoolean(rangeSet[last]);

  let step;

  //noinspection FallThroughInSwitchStatementJS
  switch (rangeLength - ((lastIsBool) ? 1 : 0)) {
    case 2: // fallthrough
    case 3: // fallthrough
    {
      step = (((rangeLength - ((lastIsBool) ? 1 : 0)) === 3) ?
        rangeSet[2] : ((rangeSet[0] <= rangeSet[1]) ? 1 : -1));
      return {
        from     : rangeSet[0],
        current  : rangeSet[0],
        to       : rangeSet[1],
        step     : step,
        inclusive: lastIsBool ? rangeSet[rangeLength - 1] : false
      };
    }

    case 0: // fallthrough
    case 1: // fallthrough
      error('Ranges', 'Use at least two values to define a range.');
      break;

    default:
      if (((rangeLength % 2) === 0) && ((rangeLength % 3) === 0)) {
        error('Ranges', 'Use arrays to split range parts. Cannot determine pattern now.');
      } else {
        error('Ranges', 'Use arrays to split range parts properly.');
      }
  }
}

function parseRangeArgs(args, preventRecursion) {
  const result = [];

  let current = [],
    item,
    isArrayFlag;

  while (args.length) {
    item = args.splice(0, 1)[0];
    isArrayFlag = type.isArray(item);

    if (isArrayFlag && (preventRecursion !== true)) {
      if (current.length) {
        result.push(current);
        current = [];
      }
      result.push(parseRangeArgs(item, true));
    } else if (type.isBoolean(item)) {
      current.push(item);
      result.push(current);
      current = [];
    } else if (type.isNumber(item)) {
      current.push(item);
    }
  }

  if (current.length) {
    result.push(current);
  }

  return (preventRecursion === true) ? result[0] : result;
}

export default Range;