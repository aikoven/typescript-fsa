import { AsyncActionCreators } from "./index";
import { SagaIterator } from "redux-saga";
export declare function bindAsyncAction<R>(actionCreators: AsyncActionCreators<void, R, any>): {
    (worker: () => Promise<R> | SagaIterator): () => SagaIterator;
    (worker: (params: void) => Promise<R> | SagaIterator): (params: void) => SagaIterator;
    <A1>(worker: (params: void, arg1: A1) => Promise<R> | SagaIterator): (params: void, arg1: A1) => SagaIterator;
    <A1, A2>(worker: (params: void, arg1: A1, arg2: A2) => Promise<R> | SagaIterator): (params: void, arg1: A1, arg2: A2) => SagaIterator;
    <A1, A2, A3>(worker: (params: void, arg1: A1, arg2: A2, arg3: A3, ...rest: any[]) => Promise<R> | SagaIterator): (params: void, arg1: A1, arg2: A2, arg3: A3, ...rest: any[]) => SagaIterator;
};
export declare function bindAsyncAction<P, R>(actionCreators: AsyncActionCreators<P, R, any>): {
    (worker: (params: P) => Promise<R> | SagaIterator): (params: P) => SagaIterator;
    <A1>(worker: (params: P, arg1: A1) => Promise<R> | SagaIterator): (params: P, arg1: A1) => SagaIterator;
    <A1, A2>(worker: (params: P, arg1: A1, arg2: A2) => Promise<R> | SagaIterator): (params: P, arg1: A1, arg2: A2) => SagaIterator;
    <A1, A2, A3>(worker: (params: P, arg1: A1, arg2: A2, arg3: A3, ...rest: any[]) => Promise<R> | SagaIterator): (params: P, arg1: A1, arg2: A2, arg3: A3, ...rest: any[]) => SagaIterator;
};
