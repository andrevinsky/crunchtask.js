/**
 * Created by andrew on 4/19/16.
 */

/* global Crunchtask */
describe('Core', function () {
  it('Crunchtask exists', () => expect(Crunchtask).is.not.undefined);

  it('Crunchtask has static methods', () => {

    [
      'for',
      'range',
      'rangeCheck',
      'rangeNextAndCheck',
      'forEach',
      'reduce',
      'config'
    ].forEach(method => {
      expect(Crunchtask[method], `Method exists: ${method}`).to.exist;
      expect(typeof Crunchtask[method]).to.equal('function');
    })
  });

  it('Crunchtask instance has properties and methods', () => {
    const generator = () => new Crunchtask();
    expect(generator).to.not.throw(Error);

    const task = generator();
    expect(task).to.exist;
    expect(typeof task, 'is executable').to.equal('function');

    const fn = () => task();
    expect(fn, 'task is executable').to.not.throw();

    expect(task, 'id').to.have.property('id');
    expect(task, 'timestamp').to.have.property('timestamp');
    expect(task, 'runCount').to.have.property('runCount');

    [
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
    ].forEach(method => {
      expect(task[method], `Method exists: ${method}`).to.exist;
      expect(typeof task[method]).to.equal('function');
    });

  });

  it('Crunchtask\'s run-instance has properties and methods', () => {
    const generator = () => (new Crunchtask())();
    const runTask = generator();

    expect(runTask).to.exist;
    expect(runTask).to.be.an.instanceof(Promise);

    [
    'then',
      'onError',
      'abort',
      'pause',
      'resume',
      'done',
      'fail',
      'always',
      'progress'
    ].forEach(method => {
      expect(runTask[method]).to.exist;
      expect(typeof runTask[method]).to.equal('function');
    })

  });

  describe('CrunchTask convenience static methods:', () => {
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


});