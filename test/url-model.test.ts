import { UrlModel } from "../url/url-model";

interface IQuery {
  a?: string;
  b?: string;
  c?: string;
  d?: string;
  e?: string;
  f?: string;
}

test("test href with query, hash", () => {
  const testUrl = "http://jimu.io?a=1&b=q&c=#/abc/efg?d=3&e=w&f=#testhash";
  const url = new UrlModel<IQuery>(testUrl);

  const expectedQuery = {
    a: "1",
    b: "q",
  };
  const expectedQueryString = "?a=1&b=q&c=";
  expect(url.query).toEqual(expectedQuery);
  expect(url.queryString).toEqual(expectedQueryString);

  const expectedHashPathname = "/abc/efg";
  expect(url.hashPathname).toBe(expectedHashPathname);

  const expectedHashQuery = {
    d: "3",
    e: "w",
  };
  const expectedHashQueryString = "?d=3&e=w&f=";
  expect(url.hashQuery).toEqual(expectedHashQuery);
  expect(url.hashQueryString).toEqual(expectedHashQueryString);

  const expectedHashHash = "testhash";
  expect(url.hashHash).toBe(expectedHashHash);
});

test("test href with query, hash and false omitEmptyQuery option", () => {
  const testUrl = "http://jimu.io?a=1&b=q&c=#/abc/efg?d=3&e=w&f=#testhash";

  const url = new UrlModel<IQuery>(testUrl, false);

  const expectedQuery = {
    a: "1",
    b: "q",
    c: "",
  };
  expect(url.query).toEqual(expectedQuery);

  const expectedHashQuery = {
    d: "3",
    e: "w",
    f: "",
  };
  expect(url.hashQuery).toEqual(expectedHashQuery);
});

test("test href without query, hash", () => {
  const testUrl = "http://jimu.io";

  const url = new UrlModel<IQuery>(testUrl);

  const expectedQuery = {};
  expect(url.query).toEqual(expectedQuery);

  const expectedHashPathname = "";
  expect(url.hashPathname).toBe(expectedHashPathname);

  const expectedHashQuery = {};
  expect(url.hashQuery).toEqual(expectedHashQuery);

  const expectedHashHash = "";
  expect(url.hashHash).toBe(expectedHashHash);
});

test("test query", () => {
  const testUrl = "http://jimu.io";
  const url = new UrlModel<IQuery>(testUrl);

  url.query = {
    a: "1",
    b: "q",
  };

  const expectedUrl = "http://jimu.io/?a=1&b=q";
  expect(url.toString()).toBe(expectedUrl);
  expect(url.href).toBe(expectedUrl);

  url.query = {
    a: "1",
    b: "q",
    c: "",
  };

  const expectedUrlWithEmptyQuery = "http://jimu.io/?a=1&b=q&c=";
  expect(url.toString()).toBe(expectedUrlWithEmptyQuery);
  expect(url.href).toBe(expectedUrlWithEmptyQuery);
});

test("test hash", () => {
  const testUrl = "http://jimu.io";
  const url = new UrlModel<IQuery>(testUrl);

  url.hashPathname = "fi/test";
  url.hashQuery = {
    a: "1",
    b: "q",
  };
  url.hashHash = "testHash";

  const expectedUrl = "http://jimu.io/#/fi/test?a=1&b=q#testHash";
  expect(url.toString()).toBe(expectedUrl);
  expect(url.href).toBe(expectedUrl);

  const expectedHash = "/fi/test?a=1&b=q#testHash";
  const expectedHashWithNumberMark = "#/fi/test?a=1&b=q#testHash";

  expect(url.toHash()).toBe(expectedHash);
  expect(url.toHash(true)).toBe(expectedHashWithNumberMark);
});

test("test hash pathname", () => {
  const testUrl = "http://jimu.io";
  const url = new UrlModel<IQuery>(testUrl);

  url.hashPathname = "fi/test";

  const expectedUrl = "http://jimu.io/#/fi/test";
  expect(url.toString()).toBe(expectedUrl);
  expect(url.href).toBe(expectedUrl);

  url.hashPathname = "/fi/test";

  expect(url.toString()).toBe(expectedUrl);
  expect(url.href).toBe(expectedUrl);

  url.hashPathname = "#/fi/test";

  expect(url.toString()).toBe(expectedUrl);
  expect(url.href).toBe(expectedUrl);
});

test("test hash query", () => {
  const testUrl = "http://jimu.io";
  const url = new UrlModel<IQuery>(testUrl);

  url.hashQuery = {
    a: "1",
    b: "q",
  };

  const expectedUrl = "http://jimu.io/#?a=1&b=q";
  expect(url.toString()).toBe(expectedUrl);
  expect(url.href).toBe(expectedUrl);

  url.hashQuery = {
    a: "1",
    b: "q",
    c: "",
  };

  const expectedUrlWithEmptyQuery = "http://jimu.io/#?a=1&b=q&c=";
  expect(url.toString()).toBe(expectedUrlWithEmptyQuery);
  expect(url.href).toBe(expectedUrlWithEmptyQuery);
});

test("test hash query with hash", () => {
  const testUrl = "http://jimu.io/account/#/signin?redirect=http%3A%2F%2Fjimu.io%2Ffi%2F%23%2Fmaterial";
  const url = new UrlModel<{
    redirect: string;
  }>(testUrl);

  const expectedQuery = "http://jimu.io/fi/#/material";
  expect(url.hashQuery.redirect).toBe(expectedQuery);

  const url2 = new UrlModel<{
    redirect: string;
  }>("http://jimu.io/account/#/signin");

  url2.hashQuery.redirect = "http://jimu.io/fi/#/material";

  const expectedQuery2 = "http://jimu.io/account/#/signin?redirect=http%3A%2F%2Fjimu.io%2Ffi%2F%23%2Fmaterial";
  expect(url.toString()).toBe(expectedQuery2);
});

test("test hash", () => {
  const testUrl = "http://jimu.io";
  const url = new UrlModel<IQuery>(testUrl);

  url.hashHash = "testHash";

  const expectedUrl = "http://jimu.io/#testHash";
  expect(url.toString()).toBe(expectedUrl);
  expect(url.href).toBe(expectedUrl);
});

declare var jsdom: any;

test("test path without slash", () => {
  jsdom.reconfigure({
    url: "http://jimu.io/fi",
  });

  const testUrl = "#/";
  const url = new UrlModel<IQuery>(testUrl);

  const expectedUrl = "http://jimu.io/fi#/";
  expect(url.toString()).toBe(expectedUrl);
  expect(url.href).toBe(expectedUrl);

  const notexpectedUrl = "http://jimu.io/fi/#/";
  expect(url.toString()).not.toBe(notexpectedUrl);
  expect(url.href).not.toBe(notexpectedUrl);
});

test("test path with slash", () => {
  jsdom.reconfigure({
    url: "http://jimu.io/fi/",
  });

  const testUrl = "#/";
  const url = new UrlModel<IQuery>(testUrl);

  const expectedUrl = "http://jimu.io/fi/#/";
  expect(url.toString()).toBe(expectedUrl);
  expect(url.href).toBe(expectedUrl);

  const notexpectedUrl = "http://jimu.io/fi#/";
  expect(url.toString()).not.toBe(notexpectedUrl);
  expect(url.href).not.toBe(notexpectedUrl);
});

test("test hasSearchKey", () => {
  const testUrl = "http://baidu.com?a=1&b=2&e=";
  const url = new UrlModel<IQuery>(testUrl);

  const hasKeyA = url.hasSearchKey("a");
  expect(hasKeyA).toBeTruthy();

  const hasKeyB = url.hasSearchKey("b");
  expect(hasKeyB).toBeTruthy();

  const hasKeyAOrB = url.hasSearchKey(["a", "b"]);
  expect(hasKeyAOrB).toBeTruthy();

  const hasKeyAOrC = url.hasSearchKey(["a", "c"]);
  expect(hasKeyAOrC).toBeTruthy();

  const hasKeyC = url.hasSearchKey("c");
  expect(hasKeyC).toBeFalsy();

  const haveKeyAAndC = url.hasSearchKey(["a", "c"], true);
  expect(haveKeyAAndC).toBeFalsy();

  const hasKeyCOrD = url.hasSearchKey(["c", "d"]);
  expect(hasKeyCOrD).toBeFalsy();

  const hasKeyE = url.hasSearchKey("e");
  expect(hasKeyE).toBeFalsy();

  const testUrlWithEmptyKey = "http://baidu.com?a=";
  const urlWithEmptyKey = new UrlModel(testUrlWithEmptyKey);

  const hasEmptyKeyA = urlWithEmptyKey.hasSearchKey("a");
  expect(hasEmptyKeyA).toBeFalsy();
});
