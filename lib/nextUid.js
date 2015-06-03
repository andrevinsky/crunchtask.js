/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var uid = 0;

/**
 * Generates new id.
 * @returns {number}
 */
function nextUid() {
  return ++uid;
}

module.exports = nextUid;