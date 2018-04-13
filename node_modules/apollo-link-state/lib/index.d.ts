/// <reference types="zen-observable" />
import { ApolloLink, Observable, Operation, NextLink, FetchResult } from 'apollo-link';
import { ApolloCache } from 'apollo-cache';
export declare type ClientStateConfig = {
    cache?: ApolloCache<any>;
    resolvers: any;
    defaults?: any;
    typeDefs?: string | string[];
};
export declare const withClientState: (clientStateConfig?: ClientStateConfig) => {
    writeDefaults(): void;
    request(operation: Operation, forward?: NextLink): Observable<FetchResult<Record<string, any>, Record<string, any>>>;
    split(test: (op: Operation) => boolean, left: ApolloLink | ((operation: Operation, forward?: NextLink) => Observable<FetchResult<Record<string, any>, Record<string, any>>>), right?: ApolloLink | ((operation: Operation, forward?: NextLink) => Observable<FetchResult<Record<string, any>, Record<string, any>>>)): ApolloLink;
    concat(next: ApolloLink | ((operation: Operation, forward?: NextLink) => Observable<FetchResult<Record<string, any>, Record<string, any>>>)): ApolloLink;
};
