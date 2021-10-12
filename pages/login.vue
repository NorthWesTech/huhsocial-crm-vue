<template>
  <div class="login-page">
    <div class="login-page--container">
      <div class="login-page--logo">
        <img src="/inf-admin/templateimages/logo.png" alt="Lanistar Logo" width="300" />
      </div>
      <div class="login-page--title">
        Login To Your Account
      </div>
      <div class="login-page--form">
        <v-form id="login-form" class="text-center" @submit.prevent="handleSubmit">
          <v-alert v-if="errorSummary" type="error" dense>
            {{ errorSummary }}
          </v-alert>
          <v-text-field
            id="username"
            v-model="$v.username.$model"
            :error="$v.username.$error"
            :error-messages="usernameErrors"
            label="Username"
            name="username"
            type="text"
            outlined
            dense
          />

          <v-text-field
            id="password"
            v-model="$v.password.$model"
            :error="$v.password.$error"
            :error-messages="passwordErrors"
            label="Password"
            name="password"
            type="password"
            outlined
            dense
          />
          <v-btn :loading="loading" type="submit" dark class="elevation-0" color="brand-bg">Login</v-btn>
        </v-form>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Vuelidate from "vuelidate";
import { required } from "vuelidate/lib/validators";
Vue.use(Vuelidate);

export default {
  layout: "blank",
  props: {
    source: String
  },
  auth: false,
  data() {
    return {
      username: null,
      password: null,
      errorSummary: null,
      loading: false
    };
  },
  head: {
    link: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&amp;display=swap"
      }
    ]
  },
  validations: {
    username: {
      required
    },
    password: {
      required
    }
  },
  computed: {
    usernameErrors() {
      const errors = [];
      if (!this.$v.username.$dirty) return errors;
      !this.$v.username.required && errors.push("Username is required");
      return errors;
    },
    passwordErrors() {
      const errors = [];
      if (!this.$v.password.$dirty) return errors;
      !this.$v.password.required && errors.push("Password is required");
      return errors;
    }
  },
  methods: {
    async handleSubmit() {
      this.loading = true;
      try {
        this.errorSummary = null;
        const response = await this.$auth.loginWith("local", {
          data: {
            email: this.username,
            password: this.password
          }
        });
        if (response && response.data && response.data.token) {
          this.$nuxt.$router.replace("/dashboard");
        }
      } catch (err) {
        let error = err.toString();
        if (typeof err.response !== "undefined" && typeof err.response.data !== "undefined") {
          error = err.response.data.message;
        }
        this.errorSummary = error;
      }
      this.loading = false;
    }
  }
};
</script>

<style lang="scss">
.login-page {
  background-image: url("/inf-admin/bg-3.jpg");
  font-family: Poppins, Helvetica, sans-serif;

  &--logo {
    margin-bottom: 2rem;
    width: 340px;
  }

  &--title {
    margin-bottom: 2rem;
    font-size: 1.5rem;
    font-weight: 500;
    color: #595d6e;
  }

  &--container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 3rem;
  }

  &--form {
    width: 430px;

    form {
      display: flex;
      flex-direction: column;
    }

    .v-alert {
      background: rgba(253, 57, 122, 0.1);
      border-color: transparent;
      color: #fd396f;
      font-weight: 500;

      .v-icon {
        color: #fd396f;
        margin-right: 1rem;
      }
    }

    .error--text {
      color: #fd396f !important;
      caret-color: #fd396f !important;
    }
  }
}

.brand-bg {
  background-color: #00b5e2 !important;
}
</style>
