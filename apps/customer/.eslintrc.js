// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  extends: ["custom"],
  "plugins": ["@typescript-eslint"],
  rules: {
    'import/no-anonymous-default-export': 0,
    'react/display-name': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@next/next/no-img-element': 0,
  }
};
