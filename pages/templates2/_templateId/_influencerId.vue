<template>
  <div class="pb-10">
    <v-row>
      <v-col md="9">
        <h1 class="mb-2">New Contract</h1>
      </v-col>
    </v-row>
    <v-sheet color="white" elevation="3" class="mb-5 px-4 py-3">
      <v-tabs v-model="activeTab">
        <v-tab>General</v-tab>
        <v-tab>Variables</v-tab>
      </v-tabs>

      <v-tabs-items v-model="activeTab">
        <v-tab-item ref="tab-general">
          <v-row>
            <v-col>
              <template-recipients-manager mode="contract" />
            </v-col>
            <v-col> </v-col>
          </v-row>
        </v-tab-item>
        <v-tab-item ref="tab-general">
          <template-variables :template-data="templateVariablesData" />
        </v-tab-item>
      </v-tabs-items>
      <v-row>
        <v-col md="12">
          <v-btn
            large
            elevation="0"
            :loading="loading"
            :disabled="!loading && !isFormValid"
            class="primary"
            @click.prevent="handleSave"
          >
            Save Contract
          </v-btn>
          <v-btn
            large
            elevation="0"
            :disabled="!loading && !isFormValid"
            dark
            class="green"
            @click.prevent="handleSaveAndSend"
          >
            Save &amp; Send Contract
          </v-btn>
        </v-col>
      </v-row>
    </v-sheet>

    <a id="pages-start"></a>
    <v-carousel v-model="pagesCarousel" light :continuous="false" height="1400">
      <v-carousel-item v-for="(pg, index) in pageSlides" :key="`page-${index}`">
        <div v-if="hasCoverPage && pg.isCoverPage" class="page-container">
          <div id="cover-page" class="page elevation-8" v-html="coverPageHtml"></div>
        </div>
        <div v-if="!pg.isCoverPage" class="page-container">
          <div class="page-info">
            <div class="page-info-inner">Page: {{ `${hasCoverPage ? index : index + 1}` }} of {{ pages.length }}</div>
          </div>
          <template-page
            :page-header="pageHeader"
            :page-footer="pageFooter"
            :blocks="pg.blocks"
            :page-index="hasCoverPage ? index - 1 : index"
            :edit-mode="editMode"
          ></template-page>
        </div>
      </v-carousel-item>
    </v-carousel>
    <a id="pages-end"></a>

    <v-snackbar :value="errors.length > 0" :timeout="5000" bottom color="red">
      <span v-for="(err, erri) in errors" :key="`error-${erri}`">{{ err.message }}<br /></span>
    </v-snackbar>
    <v-snackbar :value="successMessage" :timeout="5000" bottom color="green">
      <span v-html="successMessage"></span>
    </v-snackbar>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

import globalMixins from "@/mixins/globals";
import TemplatePage from "@/components/templates/template-page";
import TemplateRecipientsManager from "@/components/templates/template-recipients-manager";
import TemplateVariables from "@/components/templates/template-variables";

export default {
  name: "Templates2CreateInfluencerContract",
  components: {
    TemplatePage,
    TemplateRecipientsManager,
    TemplateVariables
  },
  mixins: [globalMixins],
  data() {
    return {
      loading: false,
      activeTab: 0,
      pagesCarousel: 0,
      errors: [],
      successMessage: null,
      templateId: null,
      influencerId: null,
      influencer: null,
      template: null,
      editMode: false
    };
  },
  head: {
    //...
    link: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&amp;display=swap"
      }
    ]
  },
  computed: {
    pageSlides() {
      const slides = [...this.pages];
      if (this.hasCoverPage) {
        slides.unshift({
          isCoverPage: true
        });
      }
      return slides;
    },
    ...mapState({
      pages: state => state["template-editor"].pages,
      recipients: state => state["template-editor"].recipients,
      templateTypes: state => state["template-editor"].templateTypes,
      templateType: state => state["template-editor"].templateType,
      templateName: state => state["template-editor"].templateName,
      hasCoverPage: state => state["template-editor"].hasCoverPage,
      coverPageHtml: state => state["template-editor"].coverPageHtml,
      pageHeader: state => state["template-editor"].pageHeaderHtml,
      pageFooter: state => state["template-editor"].pageFooterHtml,
      templateVariablesData: state => state["template-editor"].templateVariablesData
    }),
    isFormValid() {
      const recipientsIsMissing = this.recipients.length < 2;
      return !recipientsIsMissing;
    },
    postData() {
      return {
        recipients: this.recipients
      };
    }
  },
  async created() {
    const { templateId, influencerId } = this.$route.params;
    if (!templateId) {
      this.$router.replace("/templates2");
      return;
    }
    this.templateId = templateId;
    if (!influencerId) {
      this.$router.replace("/influencers");
      return;
    }
    this.influencerId = influencerId;
    await this.getInfluencer();
    await this.getTemplate();
    process.nextTick(() => {
      if (this.influencer && this.template) {
        this.loadTemplateForInfluencer({ template: this.template, influencer: this.influencer });
      }
    });
  },
  methods: {
    ...mapActions({
      loadTemplateForInfluencer: "template-editor/loadTemplateForInfluencer"
    }),
    async getInfluencer() {
      this.loading = true;
      try {
        const influencerResult = await this.$influencerService.info(this.influencerId);
        this.influencer = influencerResult.profileInfo;
      } catch (error) {
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors;
        } else if (error.response?.data?.description) {
          this.errors = [
            {
              message: error.response.data.description,
              code: error.response.data.code,
              prop: null
            }
          ];
        }
      }
      this.loading = false;
    },
    async getTemplate() {
      this.loading = true;
      try {
        const templateResult = await this.$templates2Service.findById(this.templateId);
        this.template = templateResult.template;
      } catch (error) {
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors;
        } else if (error.response?.data?.description) {
          this.errors = [
            {
              message: error.response.data.description,
              code: error.response.data.code,
              prop: null
            }
          ];
        }
      }
      this.loading = false;
    },
    async saveDoc() {
      this.successMessage = null;
      this.loading = true;
      let result = false;
      try {
        await this.$templates2Service.saveForInfluencer(this.influencerId, this.templateId, this.postData);
        this.successMessage = "Document successfully saved for the influencer.";
        result = true;
      } catch (error) {
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors;
        } else if (error.response?.data?.description) {
          this.errors = [
            {
              message: error.response.data.description,
              code: error.response.data.code,
              prop: null
            }
          ];
        }
      }
      this.loading = false;
      return result;
    },
    async handleSave() {
      const result = await this.saveDoc();
      if (result) {
        setTimeout(() => {
          this.$router.push({
            name: "influencers-profile-id",
            params: { id: this.influencerId }
          });
        }, 1000);
      }
    },
    async handleSaveAndSend() {
      const result = await this.saveDoc();
      // TODO send contract
      if (result) {
        setTimeout(() => {
          this.$router.push({
            name: "influencers-profile-id",
            params: { id: this.influencerId }
          });
        }, 1000);
      }
    }
  }
};
</script>
