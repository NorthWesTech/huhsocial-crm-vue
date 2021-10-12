import Vue from "vue";
import * as Sentry from "@sentry/browser";
import * as Integrations from "@sentry/integrations";

if (process.env.NODE_ENV == "production") {
  Sentry.init({
    dsn: "https://6bdfa2db397240a2b025bb70e073f345@sentry.io/5174580",
    integrations: [new Integrations.Vue({ Vue, attachProps: true })]
  });
}