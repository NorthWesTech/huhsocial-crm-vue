<template>
  <v-app>
    <h3>Edit New template</h3>
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field label="Template Name" v-model="templateName" required></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field label="Template Type" v-model="templateType" v-bind:readonly="true"></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <div style="margin:0px auto;">
        <editor
          :submit-callback="submitCallback"
          :defaultEditordata="defaultEditordata"
          :loading="loading"
          :templateName="templateName"
          :defaulttemplateType="defaulttemplateType"
        />
      </div>
    </v-row>
  </v-app>
</template>

<script>
import axios from "@/utils/create-axios";
import config from "@/config";
import editor from "@/components/templates/editor";
import parseApiError from "@/utils/parse-api-error";
export default {
  components: {
    editor
  },
  props: {
    method: { type: Function }
  },
  data() {
    return {
      loading: false,
      templateType: null,
      templateName: "",
      defaultEditordata: null,
      templateid: null,
      defaulttemplateType: null,
      createdBy: null,
      createdDate: null
    };
  },
  async mounted() {
    const { edit } = this.$route.params;
    if (!edit) {
      return;
    }

    this.getTemplate(edit);
  },
  methods: {
    async getTemplate(edit) {
      this.loading = true;
      try {
        this.errorSummary = null;

        const url = `${config.msLandingUrl}/templates/templatebyid/${edit}`;
        const result = await axios.get(url);

        if (result && result.data) {
          if (result.data.errors) {
            this.errorSummary = parseApiError(result);
            this.loading = false;
            return;
          }

          this.templateName = result.data.template_name;
          if (result.data.template_type == 1) {
            this.templateType = "Contract";
          }
          if (result.data.template_type == 2) {
            this.templateType = "NDA";
          }
          if (result.data.template_type == 3) {
            this.templateType = "Term Sheet";
          }
          if (result.data.template_type == 4) {
            this.templateType = "Multiple Signed";
          }
          // this.templateType = ( result.data.template_type == 1) ? "Contract" : "NDA";
          this.defaulttemplateType = result.data.template_type;
          this.defaultEditordata = result.data.template_content;
          this.createdBy = result.data.created_by;
          this.createdDate = result.data.created_date;
          this.templateid = result.data.template_id;
          this.$root.$emit("changeType", this.defaultEditordata);
        }
      } catch (error) {
        this.errorSummary = parseApiError(error);
      }
      this.loading = false;
    },
    async submitCallback(ediData) {
      const data = {
        template_type: this.defaulttemplateType,
        template_name: this.templateName,
        template_content: ediData,
        modified_by: this.$auth.user.id,
        modifed_date: new Date(),
        deleted_flag: 0,
        accepted_flag: 0,
        template_id: this.templateid,
        created_by: this.createdBy,
        created_date: this.createdDate
      };

      this.loading = true;
      try {
        this.errorSummary = null;
        const url = `${config.msLandingUrl}/templates/edittemplate`;
        const result = await axios.post(url, {
          ...data
        });

        if (result && result.data) {
          if (result.data.errors) {
            this.errorSummary = parseApiError(result);
            this.loading = false;
            return;
          }
          this.$nuxt.$router.replace("/manage/templates/list");
        }
      } catch (error) {
        this.errorSummary = parseApiError(error);
      }
      this.loading = false;
    },
    templateContract() {
      return "<h1>This Is Contract template</h1>";
    },
    templateNda() {
      return "<h1>This Is NDA template</h1>";
    }
  }
};
</script>
