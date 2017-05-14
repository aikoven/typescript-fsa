export interface AnyAction {
  type: any;
}

export interface Action<P> extends AnyAction {
  type: string;
  payload: P;
  error?: boolean;
  meta?: Object | null;
}

export interface Success<P, S> {
  params: P;
  result: S;
}

export interface Failure<P, E> {
  params: P;
  error: E;
}

export function isType<P>(
  action: AnyAction,
  actionCreator: ActionCreator<P>,
): action is Action<P> {
  return action.type === actionCreator.type;
}

export interface ActionCreator<P> {
  type: string;
  (payload: P, meta?: Object | null): Action<P>;
}

export interface EmptyActionCreator extends ActionCreator<undefined> {
  (payload?: undefined, meta?: Object | null): Action<undefined>;
}

export interface AsyncActionCreators<P, S, E> {
  type: string;
  started: ActionCreator<P>;
  done: ActionCreator<Success<P, S>>;
  failed: ActionCreator<Failure<P, E>>;
}

export interface EmptySuccess<S> {
  result: S;
}

export interface EmptyFailure<E> {
  error: E;
}

export interface EmptyAsyncActionCreators<S, E> {
  type: string;
  started: EmptyActionCreator;
  done: ActionCreator<EmptySuccess<S>>;
  failed: ActionCreator<EmptyFailure<E>>;
}

export interface ActionCreatorFactory {
  (type: string, commonMeta?: Object | null,
   error?: boolean): EmptyActionCreator;
  <P>(type: string, commonMeta?: Object | null,
      isError?: boolean): ActionCreator<P>;
  <P>(type: string, commonMeta?: Object | null,
      isError?: (payload: P) => boolean): ActionCreator<P>;

  async<P, S>(
    type: string, commonMeta?: Object | null,
  ): AsyncActionCreators<P, S, any>;
  async<undefined, S, E>(
    type: string, commonMeta?: Object | null,
  ): EmptyAsyncActionCreators<S, E>;
  async<P, S, E>(
    type: string, commonMeta?: Object | null,
  ): AsyncActionCreators<P, S, E>;
}

declare const process: {
  env: {
    NODE_ENV?: string;
  };
};


export default function actionCreatorFactory(
  prefix?: string | null,
  defaultIsError: (payload: any) => boolean = p => p instanceof Error,
): ActionCreatorFactory {
  const actionTypes: {[type: string]: boolean} = {};

  const base = prefix ? `${prefix}/` : "";

  function actionCreator <P>(
    type: string, commonMeta?: Object | null,
    isError: ((payload: P) => boolean) | boolean = defaultIsError,
  ): ActionCreator<P> {
    const fullType = base + type;

    if (process.env.NODE_ENV !== 'production') {
      if (actionTypes[fullType])
        throw new Error(`Duplicate action type: ${fullType}`);

      actionTypes[fullType] = true;
    }

    return Object.assign(
      (payload: P, meta?: Object | null) => {
        const action: Action<P> = {
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
      {type: fullType},
    );
  }

  function asyncActionCreators<P, S, E>(
    type: string, commonMeta?: Object | null,
  ): AsyncActionCreators<P, S, E> {
    return {
      type: base + type,
      started: actionCreator<P>(`${type}_STARTED`, commonMeta, false),
      done: actionCreator<Success<P, S>>(`${type}_DONE`, commonMeta, false),
      failed: actionCreator<Failure<P, E>>(`${type}_FAILED`, commonMeta, true),
    };
  }

  return Object.assign(actionCreator, {async: asyncActionCreators});
}
