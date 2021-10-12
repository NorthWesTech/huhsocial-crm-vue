<template>
  <div>
    <v-btn class="primary" @click="launchDialog(1, null)"> Add New User<v-icon>fa-pencil-square-o</v-icon> </v-btn>
    <v-dialog v-model="dialog_one" max-width="290">
      <v-form @submit.prevent="handleFormSubmit()">
        <v-card>
          <v-card-title>New User Info</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="$v.fullname.$model"
              label="Full Name"
              :error="$v.fullname.$error"
              required
            ></v-text-field>
            <v-text-field v-model="$v.email.$model" label="Email Address" :error="$v.email.$error"></v-text-field>
            <v-text-field
              v-if="flag === 1"
              v-model="$v.raw_password.$model"
              label="Password"
              :error="$v.raw_password.$error"
            ></v-text-field>
            <v-text-field
              v-if="flag === 2"
              v-model="raw_password"
              hint="If you don't want to change leave it blank!"
              persistent-hint
              label="Password"
            ></v-text-field>
            <v-combobox
              v-model="role"
              label="Role"
              :items="roles"
              item-text="label"
              item-value="value"
              :readonly="flag == 2"
            ></v-combobox>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn color="red darken-1" text @click="dialog_one = false">
              Cancel
            </v-btn>

            <v-btn type="submit" color="green darken-1" text :disabled="$v.$invalid">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog v-model="dialog_two" max-width="290">
      <v-card>
        <v-card-title>Remove User</v-card-title>
        <v-card-text>
          Are you sure to remove <b>{{ fullname }}</b> ?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="red darken-1" text @click="dialog_two = false">
            No
          </v-btn>

          <v-btn color="green darken-1" text @click="handleFormSubmit()">
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-data-iterator :items="admins" hide-default-footer>
      <template #header> </template>
      <template #no-data>
        <v-alert color="warning" class="pa-3" dense text>
          No admin users has been found
        </v-alert>
      </template>
      <template #default="props">
        <v-progress-circular v-if="loading" :indeterminate="true"></v-progress-circular>
        <v-simple-table v-if="!loading && props.items" :dense="$vuetify.breakpoint.smAndDown">
          <template #default>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Start Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in admins" :key="item.id + '_vue'">
                <td>{{ item.fullname }}</td>
                <td>{{ item.email }}</td>
                <td>
                  <v-chip small text-color="white" :color="findRoleByValue(item.role).color">
                    {{ findRoleByValue(item.role).label }}
                  </v-chip>
                </td>
                <td>{{ $dayjs(item.createdAt).format("DD.MM.YYYY") }}</td>
                <td>
                  <v-btn icon @click="launchDialog(2, item)">
                    <v-icon>fa-pencil-square-o</v-icon>
                  </v-btn>
                  <v-btn icon color="red" @click="launchDialog(3, item)">
                    <v-icon>fa-trash-o</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </template>
    </v-data-iterator>
  </div>
</template>

<script>
import Vue from "vue";
import Vuelidate, { validationMixin } from "vuelidate";
import { email, required } from "vuelidate/lib/validators";
import config from "../config";
import axios from "../utils/create-axios";
Vue.use(Vuelidate);
export default {
  mixins: { validationMixin },
  props: {
    admins: {
      type: Array,
      default: () => []
    }
  },
  validations() {
    const rules = {
      fullname: {
        required
      },
      email: {
        required,
        email
      }
    };
    if (this.flag === 1) {
      rules.raw_password = {
        required
      };
    }
    return rules;
  },
  data() {
    return {
      fullname: null,
      email: null,
      raw_password: null,
      role: config.roles[1],
      roles: config.roles,
      loading: false,
      dialog_one: false,
      dialog_two: false,
      saveAvailable: true,
      flag: 0,
      user_id: ""
    };
  },
  methods: {
    async handleFormSubmit() {
      const url = `${config.msLandingUrl}/user/crudUser`;
      let bodydata = {
        email: this.email,
        fullname: this.fullname,
        role: Object.prototype.hasOwnProperty.call(this.role, "value") ? this.role.value : 2,
        id: this.user_id,
        flag: this.flag,
        user: this.$auth.user,
        ip: sessionStorage.getItem("ip") ? sessionStorage.getItem("ip") : null
      };
      if (this.raw_password) {
        bodydata.password = this.raw_password;
      }
      const result = await axios.post(url, bodydata);
      if (result && result.data) {
        this.dialog_one = false;
        this.dialog_two = false;
        this.resetValues();
        this.$emit("refreshAdminList");
      }
    },
    async launchDialog(flag, item) {
      await this.resetValues();
      this.flag = flag;
      let temp = Object.assign({}, item);
      if (this.flag === 3) {
        this.user_id = temp.id;
        this.fullname = temp.fullname;
        this.email = temp.email;
        this.role = this.roles.find(r => r.value === temp.role);
        this.dialog_two = true;
      } else if (this.flag === 2) {
        this.user_id = temp.id;
        this.fullname = temp.fullname;
        this.email = temp.email;
        this.role = this.roles.find(r => r.value === temp.role);
        this.dialog_one = true;
      } else {
        this.dialog_one = true;
      }
    },
    saveUserInfo() {},
    findRoleByValue(value) {
      return this.roles.find(role => role.value === value);
    },
    resetValues() {
      this.fullname = null;
      this.email = null;
      this.role = config.roles[1];
      this.raw_password = null;
      this.$v.$reset();
    }
  }
};
</script>

<style lang="scss">
p {
  &.alert {
    color: red;
  }
}
</style>
