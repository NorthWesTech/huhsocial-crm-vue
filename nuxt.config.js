import colors from "vuetify/es5/util/colors";
import config from "./config";

export default {
  ssr: false,
  server: {
    port: 3100 // default: 3000
    // host: '0.0.0.0' // default: localhost
  },
  env: {
    NODE_ENV: process.env.NODE_ENV,
    API_URL: process.env.API_URL,
    ASSETS_URL: process.env.ASSETS_URL
  },
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: "%s - " + process.env.npm_package_name,
    title: process.env.npm_package_name || "",
    // htmlAttrs: {
    //   translate: "no"
    // },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || ""
      }
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href: "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
      },
      {
        rel: "stylesheet",
        href: "https://cdn.linearicons.com/free/1.0.0/icon-font.min.css"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=PT+Sans+Narrow&display=swap"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat&display=swap"
      }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#00B5E2" },
  /*
   ** Global CSS
   */
  css: ["@/assets/template2.css"],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    // "plugins/sentry.js",
    "plugins/bus.js",
    "plugins/axios.js",
    "plugins/service.js",
    // { src: "plugins/i18.js", mode: "client" },
    { src: "plugins/nuxt-client-init.js", ssr: false }
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ["@nuxtjs/vuetify"],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    "@nuxtjs/axios",
    // Doc: https://github.com/nuxt-community/dotenv-module
    "@nuxtjs/dotenv",
    "@nuxtjs/auth",
    "@nuxtjs/dayjs",
    "nuxt-i18n"
  ],
  // sentry: {
  //   dsn: "https://6bdfa2db397240a2b025bb70e073f345@sentry.io/5174583",
  //   config: {}
  // },
  /*
   ** i18n module configuration
   ** See https://i18n.nuxtjs.org
   */
  i18n: {
    vueI18nLoader: true,
    locales: ["en", "fr", "es", "it", "pt", "de"],
    defaultLocale: "en",
    strategy: "no_prefix",
    vueI18n: {
      fallbackLocale: "en"
    }
  },
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: {
            url: `${config.msLandingUrl}/user/login`,
            method: "post",
            propertyName: "token"
          },
          logout: { url: `${config.msLandingUrl}/user/logout`, method: "post" },
          user: {
            url: `${config.msLandingUrl}/user/info`,
            method: "get",
            propertyName: "user"
          }
        },
        tokenType: "Bearer",
        autoFetchUser: true,
        tokenRequired: true
      }
    }
  },
  router: {
    middleware: ["auth"]
  },
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    customVariables: ["~/assets/variables.scss"],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? "source-map" : "inline-source-map";
      }
    }
  }
};
