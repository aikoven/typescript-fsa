export interface AnyAction {
    type: any;
}
export declare type Meta = null | {
    [key: string]: any;
};
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
export declare function isType<P>(action: AnyAction, actionCreator: ActionCreator<P>): action is Action<P>;
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
    (type: string, commonMeta?: Meta, error?: boolean): EmptyActionCreator;
    <P>(type: string, commonMeta?: Meta, isError?: boolean): ActionCreator<P>;
    <P>(type: string, commonMeta?: Meta, isError?: (payload: P) => boolean): ActionCreator<P>;
    async<P, S>(type: string, commonMeta?: Meta): AsyncActionCreators<P, S, any>;
    async<P, S, E>(type: string, commonMeta?: Meta): AsyncActionCreators<P, S, E>;
}
export declare function actionCreatorFactory(prefix?: string | null, defaultIsError?: (payload: any) => boolean): ActionCreatorFactory;
export default actionCreatorFactory;
