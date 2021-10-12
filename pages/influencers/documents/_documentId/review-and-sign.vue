<template>
  <v-app>
    <contract-signed
      v-if="!loading && isSigned"
      :type="document.template.templateType == 2 ? 'NDA' : 'Contract'"
      :template-type="document.template.templateType"
    />
    <template v-if="!loading && !isSigned">
      <v-app-bar class="template2" dark color="#00b2e2" :clipped-left="true" fixed app>
        <v-container>
          <v-row align="center">
            <v-col cols="2">
              <nuxt-link to="/">
                <img src="/inf-admin/templateimages/lanistar-logo-white.png" alt="Lanistar Logo" width="150px" />
              </nuxt-link>
            </v-col>
            <v-col cols="8" align="center">
              <span> Please Enter Your Details Below </span>
            </v-col>
            <v-col cols="2">
              <v-btn dark depressed large :color="submitButtonAttrs.color" @click.prevent="handleSubmit">
                {{ submitButtonAttrs.label }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-app-bar>
      <v-main>
        <v-container class="py-10">
          <a id="pages-start"></a>
          <div v-for="(pg, index) in pageSlides" :key="`page-${index}`" class="page-container">
            <div
              v-if="hasCoverPage && pg.isCoverPage"
              id="cover-page"
              class="page elevation-8"
              v-html="coverPageHtml"
            ></div>
            <template-page
              v-if="!pg.isCoverPage"
              :page-header="pageHeader"
              :page-footer="pageFooter"
              :blocks="pg.blocks"
              :page-index="hasCoverPage ? index - 1 : index"
              :edit-mode="editMode"
            ></template-page>
          </div>
          <a id="pages-end" ref="pageEnd"></a>
        </v-container>
      </v-main>
      <!-- <pre>
      {{ recipientData }}
    </pre> -->
      <v-snackbar :value="error" :timeout="5000" bottom color="red">
        <span v-html="error"></span>
      </v-snackbar>
    </template>
    <div v-show="false">
      <document-renderer
        v-if="getRenderer"
        ref="documentRenderer"
        :documentId="$route.params.documentId"
        @load="onDocumentRendererLoad"
      ></document-renderer>
    </div>
  </v-app>
</template>

<script>
import config from "@/config";
import { mapActions } from "vuex";
import { debounce } from "lodash";
import globalMixins from "@/mixins/globals";
import TemplatePage from "@/components/templates/template-page";
import { EventBus } from "@/pages/event";
import ContractSigned from "@/components/verify/contractSigned.vue";
import DocumentRenderer from "@/components/templates/document-renderer";

export default {
  auth: false,
  name: "InfluencerDocumentsView",
  components: {
    TemplatePage,
    ContractSigned,
    DocumentRenderer
  },
  mixins: [globalMixins],
  layout: "blank",
  data() {
    return {
      documentId: null,
      currentRecipientId: null,
      document: null,
      loading: false,
      pagesCarousel: 0,
      editMode: false,
      error: null,
      isSigned: false,
      getRenderer: false,
      processIndicator: "start" // start, reviewing, has-errors ready
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
    submitButtonAttrs() {
      switch (this.processIndicator) {
        case "start":
          return {
            label: "Start",
            color: "blue"
          };
        case "has-errors":
          return {
            label: "Next",
            color: "red"
          };
        case "reviewing":
          return {
            label: "Next",
            color: "blue darken-3"
          };
        case "ready":
          return {
            label: "Finish",
            color: "green"
          };

        default:
          return {
            label: "Start",
            color: "blue"
          };
      }
    },
    pageSlides() {
      const slides = [...this.pages];
      if (this.hasCoverPage) {
        slides.unshift({
          isCoverPage: true
        });
      }
      return slides;
    },
    pages() {
      return this.$store.state["template-editor"].pages;
    },
    hasCoverPage() {
      return this.$store.state["template-editor"].hasCoverPage;
    },
    coverPageHtml() {
      return this.$store.state["template-editor"].coverPageHtml;
    },
    pageHeader() {
      return this.$store.state["template-editor"].pageHeaderHtml;
    },
    pageFooter() {
      return this.$store.state["template-editor"].pageFooterHtml;
    },
    recipientData() {
      return this.$store.state["template-editor"].recipientData;
    },
    templateVariablesData() {
      return this.$store.state["template-editor"].templateVariablesData;
    },
    currentRecipientData() {
      return this.recipientData.find(r => r.selectedRecipient.id === this.currentRecipientId);
    },
    validForSubmission() {
      return this.$store.getters["template-editor/validForSubmission"]();
    }
  },
  destroyed() {
    global.window.removeEventListener("scroll");
  },
  async created() {
    const { documentId } = this.$route.params;
    const { r: currentRecipientId } = this.$route.query;

    if (!documentId) {
      this.error = "Document id is missing";
      return;
    }
    if (!currentRecipientId) {
      this.error = "Recipient id is missing";
      return;
    }

    this.documentId = documentId;
    this.currentRecipientId = currentRecipientId;
    await this.getDocumentInfo();
    process.nextTick(() => {
      // TODO check document status etc ...
      if (this.document) {
        this.loadTemplateForInfluencer({
          template: this.document.template,
          influencer: this.document.influencer,
          recipientData: this.document.latestRecipientMetadata?.recipientData
        });
      }
    });
  },
  mounted() {
    global.window.addEventListener("scroll", debounce(this.handleScroll, 200));
  },
  methods: {
    ...mapActions({
      loadTemplateForInfluencer: "template-editor/loadTemplateForInfluencer"
    }),
    async getDocumentInfo() {
      this.loading = true;
      this.error = null;
      try {
        const docResult = await this.$templates2Service.findDocumentById(this.documentId);
        if (docResult.document) {
          this.document = docResult.document;
          this.checkSigned();
        }
      } catch (error) {
        if (error.response?.data?.errors) {
          this.error = error.response.data.errors[0].message;
        } else if (error.response?.data?.description) {
          this.error = error.response.data.description;
        }
      }
      this.loading = false;
    },
    async handleSubmit() {
      this.error = null;
      EventBus.$emit("sign-submit");
      if (!this.validForSubmission) {
        process.nextTick(() => {
          const allErrFields = this.$el.querySelectorAll(".has-error");
          if (allErrFields.length > 0) {
            allErrFields[0].focus({ preventScroll: true });
            allErrFields[0].scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
        this.error = "Please enter your details to related input before submit!";
        return;
      }
      this.loading = true;
      try {
        const result = await this.$templates2Service.saveRecipientData(this.documentId, {
          recipientData: this.currentRecipientData
        });
        this.getRenderer = result.isSignCompleted;
        this.isSigned = true;
      } catch (error) {
        if (error.response?.data?.errors) {
          this.error = error.response.data.errors[0].message;
        } else if (error.response?.data?.description) {
          this.error = error.response.data.description;
        }
      }
      this.loading = false;
    },
    onDocumentRendererLoad(documentId) {
      const documentHtml = this.$refs.documentRenderer.$el.outerHTML;
      const styleUrl = `${config.assetsUrl}/inf-admin/css/template2.css`;
      this.$templates2Service.saveDocument(documentId, {
        templateHtml: `<html><head><link href="${styleUrl}" rel="stylesheet" type="text/css"></head><body>${documentHtml}</body></html>`
      });
    },
    handleScroll() {
      if (!this.$refs["pageEnd"]) {
        return;
      }
      const currentScrollPos = global.window.scrollY;
      const outerHeight = global.window.outerHeight;
      const pageEndPos = this.$refs["pageEnd"].getBoundingClientRect().top;
      if (pageEndPos < outerHeight) {
        EventBus.$emit("sign-submit");
        process.nextTick(() => {
          this.processIndicator = this.validForSubmission ? "ready" : "has-errors";
        });
      } else if (currentScrollPos < 500) {
        this.processIndicator = "start";
      } else {
        this.processIndicator = "reviewing";
      }
    },
    checkSigned() {
      const currentRecipient = this.document.recipientMetadata.find(
        f => f.createdRecipientId == this.currentRecipientId
      );
      if (currentRecipient) this.isSigned = true;
    }
  }
};
</script>
