<template>
  <v-layout column>
    <v-sheet v-if="warningMessage">
      <v-alert type="warning">
        {{ warningMessage }}
      </v-alert>
    </v-sheet>

    <v-card class="elevation-0 mb-3">
      <v-card-title> Edit Template </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field outlined dense label="Template Name" v-model="inftemplateName" required></v-text-field>
          </v-col>
        </v-row>

        <v-row justify="start" v-if="!showCCForm">
          <v-col cols="12" md="2">
            <v-btn small bottom @click="showCCForm = true">
              <v-icon left dark>mdi-account-plus</v-icon>
              Add CC</v-btn
            >
          </v-col>
        </v-row>
        <v-row v-if="showCCForm">
          <v-col cols="12" md="6">
            <v-text-field v-model="ccEmail" outlined dense label="CC" prepend-icon="mdi-card-account-mail">
              <template v-slot:append-outer>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon @click="showCCForm = false">
                      <v-icon color="grey lighten-1" v-bind="attrs" v-on="on">mdi-close-circle</v-icon>
                    </v-btn>
                  </template>
                  <span>Remove CC</span>
                </v-tooltip>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card class="elevation-0 ">
      <v-card-title>
        Template Details
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="12">
            <editor
              :defaulttemplateType="defaulttemplateType"
              :loading="loading"
              :templateName="inftemplateName"
              :defaultEditordata="templateContent"
              :submit-callback="submitCallback"
              :disableEditor="false"
              :hideToolbar="false"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script>
import Vue from "vue";
import axios from "@/utils/create-axios";
import config from "@/config";
import parseApiError from "@/utils/parse-api-error";
import editor from "@/components/templates/editor";
import ContractValue from "@/components/ContractValue.vue";

export default {
  components: {
    editor,
    ContractValue
  },
  props: {
    method: { type: Function }
  },
  data() {
    return {
      loading: false,
      templatesData: [],
      templateNames: null,
      warningMessage: null,
      influencerInfo: null,
      templateTypeName: null,
      templatesDefaultItem: "",
      templatesItems: [],
      templateContent: null,
      templateName: "",
      inftemplateName: "",
      defaulttemplateType: null,
      labelName: null,
      inftemplateId: null,
      showCCForm: false,
      ccEmail: ""
    };
  },

  async mounted() {
    const { influencerId } = this.$route.params;

    if (!influencerId) {
      this.warningMessage = "Influencer id or Template type is missing";
      return;
    }

    this.inftemplateId = influencerId;
    await this.getInfluencersTemplateById();
  },
  computed: {},
  methods: {
    async getInfluencersTemplateById() {
      this.loading = true;
      try {
        this.errorSummary = null;

        const url = `${config.msLandingUrl}/templates/getInfluencersTemplateById/${this.inftemplateId}`;
        const result = await axios.get(url);
        if (result && result.data) {
          if (result.data.errors) {
            this.errorSummary = parseApiError(result);
            this.loading = false;
            return;
          }
          this.templateContent = result.data.influencer_template_content;
          this.templateName = result.data.influencer_template_name;
          this.defaulttemplateType = result.data.template_type;
          this.inftemplateName = result.data.influencer_template_name;
          this.$root.$emit("changeType", this.templateContent);
        }
      } catch (error) {
        this.errorSummary = parseApiError(error);
      }
      this.loading = false;
    },
    submitCallback(newTemplateContent) {
      this.saveInfluencerTemplate(newTemplateContent);
    },
    async saveInfluencerTemplate(newTemplateContent) {
      const data = {
        influencer_templates_id: this.inftemplateId,
        modified_date: new Date(),
        influencer_template_name: this.inftemplateName,
        influencer_template_content: newTemplateContent,
        modified_by: this.$auth.user.id,
        cc_email: this.ccEmail
      };

      this.loading = true;

      try {
        this.errorSummary = null;
        const url = `${config.msLandingUrl}/templates/updateInfluencerTemplate`;
        const result = await axios.post(url, {
          ...data
        });

        if (result && result.data) {
          if (result.data.errors) {
            this.errorSummary = parseApiError(result);
            this.loading = false;
            return;
          }
          if (result.data.influencer_id) {
            this.$nuxt.$router.replace(`/influencers/profile/${result.data.influencer_id}`);
          }
        }
      } catch (error) {
        this.errorSummary = parseApiError(error);
      }
      this.loading = false;
    }
  }
};
</script>
<style lang="scss">
.v-main__wrap {
  background: #f5f5f5;
}
.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.influencer-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  grid-gap: 1rem;
}

.v-input__append-outer {
  margin-left: 0 !important;
  margin-top: 0 !important;
}
</style>
