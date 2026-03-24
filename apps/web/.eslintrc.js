module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off",
    "react/display-name": "off",
    "react/prop-types": "off",
    "no-unused-vars": "warn",
    "no-console": "off",
  },
};
