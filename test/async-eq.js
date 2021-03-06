/* eslint-disable no-undef */
import assert from 'assert';
import EQ from '../src/async-eq';

/**
 *
 */
describe('EQ', () => {
  /**
   *
   */
  it('should return a Promise', () => {
    assert(EQ(true, true) instanceof Promise);
  });
  /**
   *
   */
  it('should resolve to true if both values are equal', (done) => {
    EQ(true, true).then(x => (x ? done() : done(false)));
  });
  /**
   *
   */
  it('should resolve to false if both values are not equal', (done) => {
    EQ(false, true).then(x => (x ? done(false) : done()));
  });
});
