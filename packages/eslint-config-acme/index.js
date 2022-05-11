// eslint-disable-next-line no-undef
module.exports = {
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
      "keyword-spacing": ["error", { "before": true, "after": true }],
      "@typescript-eslint/ban-ts-comment": 0,
      "@typescript-eslint/no-var-requires": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "no-async-promise-executor": 0,
      "brace-style": [
          "error",
          "allman",
          {
              "allowSingleLine": true
          }
      ]
  }
}
