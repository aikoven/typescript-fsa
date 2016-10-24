import { Action as ReduxAction } from "redux";
export interface Action<P> extends ReduxAction {
    type: string;
    payload: P;
    error?: boolean;
    meta?: Object;
}
export declare function isType<P>(action: ReduxAction, actionCreator: ActionCreator<P>): action is Action<P>;
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
export default function actionCreatorFactory(prefix?: string): ActionCreatorFactory;
