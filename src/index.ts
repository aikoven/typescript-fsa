export interface AnyAction {
  type: any;
}

export type Meta = null | {[key: string]: any};

export interface Action<P> extends AnyAction {
  type: string;
  payload: P;
  error?: boolean;
  meta?: Meta;
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
  match: (action: AnyAction) => action is Action<P>;
  (payload: P, meta?: Meta): Action<P>;
}

export interface EmptyActionCreator extends ActionCreator<undefined> {
  (payload?: undefined, meta?: Meta): Action<undefined>;
}

export interface AsyncActionCreators<P, S, E> {
  type: string;
  started: ActionCreator<P>;
  done: ActionCreator<Success<P, S>>;
  failed: ActionCreator<Failure<P, E>>;
}

export interface ActionCreatorFactory {
  (type: string, commonMeta?: Meta,
   error?: boolean): EmptyActionCreator;
  <P>(type: string, commonMeta?: Meta,
      isError?: boolean): ActionCreator<P>;
  <P>(type: string, commonMeta?: Meta,
      isError?: (payload: P) => boolean): ActionCreator<P>;

  async<P, S>(
    type: string, commonMeta?: Meta,
  ): AsyncActionCreators<P, S, any>;
  async<P, S, E>(
    type: string, commonMeta?: Meta,
  ): AsyncActionCreators<P, S, E>;
}

declare const process: {
  env: {
    NODE_ENV?: string;
  };
};


export function actionCreatorFactory(
  prefix?: string | null,
  defaultIsError: (payload: any) => boolean = p => p instanceof Error,
): ActionCreatorFactory {
  const actionTypes: {[type: string]: boolean} = {};

  const base = prefix ? `${prefix}/` : "";

  function actionCreator<P>(
    type: string, commonMeta?: Meta,
    isError: ((payload: P) => boolean) | boolean = defaultIsError,
  ): ActionCreator<P> {
    const fullType = base + type;

    if (process.env.NODE_ENV !== 'production') {
      if (actionTypes[fullType])
        throw new Error(`Duplicate action type: ${fullType}`);

      actionTypes[fullType] = true;
    }

    return Object.assign(
      (payload: P, meta?: Meta) => {
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
      {
        type: fullType,
        toString: () => fullType,
        match: (action: AnyAction): action is Action<P> =>
          action.type === fullType,
      },
    );
  }

  function asyncActionCreators<P, S, E>(
    type: string, commonMeta?: Meta,
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

export default actionCreatorFactory;
