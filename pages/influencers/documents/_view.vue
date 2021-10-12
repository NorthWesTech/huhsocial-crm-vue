<template>
  <div class="pb-10">
    <h1 class="mb-2">View Document</h1>

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

    <v-snackbar :value="error" :timeout="5000" bottom color="red">
      <span v-html="error"></span>
    </v-snackbar>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import globalMixins from "@/mixins/globals"
import TemplatePage from "@/components/templates/template-page";

export default {
  name: "InfluencerDocumentsView",
  components: {
    TemplatePage
  },
  mixins: [globalMixins],
  data() {
    return {
      documentId: null,
      document: null,
      loading: false,
      pagesCarousel: 0,
      editMode: false,
      error: null
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
    },
    templateVariablesData() {
      return this.$store.state["template-editor"].templateVariablesData;
    }
  },
  async created() {
    const { view: id } = this.$route.params;
    if (!id) {
      this.error = "Document id is missing";
      return;
    }
    this.documentId = id;
    await this.getDocumentInfo();
    process.nextTick(() => {
      if (this.document) {
        this.loadTemplateForInfluencer({ template: this.document.template, influencer: this.document.influencer });
      }
    });
  },
  methods: {
    ...mapActions({
      loadTemplateForInfluencer: "template-editor/loadTemplateForInfluencer"
    }),
    async getDocumentInfo() {
      this.loading = true;

      try {
        const docResult = await this.$templates2Service.findDocumentById(this.documentId);
        if (docResult.document) {
          this.document = docResult.document;
        }
      } catch (error) {
        if (error.response?.data?.errors) {
          this.error = error.response.data.errors[0].message;
        } else if (error.response?.data?.description) {
          this.error = error.response.data.description;
        }
      }
      this.loading = false;
    }
  }
};
</script>
