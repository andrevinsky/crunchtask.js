/**
 * Created by ANDREW on 6/4/2015.
 */
'use strict';

var CrunchTask = require('./typeCrunchtask');

function resolvedTask() {
  return new CrunchTask(function (init, body) {
    body(function (resolve) {
      resolve();
    });
  });
}

module.exports = resolvedTask;