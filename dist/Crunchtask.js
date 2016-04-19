(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('Crunchtask', [], factory);
  } else if (typeof exports !== "undefined") {
    factory();
  } else {
    var mod = {
      exports: {}
    };
    factory();
    global.Crunchtask = mod.exports;
  }
})(this, function () {});