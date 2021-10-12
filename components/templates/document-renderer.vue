<template>
  <v-container>
    <a id="pages-start"></a>
    <div v-for="(pg, index) in pageSlides" :key="`page-${index}`" class="page-container">
      <div v-if="hasCoverPage && pg.isCoverPage" id="cover-page" class="page elevation-8" v-html="coverPageHtml"></div>
      <template-page
        v-if="!pg.isCoverPage"
        :page-header="pageHeader"
        :page-footer="pageFooter"
        :blocks="pg.blocks"
        :page-index="hasCoverPage ? index - 1 : index"
        :edit-mode="editMode"
      ></template-page>
    </div>
    <a id="pages-end"></a>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
import TemplatePage from "@/components/templates/template-page";

export default {
  components: {
    TemplatePage
  },
  props: ["documentId"],
  data() {
    return {
      document: null,
      loading: false,
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
    }
  },
  async created() {
    if (!this.documentId) {
      this.error = "Document id is missing";
      return;
    }

    await this.loadDocument();

    process.nextTick(() => {
      // TODO check document status etc ...
      if (this.document) {
        this.loadTemplateForInfluencer({
          template: this.document.template,
          influencer: this.document.influencer,
          recipientData: this.document.latestRecipientMetadata?.recipientData
        });

        this.$emit("load", this.documentId);
      }
    });
  },
  methods: {
    ...mapActions({
      loadTemplateForInfluencer: "template-editor/loadTemplateForInfluencer"
    }),
    async loadDocument() {
      this.loading = true;
      try {
        const docResult = await this.$templates2Service.findDocumentById(this.documentId);
        if (docResult.document) {
          this.document = docResult.document;
        }
      } catch (error) {
        this.$emit("error", error);
      }
      this.loading = false;
    }
  }
};
</script>

<style lang="scss">
.page-container {
  // width: 100% !important;
  width: 21cm !important;
  height: 29.7cm !important;

  .page {
    box-shadow: none !important;
    page-break-after: always;
    border: 1px solid #ccc;
  }
}
</style>
