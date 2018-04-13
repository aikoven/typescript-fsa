import actionCreatorFactory, {isType, AnyAction} from "typescript-fsa";


declare const action: AnyAction;

const actionCreator = actionCreatorFactory();


function testPayload() {
  const withPayload = actionCreator<{foo: string}>('WITH_PAYLOAD');
  const withoutPayload = actionCreator('WITHOUT_PAYLOAD');

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
  const asyncNoParams = actionCreator.async<undefined,
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
                                            undefined,
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
  const async = actionCreator.async<undefined,
                                    undefined,
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
