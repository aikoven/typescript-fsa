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
export declare function isType<P>(action: AnyAction, actionCreator: ActionCreator<P>): action is Action<P>;
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
export interface ActionCreatorFactory {
    (type: string, commonMeta?: Object | null, error?: boolean): EmptyActionCreator;
    <P>(type: string, commonMeta?: Object | null, isError?: boolean): ActionCreator<P>;
    <P>(type: string, commonMeta?: Object | null, isError?: (payload: P) => boolean): ActionCreator<P>;
    async<P, S>(type: string, commonMeta?: Object | null): AsyncActionCreators<P, S, any>;
    async<P, S, E>(type: string, commonMeta?: Object | null): AsyncActionCreators<P, S, E>;
}
export default function actionCreatorFactory(prefix?: string | null, defaultIsError?: (payload: any) => boolean): ActionCreatorFactory;
