<template>
  <v-form @submit.prevent="handleSubmit">
    <h3>
    Change Password
    </h3>
    <v-container>
      <v-row>
        <v-col cols="12" md="12">
          <v-text-field
            v-model="$v.oldpassword.$model"
            :error="$v.oldpassword.$error"
            @blur = "passwordErrors('Old Password')"
            label="Old Password"
            type="password"
            required
          >
          </v-text-field>
          
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="New Password"
            type="password"
            v-model="$v.newpassword.$model"
            :error="$v.newpassword.$error"
            required
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Confirm Password"
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-btn large
            color="primary"
          >
              Save
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
<script>
  import Vue from 'vue'
  import Vuelidate, { validationMixin } from 'vuelidate'
  import { required } from 'vuelidate/lib/validators'
  import { helpers } from 'vuelidate/lib/validators'
  Vue.use(Vuelidate)
  import axios from '../../utils/create-axios';
  export default {
    mixins: { validationMixin },
    data() {
      return {
        loading: false,
        oldpassword: null,
        newpassword: null
      }
    },
    validations: {
      oldpassword: {
        required
      },
      newpassword: {
        required
      }
    },
    mounted() {

    },
    methods: {
      passwordErrors(name) {
        const errors = [];
        if (this.$v.oldpassword.$dirty) {
          return errors
        } else if (!this.$v.oldpassword.required && errors.push(`${name} is required`)) {
          return errors
        } 
      }
    },
    watch: {

    }
  }
</script>