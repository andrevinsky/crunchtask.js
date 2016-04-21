/**
 * Created by andrew on 4/19/16.
 */

/* global Crunchtask */
describe('Core', function() {
  it('Crunchtask exists', () => expect(Crunchtask).is.not.undefined );

  it('Crunchtask has properties and methods', () => {
    const generator = () => new Crunchtask();
    expect(generator).to.not.throw(Error);

    const task = generator();
    const fn = () => task();

    expect(task).to.exist;
    expect(typeof task, 'is executable').to.equal('function');
    expect(fn, 'task is executable').to.not.throw();

    expect(task, 'id').to.have.property('id');
    expect(task, 'timestamp').to.have.property('timestamp');
    expect(task, 'runCount').to.have.property('runCount');

    expect(task.then, 'then()').to.exist;
    expect(typeof task.then).to.equal('function');

    expect(task.onRun, 'onRun()').to.exist;
    expect(typeof task.onRun).to.equal('function');

    expect(task.onIdle, 'onIdle()').to.exist;
    expect(typeof task.onIdle).to.equal('function');

    expect(task.onError, 'onError()').to.exist;
    expect(typeof task.onError).to.equal('function');

    expect(task.done, 'done()').to.exist;
    expect(typeof task.done).to.equal('function');

    expect(task.fail, 'fail()').to.exist;
    expect(typeof task.fail).to.equal('function');

    expect(task.always, 'always()').to.exist;
    expect(typeof task.always).to.equal('function');

    expect(task.progress, 'progress()').to.exist;
    expect(typeof task.progress).to.equal('function');

    expect(task.isIdle, 'isIdle()').to.exist;
    expect(typeof task.isIdle).to.equal('function');

    expect(task.pause, 'pause()').to.exist;
    expect(typeof task.pause).to.equal('function');

    expect(task.resume, 'resume()').to.exist;
    expect(typeof task.resume).to.equal('function');

    expect(task.abort, 'abort()').to.exist;
    expect(typeof task.abort).to.equal('function');

  });


  // it('it can send friendly messages', () => {
  //   var greeter = new Greeter()
  //   expect(greeter.message).is.equal('hi there Dear Coder!')
  //   // these white spaces will be trimmed
  //   greeter.message = '   goodbye         '
  //   expect(greeter.message).is.equal('goodbye Dear Coder!')
  // })
})