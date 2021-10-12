import Axios from "axios";

export default function({ $axios, $auth }, inject) {
  // Create a custom axios instance
  const api = $axios.create({
    transformRequest: [
      (data, headers) => {
        if ($auth.loggedIn) {
          headers["Authorization"] = $auth.getToken("local");
        }
        return data;
      },
      ...Axios.defaults.transformRequest
    ]
  });

  api.interceptors.request.use(
    conf => {
      eventBus.$emit("before-request");
      return conf;
    },
    error => {
      eventBus.$emit("request-error");
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    response => {
      eventBus.$emit("after-response");
      return response;
    }
    // error => {
    //   eventBus.$emit("response-error");
    //   if ($nuxt) {
    //     $nuxt.$sentry.captureException(error);
    //   }
    //   return Promise.reject(error);
    // }
  );

  // Set baseURL to something different
  // api.setBaseURL('https://my_api.com')

  // Inject to context as $api
  inject("api", api);
}
