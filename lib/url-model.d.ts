export declare type IQuery = {
    [key: string]: string | string[];
};
export interface IRedirectQuery {
    redirect?: string;
}
export declare function serialize<T>(source: string, omitEmpty?: boolean): T;
export declare function deserialize(obj: any, encode?: boolean, omitEmpty?: boolean): string;
export declare class UrlModel<T> {
    private omitEmptyQuery;
    private originParsedUrl;
    query: T;
    queryString: string;
    hashPathname: string;
    hashQuery: T;
    hashQueryString: string;
    hashHash: string;
    host: string;
    hostname: string;
    readonly origin: string;
    pathname: string;
    port: string;
    protocol: string;
    href: string;
    hash: string;
    constructor(url: string, omitEmptyQuery?: boolean);
    toString(): string;
    toHash(withNumberMark?: boolean): string;
    hasSearchKey(key: string | string[], matchAll?: boolean): boolean;
}
export declare function validateUrl(urlModel: UrlModel<any>): boolean;
export declare function getCompleteUrlWithPath(path: string): string;
