<template>
  <v-app>
    <h3>Add New template</h3>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field label="Template Name" v-model="templateName" required></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="defaulttemplateType"
          :items="templateType"
          item-text="label"
          item-value="value"
          auto-select-first
          label="Select Type"
        ></v-select>
      </v-col>
    </v-row>

    <v-row>
      <div style="margin:0px auto;">
        <editor
          :submit-callback="submitCallback"
          :defaultEditordata="defaultEditordata"
          :loading="loading"
          :templateName="templateName"
          :disableEditor="false"
        />
      </div>
    </v-row>
  </v-app>
</template>

<script>
import Vue from "vue";
import axios from "@/utils/create-axios";
import config from "@/config";
//import  newtemplate  from "@/components/templates/newtemplate";
import editor from "@/components/templates/editor";
// import contractTemplate from "@/static/contractTemplate";
// import NDATemplate from "@/static/NDATemplate";

//import adminslist from '../../components/adminslist';
export default {
  components: {
    //  newtemplate,
    editor
  },
  props: {
    method: { type: Function }
  },
  data() {
    return {
      loading: false,
      templateType: config.templatesType,
      defaulttemplateType: config.templatesType[0].value,
      templateName: "",
      defaultEditordata: null
    };
  },

  async mounted() {
    // this.defaultEditordata = contractTemplate.template;
    //this.$root.$emit('changeType',  this.defaultEditordata)
  },
  computed: {},
  methods: {
    async submitCallback(ediData) {
      const formData = {
        template_type: this.defaulttemplateType,
        template_name: this.templateName,
        template_content: ediData,
        created_by: this.$auth.user.id,
        modified_by: this.$auth.user.id,
        created_date: new Date(),
        modifed_date: new Date(),
        deleted_flag: 0,
        accepted_flag: 0
      };

      this.loading = true;
      try {
        this.errorSummary = null;
        const url = `${config.msLandingUrl}/templates/createtemplate`;
        const result = await axios.post(url, {
          ...formData
        });

        console.log(result);
        if (result && result.data) {
          this.$vuetify.goTo(0, {});
          if (result.data.errors) {
            this.errorSummary = parseApiError(result);
            this.loading = false;
            return;
          }
          this.successMessage = true;
          this.$nuxt.$router.replace("/manage/templates/list");
        }
      } catch (error) {
        this.errorSummary = parseApiError(error);
      }
      this.loading = false;
    },
    onchange() {
      // this.defaultEditordata =
      //   this.defaulttemplateType == 1
      //     ? contractTemplate.template
      //     : NDATemplate.template;
      // this.$root.$emit("changeType", this.defaultEditordata);
    }
  }
};
</script>
