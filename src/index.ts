import {Action as ReduxAction} from "redux";


export interface Action<P> extends ReduxAction {
  type: string;
  payload: P;
  error?: boolean;
  meta?: Object;
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

export interface AsyncActionCreators<P, R> {
  type: string;
  started: ActionCreator<P>;
  done: ActionCreator<{
    params: P;
    result: R;
  }>;
  failed: ActionCreator<{
    params: P;
    error: any;
  }>;
}

export interface ActionCreatorFactory {
  <P>(type: string, commonMeta?: Object, error?: boolean): ActionCreator<P>;
  (type: string, commonMeta?: Object, error?: boolean): ActionCreator<undefined>;

  async<P, S>(type: string, commonMeta?: Object): AsyncActionCreators<P, S>;
}


export default function actionCreatorFactory(prefix?: string):
ActionCreatorFactory {
  const actionTypes = {};

  function actionCreator<P>(type: string, commonMeta?: Object,
                            error?: boolean): ActionCreator<P> {
    if (actionTypes[type])
      throw new Error(`Duplicate action type: ${type}`);

    actionTypes[type] = true;

    const fullType = prefix ? `${prefix}/${type}` : type;

    return Object.assign(
      (payload: P, meta?: Object) => {
        const action: Action<P> = {
          type: fullType,
          payload,
          meta: Object.assign({}, commonMeta, meta),
        };

        if (error)
          action.error = error;

        return action;
      },
      {type: fullType}
    );
  }

  function asyncActionCreators<P, S>(
    type: string, commonMeta?: Object
  ): AsyncActionCreators<P, S> {
    return {
      type: prefix ? `${prefix}/${type}` : type,
      started: actionCreator<P>(`${type}_STARTED`, commonMeta),
      done: actionCreator<{
        params: P;
        result: S;
      }>(`${type}_DONE`, commonMeta),
      failed: actionCreator<{
        params: P;
        error: any;
      }>(`${type}_FAILED`, commonMeta, true),
    };
  }

  return Object.assign(actionCreator, {async: asyncActionCreators});
}

