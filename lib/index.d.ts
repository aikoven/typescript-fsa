export interface AnyAction {
    type: any;
}
export declare type Meta = null | {
    [key: string]: any;
};
export interface Action<Payload> extends AnyAction {
    type: string;
    payload: Payload;
    error?: boolean;
    meta?: Meta;
}
export declare type Success<Params, Result> = ({
    params: Params;
} | (Params extends void ? {
    params?: Params;
} : never)) & ({
    result: Result;
} | (Result extends void ? {
    result?: Result;
} : never));
export declare type Failure<Params, Error> = ({
    params: Params;
} | (Params extends void ? {
    params?: Params;
} : never)) & {
    error: Error;
};
export declare function isType<Payload>(action: AnyAction, actionCreator: ActionCreator<Payload>): action is Action<Payload>;
export declare type ActionCreator<Payload> = {
    type: string;
    match: (action: AnyAction) => action is Action<Payload>;
    (payload: Payload, meta?: Meta): Action<Payload>;
} & (Payload extends void ? {
    (payload?: Payload, meta?: Meta): Action<Payload>;
} : {});
export interface AsyncActionCreators<Params, Result, Error = {}> {
    type: string;
    started: ActionCreator<Params>;
    done: ActionCreator<Success<Params, Result>>;
    failed: ActionCreator<Failure<Params, Error>>;
}
export interface ActionCreatorFactory {
    <Payload = void>(type: string, commonMeta?: Meta, isError?: boolean): ActionCreator<Payload>;
    <Payload = void>(type: string, commonMeta?: Meta, isError?: (payload: Payload) => boolean): ActionCreator<Payload>;
    async<Params, Result, Error = {}>(type: string, commonMeta?: Meta): AsyncActionCreators<Params, Result, Error>;
}
export declare function actionCreatorFactory(prefix?: string | null, defaultIsError?: (payload: any) => boolean): ActionCreatorFactory;
export default actionCreatorFactory;
