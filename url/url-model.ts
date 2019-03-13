export type IQuery = { [key: string]: string | string[] };

export interface IRedirectQuery {
  redirect?: string;
}

export function serialize<T>(source: string, omitEmpty = true): T {
  if (!source) return {} as T;

  source = source.replace("?", "");

  const kvArr = source.split("&");
  const target = {};

  for (let kv of kvArr) {
    const kvPair = kv.split("=");

    if (kvPair.length === 2) {
      let key = decodeURIComponent(kvPair[0]);
      const newValue = decodeURIComponent(kvPair[1]);

      if (newValue === "" && omitEmpty) {
        continue;
      }

      if (key.slice(-2) === "[]") {
        key = key.replace("[]", "");
        target[key] = target[key] || [];
        (target[key] as string[]).push(newValue);
      } else if (/\w+\[\w+\]$/.test(key)) {
        const regex = /\[\w+\]$/;
        const keyTarget = key.replace(regex, "");
        const paramKey = key.match(regex)[0].replace(/\[|\]/g, "");

        target[keyTarget] = target[keyTarget] || {};
        target[keyTarget] = Object.assign({}, target[keyTarget], { [paramKey]: newValue });
      } else {
        target[key] = newValue;
      }
    }
  }

  return target as T;
}

export function deserialize(obj: any, encode = true, omitEmpty = true): string {
  const params: string[] = [];

  for (let key in obj) {
    const value = obj[key];

    if (value !== undefined) {
      if (Array.isArray(value)) {
        for (let index in value) {
          const item = value[index];

          if (omitEmpty && item === undefined) {
            continue;
          }

          if (encode) {
            params.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(item)}`);
          } else {
            params.push(`${key}[]=${item}`);
          }
        }
      } else if (value != null && typeof value === "object") {
        Object.keys(value).forEach((objKey) => {
          const item = value[objKey];

          if (omitEmpty && item === undefined) {
            return;
          }

          if (encode) {
            params.push(`${encodeURIComponent(key)}[${encodeURIComponent(objKey)}]=${encodeURIComponent(item)}`);
          } else {
            params.push(`${key}[${objKey}]=${item}`);
          }
        });
      } else {
        if (omitEmpty && value === undefined) {
          continue;
        }

        if (encode) {
          params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        } else {
          params.push(`${key}=${value}`);
        }
      }
    }
  }

  if (params.length) return params.join("&");

  return "";
}

interface IParsedHash<T> {
  hashPathname: string;
  hashQuery: T;
  hashQueryString: string;
  hashHash: string;
}

function parseRawHash<T>(rawHash: string, omitEmptyQuery: boolean): IParsedHash<T> {
  const hashString = rawHash.replace("#", "");
  const hashHashArray = hashString.split("#");

  let hashPathname = "";
  let hashQuery = {};
  let hashHash = "";
  let hashQueryString = "";

  if (hashHashArray.length === 2) {
    hashHash = hashHashArray[1];
  }

  const hashPathWithQuery = hashHashArray[0];
  const hashQueryArray = hashPathWithQuery.split("?");

  if (hashQueryArray.length === 2) {
    hashQueryString = hashQueryArray[1] !== "" ? `?${hashQueryArray[1]}` : "";
    hashQuery = serialize<T>(hashQueryArray[1], omitEmptyQuery);
  }

  hashPathname = hashQueryArray[0];

  return {
    hashPathname,
    hashQuery: hashQuery as T,
    hashQueryString,
    hashHash,
  };
}

function parseRawQuery<T>(rawQuery: string, omitEmptyQuery: boolean): T {
  return serialize<T>(rawQuery.replace("?", ""), omitEmptyQuery);
}

function parseRawHref(rawHref: string): URL | HTMLAnchorElement {
  if ("URL" in window) {
    return new URL(rawHref, location.href);
  } else {
    const a = document.createElement("a");

    a.href = rawHref;

    return a;
  }
}

function formatQuery<T>(query: T, withQuestionMark: boolean, omitEmptyQuery: boolean, encode = true): string {
  const prefix = withQuestionMark ? "?" : "";
  const searchStr = deserialize(query, encode, omitEmptyQuery);
  return searchStr ? `${prefix}${deserialize(query, encode, omitEmptyQuery)}` : "";
}

function formatHash<T>(hashPathname: string, hashQuery: T, hashHash: string, withNumberMark: boolean, omitEmptyQuery: boolean, encode = true): string {
  const hashSearchStr = deserialize(hashQuery, encode, omitEmptyQuery);

  let hashHashStr = "";

  if (hashHash !== undefined && hashHash !== "") {
    if (hashHash.slice(0, 1) !== "#") {
      hashHashStr += "#";
    }

    hashHashStr += hashHash;
  }

  let pathname = "";

  if (hashPathname) {
    if (withNumberMark && hashPathname.slice(0, 1) !== "#") {
      pathname += "#";
    }

    if (hashPathname.slice(0, 1) !== "/") {
      pathname += "/";
    }

    pathname += hashPathname.replace("#/", "").replace("#", "");
  }

  if (hashSearchStr) pathname += `?${hashSearchStr}`;
  if (hashHashStr) pathname += hashHashStr;

  return pathname;
}

export class UrlModel<T> {
  private omitEmptyQuery: boolean;
  private originParsedUrl: URL | HTMLAnchorElement;

  query: T;
  queryString: string;
  hashPathname: string = "";
  hashQuery: T;
  hashQueryString: string;
  hashHash: string = "";

  get host() {
    return this.originParsedUrl.host;
  }
  set host(host: string) {
    this.originParsedUrl.host = host;
  }

  get hostname() {
    return this.originParsedUrl.hostname;
  }
  set hostname(hostname: string) {
    this.originParsedUrl.hostname = hostname;
  }

  get origin() {
    return this.originParsedUrl.origin;
  }

  get pathname() {
    return this.originParsedUrl.pathname;
  }
  set pathname(pathname: string) {
    this.originParsedUrl.pathname = pathname;
  }

  get port() {
    return this.originParsedUrl.port;
  }
  set port(port: string) {
    this.originParsedUrl.port = port;
  }

  get protocol() {
    return this.originParsedUrl.protocol;
  }
  set protocol(protocol: string) {
    this.originParsedUrl.protocol = protocol;
  }

  get href(): string {
    return this.toString();
  }

  set href(href: string) {
    const parsedUrl = parseRawHref(href);

    this.originParsedUrl = parsedUrl;

    const parsedQuery = parseRawQuery<T>(parsedUrl.search, this.omitEmptyQuery);
    const parsedHash = parseRawHash<T>(parsedUrl.hash, this.omitEmptyQuery);

    this.query = parsedQuery;
    this.queryString = parsedUrl.search;
    this.hashPathname = parsedHash.hashPathname;
    this.hashQueryString = parsedHash.hashQueryString;
    this.hashQuery = parsedHash.hashQuery;
    this.hashHash = parsedHash.hashHash;
  }

  get hash() {
    return this.toHash(true);
  }

  set hash(hash: string) {
    const parsedHash = parseRawHash<T>(hash, this.omitEmptyQuery);
    this.hashPathname = parsedHash.hashPathname;
    this.hashQuery = parsedHash.hashQuery;
    this.hashQueryString = parsedHash.hashQueryString;
    this.hashHash = parsedHash.hashHash;
  }

  constructor(url: string, omitEmptyQuery = true) {
    this.omitEmptyQuery = omitEmptyQuery;
    this.href = url;
  }

  toString(): string {
    this.originParsedUrl.search = formatQuery(this.query, true, this.omitEmptyQuery, true);
    this.originParsedUrl.hash = formatHash(this.hashPathname, this.hashQuery, this.hashHash, true, this.omitEmptyQuery, true);

    return this.originParsedUrl.toString();
  }

  toHash(withNumberMark = false): string {
    return formatHash(this.hashPathname, this.hashQuery, this.hashHash, withNumberMark, this.omitEmptyQuery, true);
  }

  hasSearchKey(key: string | string[], matchAll = false): boolean {
    const query = this.query || {};
    const hashQuery = this.hashQuery || {};

    if (Object.keys(query).length === 0 && Object.keys(hashQuery).length === 0) {
      return false;
    }

    if (!Array.isArray(key)) {
      return query.hasOwnProperty(key) || hashQuery.hasOwnProperty(key);
    }

    for (let item of key) {
      const hasQueryKey = query.hasOwnProperty(item);
      const hasHashQueryKey = hashQuery.hasOwnProperty(item);

      // 不匹配所有，包含某个key，找到立刻返回true
      if ((hasQueryKey || hasHashQueryKey) && !matchAll) {
        return true;
      }

      // 匹配所有，但某个key没找到，立即返回false
      if (matchAll && !hasQueryKey && !hasHashQueryKey) {
        return false;
      }
    }

    // 最后都没找到，返回false
    return false;
  }
}

export function validateUrl(urlModel: UrlModel<any>): boolean {
  return location.protocol === urlModel.protocol && location.hostname === urlModel.hostname && location.port === urlModel.port;
}

export function getCompleteUrlWithPath(path: string) {
  const url = new UrlModel(`${location.origin}${path}`);
  return url.toString();
}
