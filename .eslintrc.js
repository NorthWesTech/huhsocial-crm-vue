module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    jquery: true
  },
  parserOptions: {
    parser: "babel-eslint"
  },
  globals: {
    $nuxt: true
  },
  extends: [
    "plugin:nuxt/recommended",
    "plugin:vue/recommended",
    "eslint:recommended",
    "prettier",
    "prettier/vue",
    "plugin:prettier/recommended"
  ],
  plugins: ["vue", "prettier"],
  // add your custom rules here
  rules: {
    "prettier/prettier": 1,
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "vue/no-v-html": "off"
  }
};
