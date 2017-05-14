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

function testEmptyAsyncPayload() {
  const emptyAsync = actionCreator.async<undefined,
                                         {foo: string},
                                         {bar: string}>('EMPTY_ASYNC');

  const started = emptyAsync.started();
  // typings:expect-error
  const started1 = emptyAsync.started({});

  const done = emptyAsync.done({result: {foo: 'foo'}});
  // typings:expect-error
  const done1 = emptyAsync.done({result: {foo: 1}});

  const failed = emptyAsync.failed({error: {bar: 'bar'}});
  // typings:expect-error
  const failed1 = emptyAsync.failed({error: {bar: 1}});
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
