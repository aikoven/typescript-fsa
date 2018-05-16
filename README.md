# TypeScript FSA [![npm version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

Action Creator library for TypeScript. Its goal is to provide type-safe experience with Flux actions with minimum boilerplate.
Created actions are FSA-compliant:

```ts
interface Action<Payload> {
  type: string;
  payload: Payload;
  error?: boolean;
  meta?: Object;
}
```

## Installation

```
npm install --save typescript-fsa
```

## Usage

### Basic

```ts
import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory();

// Specify payload shape as generic type argument.
const somethingHappened = actionCreator<{foo: string}>('SOMETHING_HAPPENED');

// Get action creator type.
console.log(somethingHappened.type);  // SOMETHING_HAPPENED

// Create action.
const action = somethingHappened({foo: 'bar'});
console.log(action);  // {type: 'SOMETHING_HAPPENED', payload: {foo: 'bar'}}
```

### Async Action Creators

Async Action Creators are objects with properties `started`, `done` and
`failed` whose values are action creators. There is a number of [Companion Packages](#companion-packages) that help with binding Async Action Creators to async processes.

```ts
import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory();

// specify parameters and result shapes as generic type arguments
const doSomething =
  actionCreator.async<{foo: string},   // parameter type
                      {bar: number},   // success type
                      {code: number}   // error type
                     >('DO_SOMETHING');

console.log(doSomething.started({foo: 'lol'}));
// {type: 'DO_SOMETHING_STARTED', payload: {foo: 'lol'}}

console.log(doSomething.done({
  params: {foo: 'lol'},
  result: {bar: 42},
}));
// {type: 'DO_SOMETHING_DONE', payload: {
//   params: {foo: 'lol'},
//   result: {bar: 42},
// }}

console.log(doSomething.failed({
  params: {foo: 'lol'},
  error: {code: 42},
}));
// {type: 'DO_SOMETHING_FAILED', payload: {
//   params: {foo: 'lol'},
//   error: {code: 42},
// }, error: true}
```

### Actions With Type Prefix

You can specify a prefix that will be prepended to all action types. This is
useful to namespace library actions as well as for large projects where it's
convenient to keep actions near the component that dispatches them.

```ts
// MyComponent.actions.ts
import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('MyComponent');

const somethingHappened = actionCreator<{foo: string}>('SOMETHING_HAPPENED');

const action = somethingHappened({foo: 'bar'});
console.log(action);
// {type: 'MyComponent/SOMETHING_HAPPENED', payload: {foo: 'bar'}}
```

### Redux

```ts
// actions.ts
import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory();

export const somethingHappened =
  actionCreator<{foo: string}>('SOMETHING_HAPPENED');
export const somethingAsync =
  actionCreator.async<{foo: string},
                      {bar: string}
                     >('SOMETHING_ASYNC');


// reducer.ts
import {Action} from 'redux';
import {isType} from 'typescript-fsa';
import {somethingHappened, somethingAsync} from './actions';

type State = {bar: string};

export const reducer = (state: State, action: Action): State => {
  if (isType(action, somethingHappened)) {
    // action.payload is inferred as {foo: string};

    action.payload.bar;  // error

    return {bar: action.payload.foo};
  }

  if (isType(action, somethingAsync.started)) {
    return {bar: action.payload.foo};
  }

  if (isType(action, somethingAsync.done)) {
    return {bar: action.payload.result.bar};
  }

  return state;
};
```

#### redux-observable

```ts
// epic.ts
import {Action} from 'redux';
import {Observable} from 'rxjs';
import {somethingAsync} from './actions';

export const epic = (actions$: Observable<Action>) =>
  actions$.filter(somethingAsync.started.match)
    .delay(2000)
    .map(action => {
      // action.payload is inferred as {foo: string};

      action.payload.bar;  // error

      return somethingAsync.done({
        params: action.payload,
        result: {
          bar: 'bar',
        },
      });
    });
```

## Companion Packages

* [typescript-fsa-redux-saga](https://github.com/aikoven/typescript-fsa-redux-saga)
* [typescript-fsa-redux-observable](https://github.com/m0a/typescript-fsa-redux-observable)
* [typescript-fsa-redux-thunk](https://github.com/xdave/typescript-fsa-redux-thunk)
* [typescript-fsa-reducers](https://github.com/dphilipson/typescript-fsa-reducers)

## Resources

* [Type-safe Flux Standard Actions (FSA) in React Using TypeScript FSA](https://www.triplet.fi/blog/type-safe-flux-standard-actions-fsa-in-react-using-typescript-fsa/)
* [Type-safe Asynchronous Actions (Redux Thunk) Using TypeScript FSA](https://www.triplet.fi/blog/type-safe-asynchronous-actions-redux-thunk-using-typescript-fsa/)

## API

### `actionCreatorFactory(prefix?: string, defaultIsError?: Predicate): ActionCreatorFactory`

Creates Action Creator factory with optional prefix for action types.

* `prefix?: string`: Prefix to be prepended to action types as `<prefix>/<type>`.
* `defaultIsError?: Predicate`: Function that detects whether action is error
 given the payload. Default is `payload => payload instanceof Error`.

### `ActionCreatorFactory<Payload>#(type: string, commonMeta?: object, isError?: boolean): ActionCreator<Payload>`

Creates Action Creator that produces actions with given `type` and payload of type `Payload`.

* `type: string`: Type of created actions.
* `commonMeta?: object`: Metadata added to created actions.
* `isError?: boolean`: Defines whether created actions are error actions.

### `ActionCreatorFactory#async<Params, Result, Error>(type: string, commonMeta?: object): AsyncActionCreators<Params, Result, Error>`

Creates three Action Creators:
* `started: ActionCreator<Params>`
* `done: ActionCreator<{params: Params, result: Result}>`
* `failed: ActionCreator<{params: Params, error: Error}>`

Useful to wrap asynchronous processes.

* `type: string`: Prefix for types of created actions, which will have types `${type}_STARTED`, `${type}_DONE` and `${type}_FAILED`.
* `commonMeta?: object`: Metadata added to created actions.

### `ActionCreator<Payload>#(payload: Payload, meta?: object): Action<Payload>`

Creates action with given payload and metadata.

* `payload: Payload`: Action payload.
* `meta?: object`: Action metadata. Merged with `commonMeta` of Action Creator.

### `isType(action: Action, actionCreator: ActionCreator): boolean`

Returns `true` if action has the same type as action creator. Defines
[Type Guard](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards)
that lets TypeScript know `payload` type inside blocks where `isType` returned
`true`:

```ts
const somethingHappened = actionCreator<{foo: string}>('SOMETHING_HAPPENED');

if (isType(action, somethingHappened)) {
  // action.payload has type {foo: string}
}
```

### `ActionCreator#match(action: Action): boolean`

Identical to `isType` except it is exposed as a bound method of an action
creator. Since it is bound and takes a single argument it is ideal for passing
to a filtering function like `Array.prototype.filter` or
[RxJS](http://reactivex.io/rxjs/)'s `Observable.prototype.filter`.

```ts
const somethingHappened = actionCreator<{foo: string}>('SOMETHING_HAPPENED');
const somethingElseHappened =
  actionCreator<{bar: number}>('SOMETHING_ELSE_HAPPENED');

if (somethingHappened.match(action)) {
  // action.payload has type {foo: string}
}

const actionArray = [
  somethingHappened({foo: 'foo'}),
  somethingElseHappened({bar: 5}),
];

// somethingHappenedArray has inferred type Action<{foo: string}>[]
const somethingHappenedArray = actionArray.filter(somethingHappened.match);
```

For more on using `Array.prototype.filter` as a type guard, see
[this github issue](https://github.com/Microsoft/TypeScript/issues/7657).


[npm-image]: https://badge.fury.io/js/typescript-fsa.svg
[npm-url]: https://badge.fury.io/js/typescript-fsa
[travis-image]: https://travis-ci.org/aikoven/typescript-fsa.svg?branch=master
[travis-url]: https://travis-ci.org/aikoven/typescript-fsa
