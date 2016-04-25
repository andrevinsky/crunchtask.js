/**
 * Created by andrew on 4/19/16.
 */

/* global Crunchtask */
describe('Core', function () {

  it('Crunchtask exists', () => expect(Crunchtask).is.not.undefined);

  describe('Crunchtask has convenience static methods', () => {

    const methods = [
      'for',
      'range',
      'rangeCheck',
      'rangeNextAndCheck',
      'forEach',
      'reduce',
      'config'
    ];

    it('Inventory: ' + methods.join(), () => {

      methods.forEach(method => {
        expect(Crunchtask[method], `Method exists: ${method}`).to.exist;
        expect(typeof Crunchtask[method]).to.equal('function');
      })
    });

    describe('static `range()` method (supercedes `for()`)', () => {
      it('', () => {});

    });
    describe('static `for()` method (deprecated)', () => {
      it('', () => {});

    });
    describe('static `rangeCheck()` method', () => {

      describe('`rangeCheck()` method returns an instance of Range class which has methods:`::valueOf()` and `::canAdvance([bool])`', () => {
        it('inventory - check', () => {
          const range = Crunchtask.rangeCheck(1, 2, true);

          expect(range.valueOf).to.exist;
          expect(typeof range.valueOf).to.equal('function')

          expect(range.canAdvance).to.exist;
          expect(typeof range.canAdvance).to.equal('function')
        });

        describe('`range::canAdvance()` method tries to advance the current position of the ranges structure', () => {

          it('advances the elements of the range structure and responds whether it has not reached the end yet (hasn\'t looped over)', () => {});
          it('inclusive range of [0..1] reaches the end in two calls.', () => {});
          it('', () => {});
          it('', () => {});
          it('', () => {});

        });



      });

      describe('`rangeCheck()` method parses the arguments into async-for-loop-ready structure', () => {
        it('no arguments produces empty ranges array and is OK', () => {

        });
        it('only numerics, bools, and arrays are considered as args', () => {});
        it('a valid range is represented by the array of 3 numbers and an `inclusive` flag', () => {});
        it('the first number represents a range\'s `from` value', () => {});
        it('the second number represents a range\'s `to` value', () => {});
        it('the third number represents a `step` value', () => {});
        it('if the `step` is omitted, it defaults to +1 if (`from` <= `to`), and -1 otherwise', () => {});
        it('if the `inclusive` is omitted, it defaults to `false`', () => {});
        it('so the minimum of two numbers define a range `0,10` mean `from 0 to 10`', () => {});
        it('less than 2 numeric arguments do not represent a valid range and an error is thrown', () => {});
        it('two or more ranges can be defined in a flat list if `inclusive` flag is supplied for each', () => {});
        it('this way, the bools serve as comma. Thus the last bool can be omitted if need be', () => {});
        it('however, this cannot be done safely for mid-list bools, they are obligatory', () => {});
        it('it can be advised to use arrays to group individual ranges', () => {});
        it('the same rules apply to these individual array as for the flat list args described above. Nested arrays are ignored, though', () => {});
        it('arrays can be mixed with the valid ranges chains with expected valid results', () => {});
        it('ranges can be used to imitate binary permutation', () => {});

      });
    });

    describe('static `forEach()` method', () => {
      it('', () => {});

    });
    describe('static `reduce()` method', () => {
      it('', () => {});

    });
    describe('static `config()` method', () => {
      it('', () => {});

    });
  });


  describe('Crunchtask instance methods', () => {

    let task;

    const methods = [
      'then',
      'onRun',
      'onIdle',
      'onError',
      'done',
      'fail',
      'always',
      'progress',
      'isIdle',
      'pause',
      'resume',
      'abort'
    ];

    beforeEach(() => {
      const generator = () => new Crunchtask();
      expect(generator).to.not.throw(Error);

      task = generator();
    });

    it('Instantiation. Instance is a runnable function', () => {
      expect(task).to.exist;

      expect(typeof task, 'is executable').to.equal('function');

      const fn = () => task();
      expect(fn, 'task is executable').to.not.throw();
    });

    // it('Properties inventory: ' + properties.join(), () => {
    //   properties.forEach(prop => {
    //     expect(task, prop).to.have.property(prop);
    //   });
    // });

    it('Methods inventory: ' + methods.join(), () => {
      methods.forEach(method => {
        expect(task[method], `Method exists: ${method}`).to.exist;
        expect(typeof task[method]).to.equal('function');
      });
    });

    it('', () => {});

  });

  describe('When Crunchtask instance is run, a run-task instance is created. With its properties and methods', () => {

    const methods =  [
      'then',
      'onError',
      'abort',
      'pause',
      'resume',
      'done',
      'fail',
      'always',
      'progress'
    ];

    let runTask;

    beforeEach(() => {
      const generator = () => (new Crunchtask())();
      runTask = generator();
    });

    it('The run-task instance is an overloaded Promise', () => {
      expect(runTask).to.exist;
      expect(runTask).to.be.an.instanceof(Promise);
    });

    it('Methods inventory: ' + methods.join(), () => {
      methods.forEach(method => {
        expect(runTask[method], `Method exists: ${method}`).to.exist;
        expect(typeof runTask[method]).to.equal('function');
      });
    });

    it('', () => {});


  });

  describe('Examples in readme.md. Collatz Task', () => {
    let collatzTask = null;

    beforeEach(() => {
      Crunchtask.config({
        // trace: true,
        debug: true
      });

      const descriptionFn = ((init, body, fin) => {
        let nInit = null,
          n  = null,
          threshold = null,
          totalStoppingTime = 0;

        init((_n, _threshold) => {
          nInit = n = _n;
          threshold = _threshold;
        });

        body((resolve, reject) => {
          if (n === 1) {
            return resolve(nInit, totalStoppingTime);
          }
          if (n > threshold) {
            return reject(nInit, threshold, n)
          }
          if (n % 2) {
            n = 3 * n + 1
          } else {
            n = n / 2
          }
          totalStoppingTime++
        }, 100);

        fin((status) => {
          if (!status) {
            console.log(`Collatz conjecture breaking candidate: ${nInit}`)
          }
        });
      });
      
      collatzTask = new Crunchtask(descriptionFn);

    });

    afterEach(() => {
      if (collatzTask) {
        collatzTask.abort();
      }
      collatzTask = null;

      Crunchtask.config();
    });

    it('implements a Collatz conjecture, aka 3n + 1 problem, algorithm', (done) => {
      collatzTask.onIdle(done);
      collatzTask.onError(function(...args) {
        console.log(args.join(''));
      });
      
      [
        [1, 1, 0],
        [6, 6, 8],
        [63728127, 63728127, 949]
      ].forEach(([runVal, expectedVal, expectedCount]) => {
        collatzTask(runVal).done((n, count) => {
          expect(n).to.equal(expectedVal);
          expect(count).to.equal(expectedCount);
        });
      });

      [
        0, 1, 7, 2, 5, 8, 16, 3, 19, 6,
        14, 9, 9, 17, 17, 4, 12, 20, 20,
        7, 7, 15, 15, 10, 23, 10, 111,
        18, 18, 18, 106, 5, 26, 13, 13,
        21, 21, 21, 34, 8, 109, 8, 29, 16,
        16, 16, 104, 11, 24, 24
      ].forEach((v, k) => {
        collatzTask(k + 1).done((n, count) => {
          expect(n).to.equal(k + 1);
          expect(count).to.equal(v);
        });
      });
      
    });
    // it('', () => {});
    // it('', () => {});
    // it('', () => {});

  });


});