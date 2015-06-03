/**
 * @preserve
 * @module CrunchTask
 * Created by AndrewRevinsky on 10/10/2014.
 */
(function () {

  'use strict';

  var CrunchTaskImpl = require('./typeCrunchtaskImpl'),
    CrunchTaskStatic = require('./typeCrunchtaskStatics'),
    CrunchTask = require('./typeCrunchtask');

  //noinspection JSUnusedAssignment,SillyAssignmentJS
  CrunchTaskImpl = CrunchTaskImpl;

  //noinspection JSUnusedAssignment,SillyAssignmentJS
  CrunchTaskStatic = CrunchTaskStatic;


  var root = typeof window === 'object' && window ? window : (((typeof process !== 'undefined') && (typeof module !== 'undefined' && module.exports)) ? module.exports : {});

  root.CrunchTask = CrunchTask;

  CrunchTask.config(false);

})();
