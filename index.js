'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */
/**
 * @ignore
 */
const resolve = Promise.resolve.bind(Promise);
/**
 * @ignore
 */
const all = Promise.all.bind(Promise);

/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */

/**
 * Fundamental async decision-making control structure
 *
 * AsyncIf evaluates the given value, synchronous or asynchronous
 * and executes the "then" callback if the value is truthy, otherwise
 * executes the "else" or "elseIf" callbacks.
 *
 * Both the tested value and the callbacks can be asynchronous.
 */
class AsyncIf {
  /**
   * Creates an AsyncIf instance
   *
   * It is highly recommended that the given value
   * be a Promise instance.
   * @example
   * const asyncIf = new AsyncIf(sleep(5000, true));
   * @param {?Promise} promise
   */
  constructor(promise) {
    /**
     * The promise context of the AsyncIf instance
     * @type {?Promise}
     */
    this.promise = resolve(promise);
  }

  /**
   * Attaches a callback to an AsyncIf instance and executes
   * the callback if the AsyncIf's resolved value is truthy.
   * @example
   * new AsyncIf(Promise.resolve(x % 2 == 0)).then(() => console.log("Value is even!"));
   * @param {?Function} scope
   * @returns {AsyncIf}
   */
  then(scope) {
    if (typeof scope === 'function') {
      return new AsyncIf(
        this.promise.then(x => (x ? resolve(scope()).then(() => x) : this.promise)),
      );
    }
    return this;
  }

  /**
   * Attaches a callback to an AsyncIf instance and executes
   * the callback if the AsyncIf's resolved value is falsey.
   * @example
   * new AsyncIf(Promise.resolve(x % 2 == 0)).else(() => console.log("Value is odd!"));
   * @param {?Function} scope
   * @returns {AsyncIf}
   */
  else(scope) {
    if (typeof scope === 'function') {
      return new AsyncIf(
        this.promise.then(x => (x ? this.promise : resolve(scope()).then(() => x))),
      );
    }
    return this;
  }

  /**
   * Attaches an AsyncIf to an AsyncIf instance that evaluates
   * if the AsyncIf's resolved value is falsey.
   * @example
   * new AsyncIf(Promise.resolve(x % 2 == 0))
   *   .elseIf(x % 2 == 1)
   *     .then() => console.log("Value is odd!"));
   * @param {?Function} promise
   * @returns {AsyncIf}
   */
  elseIf(promise) {
    return new AsyncIf(this.promise.then(x => (x ? false : promise)));
  }
}

/**
 * A switch statement is a type of selection control mechanism
 * used to allow the value of a variable or expression to change
 * the control flow of program execution via search and map.
 */
class AsyncSwitch {
  /**
   * Creates an AsyncSwitch instance given
   * the subject to be selected with.
   * @param {Function|Promise|any} subject
   */
  constructor(subject) {
    /**
     * @type {Function|Promise|any}
     */
    this.subject = subject;
    /**
     * @private
     * @ignore
     */
    this.cases = [];
  }

  /**
   * Register values to be selected from
   * @param  {...any} matches
   * @returns {AsyncSwitch}
   */
  case(...matches) {
    /**
     * @private
     * @ignore
     */
    this.cases = [...this.cases, ...matches];
    return this;
  }

  /**
   * @ignore
   */
  setParent(parent) {
    /**
     * @private
     * @ignore
     */
    this.parent = parent;
    return this;
  }

  /**
   * @ignore
   */
  parentBroken() {
    if (this.parent instanceof AsyncSwitch) {
      return this.parent.breakSuccess || this.parent.parentBroken();
    }
    return false;
  }

  /**
   * @ignore
   */
  notBroken() {
    if (this.breakSuccess || this.parentBroken()) {
      return false;
    }
    if (this.broken) {
      /**
       * @private
       * @ignore
       */
      this.breakSuccess = true;
    }
    return true;
  }

  /**
   * Initiate a selection mechanism given the previous
   * cases.
   * @param {Function} scope
   * @returns {AsyncSwitch}
   */
  do(scope) {
    const { subject } = this;
    const if1 = typeof subject === 'function';
    const if2 = typeof scope === 'function';
    return new AsyncSwitch(
      all(this.cases).then(
        v => resolve(if1 ? subject() : subject).then(
          x => (v.includes(x) ? resolve(if2 ? this.notBroken() && resolve(scope()).then(
            () => x,
          ) : scope) : x),
        ),
      ),
    ).setParent(this);
  }

  /**
   * Create a break signal that tells the next cases to
   * not execute if the previous case is successful.
   *
   * @returns {AsyncSwitch}
   */
  break() {
    if (this.parent instanceof AsyncSwitch) {
      this.parent.broken = true;
    }
    return this;
  }

  /**
   * Attaches a callback that is executed with or without
   * any cases
   * @param {Function} scope
   * @returns {Promise}
   */
  default(scope) {
    const { subject } = this;
    const if1 = typeof subject === 'function';
    const if2 = typeof scope === 'function';
    return resolve(if1 ? subject() : subject).then(
      () => (if2 ? !this.parentBroken() && scope() : scope),
    );
  }
}

/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */

/**
 * @ignore
 */
const While = (evaluator, scope, isFunction) => resolve(isFunction ? evaluator() : evaluator).then(
  x => (x ? resolve(scope()).then(
    () => While(evaluator, scope, isFunction),
  ) : false),
);

/**
 * A repetitive control structure that both evaluates the condition
 * and executes it scope asynchrously.
 * @example
 * new AsyncWhile(sleep(5000, true)).do(() => console.log("5000ms passed"));
 *
 */
class AsyncWhile {
  /**
   * Creates an AsyncWhile instance
   * @param {Function|Promise|any} evaluator a Promise or a function that is evaluated every cycle.
   */
  constructor(evaluator) {
    /**
     * a Promise or a function that is evaluated every cycle.
     * @type {Function|Promise|any}
     */
    this.evaluator = evaluator;
  }

  /**
   * Attaches a callback to the AsyncWhile that is executed while the evaluator resolves to true.
   * @param {Function} scope
   * @example
   * new AsyncWhile(() => x < 3).do(() => x++);
   * @returns {Promise}
   */
  do(scope) {
    return While(this.evaluator, scope, typeof this.evaluator === 'function');
  }
}

/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */

/**
 * @ignore
 */
const Repeat = (evaluator, scope, isFunction) => resolve(scope()).then(
  () => resolve(isFunction ? evaluator() : evaluator).then(
    x => (x ? false : Repeat(evaluator, scope, isFunction)),
  ),
);

/**
 * A repetitive control structure that executes first then checks
 * the evaluator. If the evaluator is false, the cycle repeats.
 */
class AsyncRepeat {
  /**
   * Creates an AsyncRepeat instance with a given function
   * that serves as the scope.
   * @param {Function} scope
   */
  constructor(scope) {
    /**
     * a function that serves as the scope for the AsyncRepeat.
     * Executes every cycle.
     * @type {Function}
     */
    this.scope = scope;
  }

  /**
   * initiate the repeating cycle with the given evaluator
   * @example
   * new AsyncRepeat(() => x++).until(() => x === 3);
   * @param {Function|Promise|any} evaluator
   * @returns {Promise}
   */
  until(evaluator) {
    return Repeat(evaluator, this.scope, typeof evaluator === 'function');
  }
}

/**
 * @ignore
 */
const defer = (item, scope) => resolve(item).then(x => resolve(scope(x)));

/**
 * Applies asynchronous iteration for iterables
 */
class AsyncForEach {
  /**
   * Creates an AsyncForEach instance
   * with the given iterable
   * @param {Iterable} iterable
   */
  constructor(iterable) {
    /**
     * @ignore
     */
    this.iterable = iterable;
  }

  /**
   * Initiate iteration of items from the iterable
   * @param {Function} scope
   * @returns {Promise}
   */
  do(scope) {
    let prev;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of this.iterable) {
      if (typeof prev === 'undefined') {
        prev = defer(item, scope);
      } else {
        prev = prev.then(() => defer(item, scope));
      }
    }
    return resolve(prev);
  }
}

/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */
/**
 * Asynchronously apply an logical negation
 * @param {?Promise} x
 * @return {Promise}
 */
const Not = x => resolve(x).then(y => !y);

/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */
/**
 * Asynchronously apply a logical conjunction.
 * @param {?Promise} a
 * @param {?Promise} b
 * @return {Promise}
 */
const And = (a, b) => all([a, b]).then(v => v[0] && v[1]);

/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */
/**
 * Asynchronously apply a logical disjunction.
 * @param {?Promise} a
 * @param {?Promise} b
 * @return {Promise}
 */
const Or = (a, b) => all([a, b]).then(v => v[0] || v[1]);

/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */
/**
 * Asynchronously apply an equality comparison.
 * @param {?Promise} a
 * @param {?Promise} b
 * @return {Promise}
 */
const EQ = (a, b) => all([a, b]).then(v => v[0] === v[1]);

/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */
/**
 * Asynchronously apply an inequality comparison.
 * @param {?Promise} a
 * @param {?Promise} b
 * @return {Promise}
 */
const NE = (a, b) => all([a, b]).then(v => v[0] !== v[1]);

/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */
/**
 * Asynchronously apply an greater-than comparison.
 * @param {?Promise} a
 * @param {?Promise} b
 * @return {Promise}
 */
const GT = (a, b) => all([a, b]).then(v => v[0] > v[1]);

/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */
/**
 * Asynchronously apply an greater-than-or-equal comparison.
 * @param {?Promise} a
 * @param {?Promise} b
 * @return {Promise}
 */
const GE = (a, b) => all([a, b]).then(v => v[0] >= v[1]);

/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */
/**
 * Asynchronously apply an less-than-or-equal comparison.
 * @param {?Promise} a
 * @param {?Promise} b
 * @return {Promise}
 */
const LE = (a, b) => all([a, b]).then(v => v[0] <= v[1]);

/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */
/**
 * Asynchronously apply an less-than comparison.
 * @param {?Promise} a
 * @param {?Promise} b
 * @return {Promise}
 */
const LT = (a, b) => all([a, b]).then(v => v[0] < v[1]);

/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */

exports.if = AsyncIf;
exports.switch = AsyncSwitch;
exports.while = AsyncWhile;
exports.repeat = AsyncRepeat;
exports.forEach = AsyncForEach;
exports.not = Not;
exports.and = And;
exports.or = Or;
exports.eq = EQ;
exports.ne = NE;
exports.gt = GT;
exports.ge = GE;
exports.le = LE;
exports.lt = LT;
