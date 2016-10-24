import { Action as ReduxAction } from "redux";
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
export declare function isType<P>(action: ReduxAction, actionCreator: ActionCreator<P>): action is Action<P>;
export interface ActionCreator<P> {
    type: string;
    (payload: P, meta?: Object): Action<P>;
}
export interface AsyncActionCreators<P, S, E> {
    type: string;
    started: ActionCreator<P>;
    done: ActionCreator<Success<P, S>>;
    failed: ActionCreator<Failure<P, E>>;
}
export interface ActionCreatorFactory {
    <P>(type: string, commonMeta?: Object, error?: boolean): ActionCreator<P>;
    (type: string, commonMeta?: Object, error?: boolean): ActionCreator<undefined>;
    async<P, S, E>(type: string, commonMeta?: Object): AsyncActionCreators<P, S, E>;
    async<P, S>(type: string, commonMeta?: Object, error?: boolean): AsyncActionCreators<P, S, any>;
}
export default function actionCreatorFactory(prefix?: string): ActionCreatorFactory;
