/* eslint-disable no-undef */
import assert from 'assert';
import Or from '../src/async-or';

/**
 *
 */
describe('Or', () => {
  /**
   *
   */
  it('should return a Promise', () => {
    assert(Or(true, true) instanceof Promise);
  });
  /**
   *
   */
  it('should resolve to true if one of the values are truthy', (done) => {
    Or(true, true).then(x => (x ? done() : done(false)));
  });
  /**
   *
   */
  it('should resolve to false if both resolved values are falsey', (done) => {
    Or(false, false).then(x => (x ? done(false) : done()));
  });
});
