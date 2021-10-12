
<template>
  <v-layout column>
    <h1>Invite an Influencer</h1>
    <v-sheet v-if="errorSummary">
      <v-alert type="error">
        {{ errorSummary }}
      </v-alert>
    </v-sheet>
    <v-sheet v-if="successMessage">
      <v-alert type="success">
        {{ successMessage }}
      </v-alert>
    </v-sheet>
    <v-sheet v-if="!successMessage">
      <v-form @submit.prevent="handleSubmit">
        <v-container>
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="$v.emailAddress.$model"
                :error="$v.emailAddress.$error"
                :error-messages="emailErrors"
                label="Email address"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-btn large
              type="submit"
              color="primary"
              :loading="loading"
              :disabled="loading || $v.$invalid">
              Invite
            </v-btn>
          </v-row>

        </v-container>
      </v-form>
    </v-sheet>
  </v-layout>
</template>

<script>
import Vue from 'vue'
import Vuelidate, { validationMixin } from 'vuelidate'
import { email, required } from 'vuelidate/lib/validators'
Vue.use(Vuelidate)

import axios from '../../utils/create-axios'
import config from '../../config';
import parseApiError from '../../utils/parse-api-error'

export default {
  mixins: { validationMixin },
  data() {
    return {
      loading: false,
      errorSummary: null,
      successMessage: null,
      emailAddress: null
    };
  },
  validations: {
    emailAddress: {
      required,
      email
    }
  },
  async mounted() {
  },
  methods: {
    async handleSubmit() {
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }
      await this.sendInvitation()
    },
    async sendInvitation() {
      this.loading = true
      this.errorSummary = null
      try {
        const url = `${config.msLandingUrl}/influencer/invite`
        const result = await axios.post(url, {
        email: this.emailAddress,
        user: this.$auth.user,
        ip: (sessionStorage.getItem('ip')) ? sessionStorage.getItem('ip') : null
        });
        if (result && result.data && result.data.success) {
          this.successMessage = 'Invitation has been sent'
        }
      } catch (error) {
        this.errorSummary = parseApiError(error)
      }
      this.loading = false;
    }
  },
  computed: {
    emailErrors() {
      const errors = []
      if (!this.$v.emailAddress.$dirty) return errors
      !this.$v.emailAddress.email && errors.push('Must be a valid e-mail')
      !this.$v.emailAddress.required && errors.push('Phone number is required')
      return errors
    }
  }
};
</script>
