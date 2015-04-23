# ChrunchTask.js [![Code Climate](https://codeclimate.com/github/AndrewRevinsky/crunchtask.js/badges/gpa.svg)](https://codeclimate.com/github/AndrewRevinsky/crunchtask.js) [![Build Status](https://travis-ci.org/AndrewRevinsky/crunchtask.js.svg?branch=v0.5.0)](https://travis-ci.org/AndrewRevinsky/crunchtask.js) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/AndrewRevinsky/crunchtask.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Gratipay](https://img.shields.io/gratipay/AndrewRevinsky.svg?style=flat)](https://www.gratipay.com/AndrewRevinsky/)



**Parallel execution like never before**. ChrunchTask.js is a javascript library that allows execution of lengthy logic without freezing your browser. It is based on intuitive usage pattern and utilizes native promises where possible.

ChrunchTask.js supports chaining the tasks execution and is designed to be used in contexts where heavy computation is expected, such as computing dots for scatter-plots graphs.

## Using

ChrunchTask.js can be used in browsers:

    bower install chrunchtask --save

or in nodejs,

    npm install chrunchtask --save

for all kinds of asynchronously run tasks that might make your program unresponsive.

## Usage Example

First, let's find a math problem that might need doing some iterations. A [Collatz Conjecture](http://en.wikipedia.org/wiki/Collatz_conjecture) may be the one we're looking for. We're making a task that will count the number of iteration it takes for a given number to come to 1.

```javascript
var collatzTask = new CrunchTask(function(init, body, fin){

  var nInit, n, threshold, totalStoppingTime = 0;

  init(function(_n, _threshold){
    nInit = n = _n;
    threshold = _threshold;
  });

  body(function(resolve, reject){
    if (n === 1) return resolve(nInit, totalStoppingTime);
    if (n > threshold) return reject(nInit, threshold, n);
    n = ((n % 2) ? 3 * n + 1 : n / 2);
    totalStoppingTime++;
  }, 100);

  fin(function(status){
    if (status === false)
      console.log('Collatz conjecture breaking candidate:', nInit);
  });

});

for(var i = 0; i < 1000; i++) {
  collatzTask.run(i, 10000).then(function(n, totalStoppingTime){
    // Plot the value
  }, function(n, threshold,  reached){
    // Write to math community
  });
}

```

Refer towards the end of the spec unit-test file (`test/unit/crunchtaskSpec.coffee`) for the working example.

## How do we come to this setup?

### Description function

**Instantiation.** `new ChrunchTask(fn)`, `fn` is a required function that takes three parameters: `function(init, body, fin)`

At first, we need to create an instance of a `ChrunchTask` with a function, passed as the only parameter, to the `new CrunchTask`. This function is called a _description function_. Without it, a task cannot be said to be described, thus has no meaning at all. A _description function_ takes three parameters, `init`, `body`, and `fin`:

```javascript
var collatzTask = new ChrunchTask(function(init, body, fin){

  //...
  //...
  //...

});

```

This _description function_ provides the means for the task to receive parameters at the beginning of its execution, process them, and, optionally, do something in the end, after the execution has finished. It will get called once the `run()` method of the task is executed.


During run-time the _description function_ receives three parameters, three functions, `init`, `body`, and `fin`, called _initialization setup_, _body setup_, and _finalization setup_ respectively.


Once the task is properly set up, we can do the processing as many times as we want with its `run()` method, to which we pass the values we need processing performed on:

```javascript
var runInstance1 = task.run(1, .5);
var runInstance2 = task.run(-1, 1);
```

### Initialization setup function and Init function

**Local variables intitialization.** `init(fn)`, a call to `init` inside a _description function_ is optional. `fn` is optional, and is a function that takes variable number of arguments: `function(arg0, arg1, arg2,..)` - initialization values passed from `task.run(arg0, arg1, arg2,..)`.


How do the arguments get inside the task? With the help of a function passed as a parameter to `init`, _initialization setup_ function. We will call it an _init function_ now on. That's the only parameter passed to the _initialization setup_.

First, declare the variables you plan to use inside your _description function_ and then initialize them inside the _init function_ as so:

```javascript
var collatzTask = new CrunchTask(function(init, body, fin){

  var nInit, n, threshold, totalStoppingTime = 0;

  init(function(_n, _threshold){
    nInit = n = _n;
    threshold = _threshold;
  });

  //...

});

// collatzTask.run(27, 10000);
```


How did we know that the `init` function would take two arguments? But it is us who designed it this way. If the task is supposed to take two arguments at `run()` calling, then it is the _init function_ whose responsibility is to accept them at run-time and assign them to local variables.

Unlike for those implementations that pass around a sort of a state-carrying object, our approach localizes the values once and treats them as local.

### Body setup function

**Algorithm description setup.** `body(fn, timeLimit, timeout)`; a call to `body` inside a _description function_ is required.
`fn` is required, and is a function that takes 3 arguments: `function(resolve, reject, notify)` - implements the logic, signals of its completion/failure/progress by calling `resolve(..)`, `reject(..)`, and `notify(..)`.
`timeLimit`, Number of `false`, optional, default is 0; is a time limit, in ms, for a number of consecutive iterations allowed to take before re-queueing the rest. `false` tells the `fn` to get executed only once.
`timeout`, Number, optional, default is 0; is a timeout amount after which the next queued execution starts.


What use is it if we only receive the values and do nothing about them? Right. Heading forth, to the second parameter passed to the _description function_ as a `body` parameter that we called _body setup_ function.
It takes three arguments: one required, and two optional.
We can call it a _body function_.

#### Body function

**First parameter to a _body setup_, `function(resolve, reject, notify)`**

The first parameter a _body setup_ function accepts is called a _body function_. The logic of your iterating task is supposed to be there because it is this function that is going to be called over and over again until a Promise associated with this process is either resolved or rejected. This function is supposed to make use of the variables declared in the _description function_ and assigned later when the _init function_ is called.

The _body function_ accepts three arguments. In a manner that Promise's constructor function accepts `resolve` and `reject` parameters - functions by which a promise is resolved or rejected (TODO: a link here please), the _body function_ does so three: `resolve`, `reject`, and `notify`.

If a logic finds the results of the iteration satisfactory, i.e. the goal is reached, it calls the `resolve` function with as many arguments to pass as it sees fit. (Note, it is unlike the `resolve` of a Promise, where there can be only one parameter.)

If a logic finds the state of things to never reach the goal, it calls the 'reject' function with the desirable number of parameters. (Note, same difference here.)

If a logic wants to update the calling party of its state (for the purpose of animation or progress tracking) it can use a `notify` function.

Thus, we've come to this step:


```javascript
var collatzTask = new CrunchTask(function(init, body, fin){

  var nInit, n, threshold, totalStoppingTime = 0;

  init(function(_n, _threshold){
    nInit = n = _n;
    threshold = _threshold;
  });

  body(function(resolve, reject){
    if (n === 1) return resolve(nInit, totalStoppingTime);
    if (n > threshold) return reject(nInit, threshold, n);
    n = ((n % 2) ? 3 * n + 1 : n / 2);
    totalStoppingTime++;
  });

  //...

});

```

#### Consecutive execution time limit

**Second parameter to a _body setup_, optional, `Number` or `false`, default: 0**

With no additional parameters to the _body setup_, each consecutive call to a _body function_ will be queued after execution of the previous one with the help of setTimeout(fn, 0). But sometimes you can execute a number of iteration before the browser becomes unresponsive, or even, lagging becomes noticeable. So we can specify - with a second parameter passed to a _body setup_ - a time limit for consecutive iterations before starting breaking the process with the setTimeout. In the initial example, it is 100:


```javascript
//...

  body(function(resolve, reject){
    if (n === 1) return resolve(nInit, totalStoppingTime);
    if (n > threshold) return reject(nInit, threshold, n);
    n = ((n % 2) ? 3 * n + 1 : n / 2);
    totalStoppingTime++;
  }, 100);

//...
```

If you need the _body function_ to run only once, and never to queue up again, explicitly pass `false` as a second parameter to _body setup_.

#### Timeout amount

**Third parameter to a _body setup_, optional, `Number`, default: 0**

If the _body function_ is expected to be re-queued for execution not immediately but with a given timeout, the third parameter is just about that. Internally this value, if specified, or 0, is used with the `setTimeout`.


### Finalization setup

**Finalization setup.** `fin(fn)`; a call to `fin` inside a _description function_ is optional.
`fn` is optional, and is a function that takes 1 parameter: `function(status)` - implements the logic that is supposed to take place _after_ the computation is complete, e.g. values checking, debugging, console output, etc. The `status` can be of values: `true` (resolved), `false` (rejected), and a string `'aborted'`.

The _finally function_ is useful for debugging purposes and for coding clarity because it allows to see the local variables still, unlike the done/fail handlers. The only argument it receives from the finished run-task is a status: `true` - resolved, `false` - rejected. There's no need for extra data as it is easily obtained from the closest scope.

```javascript
//...

  fin(function(status){
    if (status === false)
      console.log('Collatz conjecture breaking candidate:', nInit);
  });

//...
```


## API

### Instantiation

```
// creates a task object
var task = new ChrunchTask(function(init, body, fin){
  // local variables, just declaration

  // optional:
  init(function(/* run-time values*/){
    // assignment of run-time values to the declared variables
  });

  // required:
  body(function(resolve /*fn*/, reject /*fn*/, notify /*fn*/){
      // logic that may call resolve or reject
    },
    timeframeLimit /* optional; false, or number; default: true*/,
    timeout /* optional; number; default: 0*/
  );

  // optional:
  fin(function(status /*bool*/){
    // logging, or value-checking
  });
});
```

### Task object

`Task` object

  Properties:

  * `id`: number - unique identifier of a task
  * `timestamp`: number - timestamp of the time the task declaration was created

  Methods:

  * `run(args)`: `run-task` instance, _arbitrary arguments, optional_
  * `then(task)`: `task` instance, _argument: task, required_
  * `onRun(fn)`:
  * `done(fn)`:
  * `fail(fn)`:
  * `always(fn)`:
  * `progress(fn)`:
  * `abort()`:
  * `pause()`:
  * `resume()`:

### Run-task object

`Run-task` object, Promise-based

  Methods:

  * all methods of a Promise instance
  * `abort()`:
  * `pause()`:
  * `resume()`:


## Other samples

**Mandelbrot sample**

```javascript
var mandelbrot = new ChrunchTask(function(init, body, fin){

  var xR, xI, cR, cI, zR, zI, maxIter, count = 0;

  init(function(_xR, _xI, _cR, _cI, _maxIter){
    zR = xR = _xR; zI = xI = _xI;
    cR = _cR; cI = _cI;
    maxIter = _maxIter || 10000;
  });

  body(function(resolve, reject){
    var zR = zR * cR - zI * cI;
    var zI = zR * cI + zI * cR;
    var isInside = Math.sqrt(zR * zR + zI * zI) < 2.0;
    count++;
    if (maxIter-- && isInside) return;
    if (isInside) {
      resolve (xR, xI);
    } else {
      reject (xR, xI, count);
    }
  }, 100);


  fin(function(status){
    if (status === true) {
      // ..
    }
  });

});

```

