export interface AnyAction {
  type: any;
}

export type Meta = null | {[key: string]: any};

export interface Action<Payload> extends AnyAction {
  type: string;
  payload: Payload;
  error?: boolean;
  meta?: Meta;
}

/**
 * Returns `true` if action has the same type as action creator.
 * Defines Type Guard that lets TypeScript know `payload` type inside blocks
 * where `isType` returned `true`.
 *
 * @example
 *
 *    const somethingHappened =
 *      actionCreator<{foo: string}>('SOMETHING_HAPPENED');
 *
 *    if (isType(action, somethingHappened)) {
 *      // action.payload has type {foo: string}
 *    }
 */
export function isType<Payload>(
  action: AnyAction,
  actionCreator: ActionCreator<Payload>,
): action is Action<Payload> {
  return action.type === actionCreator.type;
}

export interface ActionCreator<Payload> {
  type: string;
  /**
   * Identical to `isType` except it is exposed as a bound method of an action
   * creator. Since it is bound and takes a single argument it is ideal for
   * passing to a filtering function like `Array.prototype.filter` or
   * RxJS's `Observable.prototype.filter`.
   *
   * @example
   *
   *    const somethingHappened =
   *      actionCreator<{foo: string}>('SOMETHING_HAPPENED');
   *    const somethingElseHappened =
   *      actionCreator<{bar: number}>('SOMETHING_ELSE_HAPPENED');
   *
   *    if (somethingHappened.match(action)) {
   *      // action.payload has type {foo: string}
   *    }
   *
   *    const actionArray = [
   *      somethingHappened({foo: 'foo'}),
   *      somethingElseHappened({bar: 5}),
   *    ];
   *
   *    // somethingHappenedArray has inferred type Action<{foo: string}>[]
   *    const somethingHappenedArray =
   *      actionArray.filter(somethingHappened.match);
   */
  match: (action: AnyAction) => action is Action<Payload>;
  /**
   * Creates action with given payload and metadata.
   *
   * @param payload Action payload.
   * @param meta Action metadata. Merged with `commonMeta` of Action Creator.
   */
  (payload: Payload, meta?: Meta): Action<Payload>;
}

export type Success<Params, Result> = (
  | {params: Params}
  | (Params extends void ? {params?: Params} : never)) &
  ({result: Result} | (Result extends void ? {result?: Result} : never));

export type Failure<Params, Error> = (
  | {params: Params}
  | (Params extends void ? {params?: Params} : never)) & {error: Error};

export interface AsyncActionCreators<Params, Result, Error = {}> {
  type: string;
  started: ActionCreator<Params>;
  done: ActionCreator<Success<Params, Result>>;
  failed: ActionCreator<Failure<Params, Error>>;
}

export interface ActionCreatorFactory {
  /**
   * Creates Action Creator that produces actions with given `type` and payload
   * of type `Payload`.
   *
   * @param type Type of created actions.
   * @param commonMeta Metadata added to created actions.
   * @param isError Defines whether created actions are error actions.
   */
  <Payload = void>(
    type: string,
    commonMeta?: Meta,
    isError?: boolean,
  ): ActionCreator<Payload>;
  /**
   * Creates Action Creator that produces actions with given `type` and payload
   * of type `Payload`.
   *
   * @param type Type of created actions.
   * @param commonMeta Metadata added to created actions.
   * @param isError Function that detects whether action is error given the
   *   payload.
   */
  <Payload = void>(
    type: string,
    commonMeta?: Meta,
    isError?: (payload: Payload) => boolean,
  ): ActionCreator<Payload>;

  /**
   * Creates three Action Creators:
   * * `started: ActionCreator<Params>`
   * * `done: ActionCreator<{params: Params, result: Result}>`
   * * `failed: ActionCreator<{params: Params, error: Error}>`
   *
   * Useful to wrap asynchronous processes.
   *
   * @param type Prefix for types of created actions, which will have types
   *   `${type}_STARTED`, `${type}_DONE` and `${type}_FAILED`.
   * @param commonMeta Metadata added to created actions.
   */
  async<Params, Result, Error = {}>(
    type: string,
    commonMeta?: Meta,
  ): AsyncActionCreators<Params, Result, Error>;
}

declare const process: {
  env: {
    NODE_ENV?: string;
  };
};

/**
 * Creates Action Creator factory with optional prefix for action types.
 * @param prefix Prefix to be prepended to action types as `<prefix>/<type>`.
 * @param defaultIsError Function that detects whether action is error given the
 *   payload. Default is `payload => payload instanceof Error`.
 */
export function actionCreatorFactory(
  prefix?: string | null,
  defaultIsError: (payload: any) => boolean = p => p instanceof Error,
): ActionCreatorFactory {
  const actionTypes: {[type: string]: boolean} = {};

  const base = prefix ? `${prefix}/` : '';

  function actionCreator<Payload>(
    type: string,
    commonMeta?: Meta,
    isError: ((payload: Payload) => boolean) | boolean = defaultIsError,
  ) {
    const fullType = base + type;

    if (process.env.NODE_ENV !== 'production') {
      if (actionTypes[fullType])
        throw new Error(`Duplicate action type: ${fullType}`);

      actionTypes[fullType] = true;
    }

    return Object.assign(
      (payload: Payload, meta?: Meta) => {
        const action: Action<Payload> = {
          type: fullType,
          payload,
        };

        if (commonMeta || meta) {
          action.meta = Object.assign({}, commonMeta, meta);
        }

        if (isError && (typeof isError === 'boolean' || isError(payload))) {
          action.error = true;
        }

        return action;
      },
      {
        type: fullType,
        toString: () => fullType,
        match: (action: AnyAction): action is Action<Payload> =>
          action.type === fullType,
      },
    ) as ActionCreator<Payload>;
  }

  function asyncActionCreators<Params, Result, Error>(
    type: string,
    commonMeta?: Meta,
  ): AsyncActionCreators<Params, Result, Error> {
    return {
      type: base + type,
      started: actionCreator<Params>(`${type}_STARTED`, commonMeta, false),
      done: actionCreator<Success<Params, Result>>(
        `${type}_DONE`,
        commonMeta,
        false,
      ),
      failed: actionCreator<Failure<Params, Error>>(
        `${type}_FAILED`,
        commonMeta,
        true,
      ),
    };
  }

  return Object.assign(actionCreator, {async: asyncActionCreators});
}

export default actionCreatorFactory;
