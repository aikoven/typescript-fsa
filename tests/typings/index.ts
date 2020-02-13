import actionCreatorFactory, {isType, AnyAction, AsyncActionCreators, Success, Failure} from "typescript-fsa";


declare const action: AnyAction;

const actionCreator = actionCreatorFactory();


function testPayload() {
  const withPayload = actionCreator<{foo: string}>('WITH_PAYLOAD');
  const withoutPayload = actionCreator('WITHOUT_PAYLOAD');
  const withOrWithoutPayload = actionCreator<string | void>('WITH_ORWITHOUT_PAYLOAD')

  // typings:expect-error
  const a = withPayload();
  // typings:expect-error
  const b = withPayload({bar: 1});
  const c = withPayload({foo: 'bar'});
  const d = withPayload({foo: 'bar'}, {meta: 'meta'});

  const e = withoutPayload();
  const f = withoutPayload(undefined, {meta: 'meta'});
  // typings:expect-error
  const g = withoutPayload({foo: 'bar'});

  const h = withOrWithoutPayload('string');
  const i = withOrWithoutPayload();
  // typings:expect-error
  const j = withOrWithoutPayload(111);
}

function testAsyncPayload() {
  const async = actionCreator.async<{foo: string},
                                    {bar: string},
                                    {baz: string}>('ASYNC');

  const started = async.started({foo: 'foo'});
  // typings:expect-error
  const started1 = async.started({});
  // typings:expect-error
  const started2 = async.started();

  const done = async.done({
    params: {foo: 'foo'},
    result: {bar: 'bar'},
  });
  // typings:expect-error
  const done1 = async.done({
    params: {foo: 1},
    result: {bar: 'bar'},
  });
  // typings:expect-error
  const done2 = async.done({
    params: {foo: 'foo'},
    result: {bar: 1},
  });

  const failed = async.failed({
    params: {foo: 'foo'},
    error: {baz: 'baz'},
  });
  // typings:expect-error
  const failed1 = async.failed({
    params: {foo: 1},
    error: {baz: 'baz'},
  });
  // typings:expect-error
  const failed2 = async.failed({
    params: {foo: 'foo'},
    error: {baz: 1},
  });
}

function testAsyncNoParams() {
  const asyncNoParams = actionCreator.async<void,
                                            {bar: string},
                                            {baz: string}>('ASYNC_NO_PARAMS');

  const started = asyncNoParams.started();
  // typings:expect-error
  const started1 = asyncNoParams.started({foo: 'foo'});

  const done = asyncNoParams.done({
    result: {bar: 'bar'},
  });
  // typings:expect-error
  const done1 = asyncNoParams.done({
    params: {foo: 'foo'},
    result: {bar: 'bar'},
  });
  // typings:expect-error
  const done2 = asyncNoParams.done({
    result: {bar: 1},
  });

  const failed = asyncNoParams.failed({
    error: {baz: 'baz'},
  });
  // typings:expect-error
  const failed1 = asyncNoParams.failed({
    params: {foo: 'foo'},
    error: {baz: 'baz'},
  });
  // typings:expect-error
  const failed2 = asyncNoParams.failed({
    error: {baz: 1},
  });
}

function testAsyncNoResult() {
  const asyncNoResult = actionCreator.async<{foo: string},
                                            void,
                                            {baz: string}>('ASYNC_NO_RESULT');

  const started = asyncNoResult.started({foo: 'foo'});
  // typings:expect-error
  const started1 = asyncNoResult.started({});
  // typings:expect-error
  const started2 = asyncNoResult.started();

  const done = asyncNoResult.done({
    params: {foo: 'foo'},
  });
  // typings:expect-error
  const done1 = asyncNoResult.done({
    params: {foo: 1},
  });
  // typings:expect-error
  const done2 = asyncNoResult.done({
    params: {foo: 'foo'},
    result: {bar: 'bar'},
  });

  const failed = asyncNoResult.failed({
    params: {foo: 'foo'},
    error: {baz: 'baz'},
  });
  // typings:expect-error
  const failed1 = asyncNoResult.failed({
    params: {foo: 1},
    error: {baz: 'baz'},
  });
  // typings:expect-error
  const failed2 = asyncNoResult.failed({
    params: {foo: 'foo'},
    error: {baz: 1},
  });
}

function testAsyncNoParamsAndResult() {
  const async = actionCreator.async<void,
                                    void,
                                    {baz: string}>('ASYNC');

  const started = async.started();
  // typings:expect-error
  const started2 = async.started({foo: 'foo'});

  const done = async.done({});
  // typings:expect-error
  const done1 = async.done({
    params: {foo: 'foo'},
  });
  // typings:expect-error
  const done2 = async.done({
    result: {bar: 'bar'},
  });

  const failed = async.failed({
    error: {baz: 'baz'},
  });
  // typings:expect-error
  const failed1 = async.failed({
    params: {foo: 'foo'},
    error: {baz: 'baz'},
  });
}

function testAsyncGeneric<P, R>(params: P, result: R) {
  const async = actionCreator.async<P, R, any>('ASYNC');

  const started = async.started(params);

  // typings:expect-error
  const started1 = async.started({});
  // typings:expect-error
  const started2 = async.started();

  if(params !== undefined && result !== undefined) {
    const done = async.done({
      params,
      result,
    } as Success<P, R>);
  }

  // typings:expect-error
  const done1 = async.done({
    params: {foo: 1},
    result: params[1],
  });
  // typings:expect-error
  const done2 = async.done({
    params: params[0],
    result: {bar: 1},
  });

  if(params !== undefined) {
    const failed = async.failed({
      params,
      error: {baz: 'baz'},
    } as Failure<P, any>);
  }

  // typings:expect-error
  const failed1 = async.failed({
    params: {foo: 1},
    error: {baz: 'baz'},
  });
}

var voidValue = (function () { })();

function testAsyncGenericStrictError<P, R, E>(params: P, result: R, error: E) {
  const async = actionCreator.async<P, R, E>('ASYNC');

  if(params === undefined) {
    const started = (async as AsyncActionCreators<unknown, R, E> as AsyncActionCreators<void, R, E>).started();
  }

  // typings:expect-error
  const started1 = async.started({});
  // typings:expect-error
  const started2 = async.started();

  const done = async.done({
    params,
    result,
  } as Success<P, R>);

  // typings:expect-error
  const done1 = async.done({
    params: {foo: 1},
    result,
  });
  // typings:expect-error
  const done2 = async.done({
    params,
    result: {bar: 1},
  });

  const failed = async.failed({
    params,
    error,
  } as Failure<P, E>);

  // typings:expect-error
  const failed1 = async.failed({
    params: {foo: 1},
    error,
  });
  // typings:expect-error
  const failed2 = async.failed({
    params,
    error: {baz: 1},
  });
}

function testIsType() {
  const withPayload = actionCreator<{foo: string}>('WITH_PAYLOAD');
  const withoutPayload = actionCreator('WITHOUT_PAYLOAD');

  if (isType(action, withPayload)) {
    const foo: string = action.payload.foo;

    // typings:expect-error
    action.payload.bar;
  }

  if (isType(action, withoutPayload)) {
    // typings:expect-error
    const foo: {} = action.payload;
  }
}

function testMatch() {
  const withPayload = actionCreator<{foo: string}>('WITH_PAYLOAD');
  const withoutPayload = actionCreator('WITHOUT_PAYLOAD');

  if (withPayload.match(action)) {
    const foo: string = action.payload.foo;

    // typings:expect-error
    action.payload.bar;
  }

  if (withoutPayload.match(action)) {
    // typings:expect-error
    const foo: {} = action.payload;
  }
}

function testMeta() {
  const a = actionCreator<{foo: string}>('');

  a({foo: 'foo'});
  a({foo: 'foo'}, null);
  // typings:expect-error
  a({foo: 'foo'}, 1);
  // typings:expect-error
  a({foo: 'foo'}, 'foo');
  // typings:expect-error
  a({foo: 'foo'}, true);

  const action = a({foo: 'foo'}, {bar: 'baz'});

  // typings:expect-error
  action.meta.foo;
  action.meta!.foo;
}
