import {Action as ReduxAction} from "redux";


export interface Action<P> extends ReduxAction {
  type: string;
  payload: P;
  error?: boolean;
  meta?: Object;
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
  action: ReduxAction,
  actionCreator: ActionCreator<P>
): action is Action<P> {
  return action.type === actionCreator.type;
}

export interface ActionCreator<P> {
  type: string;
  (payload: P, meta?: Object): Action<P>;
}

export interface EmptyActionCreator extends ActionCreator<undefined> {
  (payload?: undefined, meta?: Object): Action<undefined>;
}

export interface AsyncActionCreators<P, S, E> {
  type: string;
  started: ActionCreator<P>;
  done: ActionCreator<Success<P, S>>;
  failed: ActionCreator<Failure<P, E>>;
}

export interface ActionCreatorFactory {
  (type: string, commonMeta?: Object, error?: boolean): EmptyActionCreator;
  <P>(type: string,
      commonMeta?: Object,
      isError?: ((payload: P) => boolean) | boolean
    ): ActionCreator<P>;

  async<P, S>(type: string,
              commonMeta?: Object): AsyncActionCreators<P, S, any>;
  async<P, S, E>(type: string,
                 commonMeta?: Object): AsyncActionCreators<P, S, E>;
}

declare var process: { env: { NODE_ENV: string } | undefined};
const isDev = (process && process.env && process.env.NODE_ENV) !== 'production';

function wrapIsError(
  default_: ((payload: any) => boolean),
  isError?: ((payload: any) => boolean) | boolean): (payload: any) => boolean {
  if (isError === undefined) {
    return default_;
  }
  if (typeof isError === "boolean") {
    return () => isError;
  }
  return isError;
}

export default function actionCreatorFactory(
  prefix?: string,
  defaultIsError: (payload: any) => boolean = p => p instanceof Error
  ): ActionCreatorFactory {
  const actionTypes = {};
  const base = prefix ? `${prefix}/` : "";

  function baseActionCreator<P>(
    isError: (payload: P) => boolean,
    type: string, commonMeta?: Object
    ): ActionCreator<P> {
                      
    const fullType = `${base}${type}`;

    if (isDev) {
      if (actionTypes[fullType])
        throw new Error(`Duplicate action type: ${fullType}`);

      actionTypes[fullType] = true;
    }

    return Object.assign(
      (payload: P, meta?: Object) => {
        const action: Action<P> = {
          type: fullType,
          payload,
          meta: Object.assign({}, commonMeta, meta),
        };

        if (isError(payload)) {
          action.error = true;
        }

        return action;
      },
      {type: fullType}
    );
  }

  const actionCreator = <P>(
    type: string,
    commonMeta?: Object,
    isError?: ((payload: P) => boolean) | boolean) => {

    return baseActionCreator<P>(
      wrapIsError(defaultIsError, isError),
      type,
      commonMeta,
      );
  };

  function asyncActionCreators<P, S, E>(
    type: string, commonMeta?: Object
  ): AsyncActionCreators<P, S, E> {
    return {
      type: prefix ? `${prefix}/${type}` : type,
      started: actionCreator<P>(`${type}_STARTED`, commonMeta, false),
      done: actionCreator<Success<P, S>>(`${type}_DONE`, commonMeta, false),
      failed: actionCreator<Failure<P, E>>(`${type}_FAILED`, commonMeta, true),
    };
  }

  return Object.assign(actionCreator, {async: asyncActionCreators});
}
