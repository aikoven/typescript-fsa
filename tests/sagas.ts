import test = require('tape');
import {Test} from "tape";
import {Action, createStore, applyMiddleware} from "redux";
import sagaMiddlewareFactory from "redux-saga";
import {call, race, take} from "redux-saga/effects";
import {deferred} from "redux-saga/utils";

import actionCreatorFactory, {isType} from "../src/index";
import {bindAsyncAction} from "../src/sagas";

type Params = {foo: string};
type Result = {args: any[]};
type State = {
  started?: Params;
  done?: {
    params: Params;
    result: Result;
  };
  failed?: {
    params: Params;
    error: any;
  };
};

function createAll() {
  const actionCreator = actionCreatorFactory();

  const asyncActions = actionCreator.async<Params, Result>('ASYNC');

  const dfd = deferred();

  const asyncWorker = bindAsyncAction(asyncActions)(
    (params, ...args) => dfd.promise.then(() => ({args})),
  );

  const reducer = (state: State = {}, action: Action): State => {
    if (isType(action, asyncActions.started))
      return {
        ...state,
        started: action.payload,
      };

    if (isType(action, asyncActions.done))
      return {
        ...state,
        done: action.payload,
      };

    if (isType(action, asyncActions.failed))
      return {
        ...state,
        failed: action.payload,
      };

    return state;
  };

  const sagaMiddleware = sagaMiddlewareFactory();

  const store = createStore(reducer, applyMiddleware(sagaMiddleware));

  const output: {
    result?: Result;
    cancelled?: boolean;
    error?: any;
  } = {};

  sagaMiddleware.run(function* rootSaga() {
    try {
      const {worker} = yield race({
        worker: call(asyncWorker, {foo: 'bar'}, 1, 2, 3),
        cancel: take('CANCEL'),
      });

      if (worker) {
        output.result = worker;
      } else {
        output.cancelled = true;
      }

    } catch (e) {
      output.error = e;
    }
  });

  return {store, dfd, output};
}

function async(fn: (assert: Test) => Promise<any>) {
  return (assert: Test) => {
    fn(assert).then(
      () => assert.end(),
      error => assert.fail(error),
    );
  };
}

function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

test('bindAsyncAction', ({test}: Test) => {
  test('resolve', async(async (assert) => {
    const {store, dfd, output} = createAll();

    await delay(50);

    assert.deepEqual(store.getState(), {
      started: {foo: 'bar'},
    });
    assert.deepEqual(output, {});

    dfd.resolve({});

    await delay(50);

    assert.deepEqual(store.getState(), {
      started: {foo: 'bar'},
      done: {
        params: {foo: 'bar'},
        result: {args: [1, 2, 3]},
      },
    });
    assert.deepEqual(output, {
      result: {args: [1, 2, 3]},
    });
  }));
});

test('bindAsyncAction', ({test}: Test) => {
  test('reject', async(async (assert) => {
    const {store, dfd, output} = createAll();

    await delay(50);

    assert.deepEqual(store.getState(), {
      started: {foo: 'bar'},
    });
    assert.deepEqual(output, {});

    dfd.reject({message: 'Error'});

    await delay(50);

    assert.deepEqual(store.getState(), {
      started: {foo: 'bar'},
      failed: {
        params: {foo: 'bar'},
        error: {message: 'Error'},
      },
    });
    assert.deepEqual(output, {
      error: {message: 'Error'},
    });
  }));
});

test('bindAsyncAction', ({test}: Test) => {
  test('cancel', async(async (assert) => {
    const {store, dfd, output} = createAll();

    await delay(50);

    assert.deepEqual(store.getState(), {
      started: {foo: 'bar'},
    });
    assert.deepEqual(output, {});

    store.dispatch({type: 'CANCEL'});

    await delay(50);

    assert.deepEqual(store.getState(), {
      started: {foo: 'bar'},
      failed: {
        params: {foo: 'bar'},
        error: 'cancelled',
      },
    });
    assert.deepEqual(output, {
      cancelled: true,
    });
  }));
});

