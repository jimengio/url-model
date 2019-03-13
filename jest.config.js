module.exports = {
  testEnvironment: "jest-environment-jsdom-global",
  testRegex: "(/test/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["js", "json", "jsx", "node", "ts", "tsx"],
  collectCoverage: true,
  preset: "ts-jest",
  testMatch: null,
};
