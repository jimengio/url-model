"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function serialize(source, omitEmpty) {
    if (omitEmpty === void 0) { omitEmpty = true; }
    var _a;
    if (!source)
        return {};
    source = source.replace("?", "");
    var kvArr = source.split("&");
    var target = {};
    for (var _i = 0, kvArr_1 = kvArr; _i < kvArr_1.length; _i++) {
        var kv = kvArr_1[_i];
        var kvPair = kv.split("=");
        if (kvPair.length === 2) {
            var key = decodeURIComponent(kvPair[0]);
            var newValue = decodeURIComponent(kvPair[1]);
            if (newValue === "" && omitEmpty) {
                continue;
            }
            if (key.slice(-2) === "[]") {
                key = key.replace("[]", "");
                target[key] = target[key] || [];
                target[key].push(newValue);
            }
            else if (/\w+\[\w+\]$/.test(key)) {
                var regex = /\[\w+\]$/;
                var keyTarget = key.replace(regex, "");
                var paramKey = key.match(regex)[0].replace(/\[|\]/g, "");
                target[keyTarget] = target[keyTarget] || {};
                target[keyTarget] = Object.assign({}, target[keyTarget], (_a = {}, _a[paramKey] = newValue, _a));
            }
            else {
                target[key] = newValue;
            }
        }
    }
    return target;
}
exports.serialize = serialize;
function deserialize(obj, encode, omitEmpty) {
    if (encode === void 0) { encode = true; }
    if (omitEmpty === void 0) { omitEmpty = true; }
    var params = [];
    var _loop_1 = function (key) {
        var value = obj[key];
        if (value !== undefined) {
            if (Array.isArray(value)) {
                for (var index in value) {
                    var item = value[index];
                    if (omitEmpty && item === undefined) {
                        continue;
                    }
                    if (encode) {
                        params.push(encodeURIComponent(key) + "[]=" + encodeURIComponent(item));
                    }
                    else {
                        params.push(key + "[]=" + item);
                    }
                }
            }
            else if (value != null && typeof value === "object") {
                Object.keys(value).forEach(function (objKey) {
                    var item = value[objKey];
                    if (omitEmpty && item === undefined) {
                        return;
                    }
                    if (encode) {
                        params.push(encodeURIComponent(key) + "[" + encodeURIComponent(objKey) + "]=" + encodeURIComponent(item));
                    }
                    else {
                        params.push(key + "[" + objKey + "]=" + item);
                    }
                });
            }
            else {
                if (omitEmpty && value === undefined) {
                    return "continue";
                }
                if (encode) {
                    params.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
                }
                else {
                    params.push(key + "=" + value);
                }
            }
        }
    };
    for (var key in obj) {
        _loop_1(key);
    }
    if (params.length)
        return params.join("&");
    return "";
}
exports.deserialize = deserialize;
function parseRawHash(rawHash, omitEmptyQuery) {
    var hashString = rawHash.replace("#", "");
    var hashHashArray = hashString.split("#");
    var hashPathname = "";
    var hashQuery = {};
    var hashHash = "";
    var hashQueryString = "";
    if (hashHashArray.length === 2) {
        hashHash = hashHashArray[1];
    }
    var hashPathWithQuery = hashHashArray[0];
    var hashQueryArray = hashPathWithQuery.split("?");
    if (hashQueryArray.length === 2) {
        hashQueryString = hashQueryArray[1] !== "" ? "?" + hashQueryArray[1] : "";
        hashQuery = serialize(hashQueryArray[1], omitEmptyQuery);
    }
    hashPathname = hashQueryArray[0];
    return {
        hashPathname: hashPathname,
        hashQuery: hashQuery,
        hashQueryString: hashQueryString,
        hashHash: hashHash,
    };
}
function parseRawQuery(rawQuery, omitEmptyQuery) {
    return serialize(rawQuery.replace("?", ""), omitEmptyQuery);
}
function parseRawHref(rawHref) {
    if ("URL" in window) {
        return new URL(rawHref, location.href);
    }
    else {
        var a = document.createElement("a");
        a.href = rawHref;
        return a;
    }
}
function formatQuery(query, withQuestionMark, omitEmptyQuery, encode) {
    if (encode === void 0) { encode = true; }
    var prefix = withQuestionMark ? "?" : "";
    var searchStr = deserialize(query, encode, omitEmptyQuery);
    return searchStr ? "" + prefix + deserialize(query, encode, omitEmptyQuery) : "";
}
function formatHash(hashPathname, hashQuery, hashHash, withNumberMark, omitEmptyQuery, encode) {
    if (encode === void 0) { encode = true; }
    var hashSearchStr = deserialize(hashQuery, encode, omitEmptyQuery);
    var hashHashStr = "";
    if (hashHash !== undefined && hashHash !== "") {
        if (hashHash.slice(0, 1) !== "#") {
            hashHashStr += "#";
        }
        hashHashStr += hashHash;
    }
    var pathname = "";
    if (hashPathname) {
        if (withNumberMark && hashPathname.slice(0, 1) !== "#") {
            pathname += "#";
        }
        if (hashPathname.slice(0, 1) !== "/") {
            pathname += "/";
        }
        pathname += hashPathname.replace("#/", "").replace("#", "");
    }
    if (hashSearchStr)
        pathname += "?" + hashSearchStr;
    if (hashHashStr)
        pathname += hashHashStr;
    return pathname;
}
var UrlModel = /** @class */ (function () {
    function UrlModel(url, omitEmptyQuery) {
        if (omitEmptyQuery === void 0) { omitEmptyQuery = true; }
        this.hashPathname = "";
        this.hashHash = "";
        this.omitEmptyQuery = omitEmptyQuery;
        this.href = url;
    }
    Object.defineProperty(UrlModel.prototype, "host", {
        get: function () {
            return this.originParsedUrl.host;
        },
        set: function (host) {
            this.originParsedUrl.host = host;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlModel.prototype, "hostname", {
        get: function () {
            return this.originParsedUrl.hostname;
        },
        set: function (hostname) {
            this.originParsedUrl.hostname = hostname;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlModel.prototype, "origin", {
        get: function () {
            return this.originParsedUrl.origin;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlModel.prototype, "pathname", {
        get: function () {
            return this.originParsedUrl.pathname;
        },
        set: function (pathname) {
            this.originParsedUrl.pathname = pathname;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlModel.prototype, "port", {
        get: function () {
            return this.originParsedUrl.port;
        },
        set: function (port) {
            this.originParsedUrl.port = port;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlModel.prototype, "protocol", {
        get: function () {
            return this.originParsedUrl.protocol;
        },
        set: function (protocol) {
            this.originParsedUrl.protocol = protocol;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlModel.prototype, "href", {
        get: function () {
            return this.toString();
        },
        set: function (href) {
            var parsedUrl = parseRawHref(href);
            this.originParsedUrl = parsedUrl;
            var parsedQuery = parseRawQuery(parsedUrl.search, this.omitEmptyQuery);
            var parsedHash = parseRawHash(parsedUrl.hash, this.omitEmptyQuery);
            this.query = parsedQuery;
            this.queryString = parsedUrl.search;
            this.hashPathname = parsedHash.hashPathname;
            this.hashQueryString = parsedHash.hashQueryString;
            this.hashQuery = parsedHash.hashQuery;
            this.hashHash = parsedHash.hashHash;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UrlModel.prototype, "hash", {
        get: function () {
            return this.toHash(true);
        },
        set: function (hash) {
            var parsedHash = parseRawHash(hash, this.omitEmptyQuery);
            this.hashPathname = parsedHash.hashPathname;
            this.hashQuery = parsedHash.hashQuery;
            this.hashQueryString = parsedHash.hashQueryString;
            this.hashHash = parsedHash.hashHash;
        },
        enumerable: true,
        configurable: true
    });
    UrlModel.prototype.toString = function () {
        this.originParsedUrl.search = formatQuery(this.query, true, this.omitEmptyQuery, true);
        this.originParsedUrl.hash = formatHash(this.hashPathname, this.hashQuery, this.hashHash, true, this.omitEmptyQuery, true);
        return this.originParsedUrl.toString();
    };
    UrlModel.prototype.toHash = function (withNumberMark) {
        if (withNumberMark === void 0) { withNumberMark = false; }
        return formatHash(this.hashPathname, this.hashQuery, this.hashHash, withNumberMark, this.omitEmptyQuery, true);
    };
    UrlModel.prototype.hasSearchKey = function (key, matchAll) {
        if (matchAll === void 0) { matchAll = false; }
        var query = this.query || {};
        var hashQuery = this.hashQuery || {};
        if (Object.keys(query).length === 0 && Object.keys(hashQuery).length === 0) {
            return false;
        }
        if (!Array.isArray(key)) {
            return query.hasOwnProperty(key) || hashQuery.hasOwnProperty(key);
        }
        for (var _i = 0, key_1 = key; _i < key_1.length; _i++) {
            var item = key_1[_i];
            var hasQueryKey = query.hasOwnProperty(item);
            var hasHashQueryKey = hashQuery.hasOwnProperty(item);
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
    };
    return UrlModel;
}());
exports.UrlModel = UrlModel;
function validateUrl(urlModel) {
    return location.protocol === urlModel.protocol && location.hostname === urlModel.hostname && location.port === urlModel.port;
}
exports.validateUrl = validateUrl;
function getCompleteUrlWithPath(path) {
    var url = new UrlModel("" + location.origin + path);
    return url.toString();
}
exports.getCompleteUrlWithPath = getCompleteUrlWithPath;
