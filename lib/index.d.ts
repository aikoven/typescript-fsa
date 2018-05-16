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
export declare type Success<P, R> = ({
    params: P;
} | (P extends void ? {
    params?: P;
} : never)) & ({
    result: R;
} | (R extends void ? {
    result?: R;
} : never));
export declare type Failure<P, E> = ({
    params: P;
} | (P extends void ? {
    params?: P;
} : never)) & {
    error: E;
};
export declare function isType<P>(action: AnyAction, actionCreator: ActionCreator<P>): action is Action<P>;
export declare type ActionCreator<P> = {
    type: string;
    match: (action: AnyAction) => action is Action<P>;
    (payload: P, meta?: Meta): Action<P>;
} & (P extends void ? {
    (payload?: P, meta?: Meta): Action<P>;
} : {});
export interface AsyncActionCreators<P, R, E> {
    type: string;
    started: ActionCreator<P>;
    done: ActionCreator<Success<P, R>>;
    failed: ActionCreator<Failure<P, E>>;
}
export interface ActionCreatorFactory {
    <P = void>(type: string, commonMeta?: Meta, isError?: boolean): ActionCreator<P>;
    <P = void>(type: string, commonMeta?: Meta, isError?: (payload: P) => boolean): ActionCreator<P>;
    async<P, R>(type: string, commonMeta?: Meta): AsyncActionCreators<P, R, {}>;
    async<P, R, E>(type: string, commonMeta?: Meta): AsyncActionCreators<P, R, E>;
}
export declare function actionCreatorFactory(prefix?: string | null, defaultIsError?: (payload: any) => boolean): ActionCreatorFactory;
export default actionCreatorFactory;
