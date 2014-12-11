# ChrunchTask.js [![Code Climate](https://codeclimate.com/repos/54883c95695680713a004a6b/badges/d8e7276dff45127450bb/gpa.svg)](https://codeclimate.com/repos/54883c95695680713a004a6b/feed)

**Parallel execution like never before**. ChrunchTask.js is a javascript library that allows execution of lengthy logic without freezing your browser. It is based on intuitive usage pattern and utilizes native promises where possible.

ChrunchTask.js supports chaining the tasks execution and is designed to be used in contexts where heavy computation is expected, such as computing dots for scatter-plots graphs.

## Using

ChrunchTask.js can be used as a part ..

    bower install chrunchtask

..

## Example A. Simple


```javascript
var mandelbrot = new ChrunchTask(function(init, body, fin){

  var xR, xI, cR, cI, zR, zI, maxIter;

  init(function(_xR, _xI, _cR, _cI, _maxIter){
    zR = xR = _xR; zI = xI = _xI;
    cR = _cR; cI = _cI;
    maxIter = _maxIter || 10000;
  });


  body(function(resolve, reject){
    var zR = zR * cR - zI * cI;
    var zI = zR * cI + zI * cR;
    var isInside = Math.sqrt(zR * zR + zI * zI);
    maxIter--;

  });



});
```


## Example B. Fully exploited

```javascript
```

```javascript
```



