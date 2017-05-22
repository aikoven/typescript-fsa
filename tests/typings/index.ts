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
