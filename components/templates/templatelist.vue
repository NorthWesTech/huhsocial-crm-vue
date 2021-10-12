<template>
  <div>
    <v-btn v-if="$auth.user.role === 1" class="primary" @click="moveToCreate">
      Add New Template
      <v-icon>fa-pencil-square-o</v-icon>
    </v-btn>

    <v-data-iterator :items="templatesData" hide-default-footer>
      <template #header> </template>
      <template #no-data>
        <v-alert color="warning" class="pa-3" dense text>
          No templates have been found
        </v-alert>
      </template>
      <template #default="props">
        <v-progress-circular v-if="loading" :indeterminate="true"></v-progress-circular>
        <v-simple-table v-if="!loading && props.items" :dense="$vuetify.breakpoint.smAndDown">
          <template #default>
            <thead>
              <tr>
                <th>Template Name</th>
                <th>Type</th>
                <th>Created</th>
                <th>Last Updated</th>
                <!-- <th>Action</th> -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in templatesData" :key="item.template_id">
                <td>
                  {{ item.template_name }}
                </td>
                <td v-if="item.template_type == 1">
                  Contract
                </td>
                <td v-if="item.template_type == 2">
                  NDA
                </td>
                <td v-if="item.template_type == 3">
                  Term Sheet
                </td>
                <td v-if="item.template_type == 4">
                  Multiple Signed Contract
                </td>
                <td v-if="item.template_type == 5">
                  Void Contract
                </td>
                <td>
                  {{ convertDate(item.created_date) }}
                </td>
                <td>
                  {{ convertDate(item.modifed_date) }}
                </td>
                <td v-if="$auth.user.role == 0">
                  <v-btn icon link :to="{ name: 'manage-templates-edit', params: { edit: item.template_id } }">
                    <v-icon>fa-pencil-square-o</v-icon>
                  </v-btn>
                  <v-btn icon @click.stop="deleteCallback(item.template_id)">
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

Vue.use(Vuelidate);

export default {
  mixins: { validationMixin },
  props: {
    templatesData: Array,
    loading: Boolean,
    deleteCallback: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      //fullname: null,
      // email: null,
      //raw_password: null,
      //loading: false,
      //dialog_one: false,
      //dialog_two: false,
      //saveAvailable: true,
      //flag: 0,
      //user_id: ''
    };
  },
  async mounted() {
    // alert(this.templatesData);
  },
  methods: {
    moveToCreate() {
      this.$nuxt.$router.replace("/manage/templates/create");
    },
    convertDate(date) {
      let temp = new Date(date);
      return `${temp.getDate()}-${temp.getMonth() + 1}-${temp.getFullYear()} ${temp.getHours()}:${temp.getMinutes()}`;
    }
  }
};
</script>
