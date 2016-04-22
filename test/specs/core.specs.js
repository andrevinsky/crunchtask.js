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

  it('Crunchtask has properties and methods', () => {
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

  it('Crunchtask\'s run-instance properties and methods', () => {
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

  // it('it can send friendly messages', () => {
  //   var greeter = new Greeter()
  //   expect(greeter.message).is.equal('hi there Dear Coder!')
  //   // these white spaces will be trimmed
  //   greeter.message = '   goodbye         '
  //   expect(greeter.message).is.equal('goodbye Dear Coder!')
  // })
})