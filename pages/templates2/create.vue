<template>
  <div class="pb-10">
    <h1 class="mb-2">Create New Document Template</h1>

    <div id="editor-area">
      <v-sheet color="white" elevation="3" class="mb-5 px-4 py-3">
        <v-tabs v-model="activeTab">
          <v-tab>General</v-tab>
          <v-tab v-if="hasCoverPage">Cover Page</v-tab>
          <v-tab>Page Header</v-tab>
          <v-tab>Page Footer</v-tab>
          <v-tab>Variables</v-tab>
        </v-tabs>

        <v-tabs-items v-model="activeTab">
          <v-tab-item ref="tab-general">
            <v-row>
              <v-col xs="12" md="6" lg="4">
                <template-recipients-manager mode="template" @onAddRecipient="addRecipientByType" />
                <v-divider class="mb-5"></v-divider>
                <v-row>
                  <v-col>
                    <v-btn block color="blue darken-2" outlined @click="handleAddPage">
                      <v-icon left>mdi-account-group</v-icon>
                      Add Page
                    </v-btn>
                  </v-col>
                  <v-col>
                    <v-btn
                      block
                      color="blue darken-2"
                      outlined
                      @click="
                        addBlockFromSheet({
                          blockType: 'editor',
                          whereTo: 'after',
                          pageIndex: hasCoverPage ? pagesCarousel - 1 : pagesCarousel
                        })
                      "
                    >
                      <v-icon left>mdi-format-color-text</v-icon>
                      Add Text
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-btn block color="blue darken-2" outlined @click="addSheetVisible = true">
                      <v-icon left>mdi-dots-horizontal</v-icon>
                      Add More...
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
              <v-col xs="12" md="6" lg="4">
                <v-card-title>General Settings</v-card-title>
                <v-list two-line flat>
                  <v-list-item>
                    <v-list-item-content>
                      <v-text-field
                        ref="templateName"
                        v-model="templateName"
                        placeholder="Please enter a name for template"
                        label="Template Name"
                        :rules="[rules.templateName.required]"
                        required
                        outlined
                      />
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-select
                        ref="templateType"
                        v-model="templateType"
                        small
                        :items="templateTypes"
                        :rules="[rules.templateType.required]"
                        item-text="label"
                        item-value="value"
                        label="Document Type"
                        outlined
                      />
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-select
                        ref="language"
                        v-model="language"
                        small
                        item-text="label"
                        item-value="value"
                        :items="languages"
                        :rules="[rules.language.required]"
                        label="Language"
                        outlined
                      />
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider class="mb-5"></v-divider>
                  <v-list-item>
                    <v-list-item-action>
                      <v-switch v-model="hasCoverPage"></v-switch>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Has Cover Page</v-list-item-title>
                      <v-list-item-subtitle>Is this template has a cover page?</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider class="mb-5"></v-divider>
                  <v-list-item>
                    <v-list-item-action>
                      <v-switch v-model="editMode"></v-switch>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Edit Mode</v-list-item-title>
                      <v-list-item-subtitle>Is edit mode active or not</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-tab-item>
          <v-tab-item v-if="hasCoverPage" ref="tab-cover-page">
            <div class="code-editor">
              <prism-editor
                id="cover-source-textarea"
                v-model="coverPageHtml"
                :highlight="highlighter"
                line-numbers
                language="markup"
              ></prism-editor>
            </div>
          </v-tab-item>
          <v-tab-item ref="tab-page-header">
            <div class="code-editor">
              <prism-editor
                id="header-source-textarea"
                v-model="pageHeader"
                :highlight="highlighter"
                line-numbers
                language="html"
              ></prism-editor>
            </div>
          </v-tab-item>
          <v-tab-item ref="tab-page-footer">
            <div class="code-editor">
              <prism-editor
                id="footer-source-textarea"
                v-model="pageFooter"
                :highlight="highlighter"
                line-numbers
                language="html"
              ></prism-editor>
            </div>
          </v-tab-item>
          <v-tab-item ref="tab-variables">
            <template-variables :template-data="templateVariablesData" />
          </v-tab-item>
        </v-tabs-items>
        <v-row>
          <v-col md="2">
            <v-btn block large elevation="0" :disabled="!isFormValid" class="primary" @click.prevent="handleSave">
              Save Template
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
              :get-page-data="d => (pages[index] = d)"
            ></template-page>
          </div>
        </v-carousel-item>
      </v-carousel>
      <!--
      <h2>Pages</h2>
      <pre>{{ pages }}</pre>
      <h2>Recipients</h2>
      <pre>{{ recipients }}</pre> -->
    </div>
    <a id="pages-end"></a>

    <template-add-component-sheet
      :visibility-indicator="addSheetVisible"
      :add-component-handler="addBlockFromSheet"
      :current-page-no="hasCoverPage ? pagesCarousel - 1 : pagesCarousel"
      @sheet-closed="() => (addSheetVisible = false)"
    />

    <v-snackbar :value="errors.length > 0" :timeout="5000" bottom color="red">
      <span v-for="(err, erri) in errors" :key="`error-${erri}`">{{ err.message }}<br /></span>
    </v-snackbar>
  </div>
</template>

<script>
import { PrismEditor } from "vue-prism-editor";
import { mapActions } from "vuex";
import { highlight, languages } from "prismjs/components/prism-core";

import globalMixins from "../../mixins/globals";
import TemplatePage from "../../components/templates/template-page";
import TemplateRecipientsManager from "../../components/templates/template-recipients-manager";
import TemplateVariables from "../../components/templates/template-variables";
import TemplateAddComponentSheet from "../../components/templates/template-add-component-sheet.vue";
import config from "@/config";

import "vue-prism-editor/dist/prismeditor.min.css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/themes/prism-tomorrow.css"; // import syntax highlighting styles

export default {
  name: "NewTemplate2",
  components: {
    PrismEditor,
    TemplatePage,
    TemplateRecipientsManager,
    TemplateVariables,
    TemplateAddComponentSheet
  },
  mixins: [globalMixins],
  data() {
    return {
      editMode: true,
      activeTab: null,
      pagesCarousel: 0,
      addSheetVisible: false,
      rules: {
        templateName: {
          required: value => !!value || "Template name is required."
        },
        language: {
          required: value => !!value || "Template language is required."
        },
        templateType: {
          required: value => !!value || "Template type is required."
        }
      },
      errors: []
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
    recipients() {
      return this.$store.state["template-editor"].recipients;
    },
    languages() {
      return this.$store.state["template-editor"].languages;
    },
    language: {
      get() {
        return this.$store.state["template-editor"].language;
      },
      set(val) {
        this.setDocumentOption({ propName: "language", val });
      }
    },
    templateTypes() {
      return this.$store.state["template-editor"].templateTypes;
    },
    templateType: {
      get() {
        return this.$store.state["template-editor"].templateType;
      },
      set(val) {
        this.setDocumentOption({ propName: "templateType", val });
      }
    },
    templateName: {
      get() {
        return this.$store.state["template-editor"].templateName;
      },
      set(val) {
        this.setDocumentOption({ propName: "templateName", val });
      }
    },
    hasCoverPage: {
      get() {
        return this.$store.state["template-editor"].hasCoverPage;
      },
      set(val) {
        this.setDocumentOption({ propName: "hasCoverPage", val });
      }
    },
    coverPageHtml: {
      get() {
        return this.$store.state["template-editor"].coverPageHtml;
      },
      set(val) {
        this.setDocumentOption({ propName: "coverPageHtml", val });
      }
    },
    pageHeader: {
      get() {
        return this.$store.state["template-editor"].pageHeaderHtml;
      },
      set(val) {
        this.setDocumentOption({ propName: "pageHeaderHtml", val });
      }
    },
    pageFooter: {
      get() {
        return this.$store.state["template-editor"].pageFooterHtml;
      },
      set(val) {
        this.setDocumentOption({ propName: "pageFooterHtml", val });
      }
    },
    templateVariablesData() {
      return this.$store.state["template-editor"].templateVariablesData;
    },
    isFormValid() {
      const recipientsIsMissing = this.recipients.length < 2;
      return !(recipientsIsMissing || !this.templateName || !this.templateType || !this.language);
    },
    postData() {
      return {
        pages: this.pages,
        recipients: this.recipients,
        name: this.templateName,
        language: this.language,
        templateType: this.templateType,
        hasCoverPage: this.hasCoverPage,
        coverPageHtml: this.coverPageHtml,
        pageHeaderHtml: this.pageHeader,
        pageFooterHtml: this.pageFooter
      };
    }
  },
  watch: {
    hasCoverPage() {
      this.pagesCarousel = 0;
    }
  },
  mounted() {
    this.pageHeader = `
      <header class="page-header">&nbsp;</header>
    `;
    this.pageFooter = `
      <style>
        .page-footer {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          padding: 20px 60px;
          justify-self: flex-end;
          border-top: 2px solid #00b2e2;
        }
        .page-footer h5 {
          margin-top: 0;
          margin-bottom: 0;
        }
        .page-footer p {
          font-size: 13px;
          margin-top: 0;
          margin-bottom: 5px;
        }
        .page-footer .logo-wrapper {
          width: 45%;
        }
        .page-footer .logo-wrapper img {
          width: 200px;
        }
        .page-footer .address-wrapper {
          width: 30%;
        }
        .page-footer .contact-wrapper {
          width: 25%;
        }
      </style>
      <footer class="page-footer">
        <div class="logo-wrapper">
          <img src="https://www.justgetvisible.com/static/templateimages/logo-black.png" />
        </div>
        <div class="address-wrapper">
          <h5>LANISTAR LIMITED</h5>
          <p>Sovereign House, 361 King St,</p>
          <p>Hammersmith, London W6 9NA</p>
        </div>
        <div class="contact-wrapper">
          <p><strong>owners@iamlanistar.com</strong></p>
          <p><strong>www.iamlanistar.com</strong></p>
        </div>
      </footer>
    `;
    this.coverPageHtml = `
      <header>
        <h2>LANISTAR EXAMPLE CONTRACT TITLE</h2>
      </header>
    `;
    this.clearState();
    this.addRecipient({
      person: "Gurhan Kiziloz",
      nickname: "Lanistar",
      isCompany: true,
      companyInfo:
        "<strong>LANISTAR LIMITED</strong>, a company incorporated in England and Wales with company number 12091938 whose registered address is at 361 King Street, London, England, W6 9NA",
      email: "gurhan@lanistar.com",
      personToBeSigned: false,
      phone: "+44 7926476904",
      recipientType: config.recipientTypes.Lanistar
    });
    // this.addRecipient({
    //   person: `${this.templateVariablesData.influencer.firstName} ${this.templateVariablesData.influencer.lastName}`,
    //   nickname: "Ambassador",
    //   isCompany: false,
    //   email: this.templateVariablesData.influencer.email,
    //   phone: this.templateVariablesData.influencer.phone,
    //   personToBeSigned: true
    // });
    this.addRecipient({
      isCompany: false,
      recipientType: config.recipientTypes.Ambassador
    });
    this.initRecipientData();
    this.setTemplateVariables({
      currentDate: this.currentDate,
      influencer: {
        firstName: "Maj",
        lastName: "Rahman",
        fullName: "Maj Rahman",
        email: "maj.rahman@lanistar.com",
        phone: "+00 5554444666",
        contractValue: 500000,
        contractShares: 200
      }
    });

    this.addPage();
    this.addPage();
    this.addBlock({
      pageIndex: 0,
      blockType: "title"
    });
  },
  methods: {
    ...mapActions({
      addPage: "template-editor/addPage",
      addBlock: "template-editor/addBlock",
      initRecipientData: "template-editor/initRecipientData",
      addRecipient: "template-editor/addRecipient",
      clearState: "template-editor/clearState",
      setDocumentOption: "template-editor/setDocumentOption",
      setTemplateVariables: "template-editor/setTemplateVariables"
    }),
    pageSize(pageIndex) {
      return this.$store.getters["template-editor/pageSize"](pageIndex);
    },
    handleAddPage() {
      this.addPage();
      this.pagesCarousel = this.pages.length;
    },
    addRecipientByType(type) {
      this.addRecipient({
        isCompany: false,
        recipientType: config.recipientTypes[type]
      });
    },
    addBlockFromSheet(blockData) {
      const { pageIndex, ...rest } = blockData;
      this.addSheetVisible = false;
      console.log(blockData);
      let finalPage = Number(pageIndex) || this.pages.length - 1;
      console.log("finalPage 1 " + finalPage);

      if (finalPage < 1) {
        finalPage = this.pages.length - 1;
      }
      console.log("finalPage 2 " + finalPage);

      this.addBlock({
        ...rest,
        pageIndex: finalPage
      });

      this.pagesCarousel = finalPage + 1; // (including cover)
      this.$vuetify.goTo("#pages-start", {
        duration: 700,
        offset: 0,
        easing: "easeOutQuint"
      });
    },
    highlighter(code) {
      return highlight(
        code,
        {
          ...languages.markup,
          ...languages.css
        },
        "markup"
      );
    },
    async handleSave() {
      this.errors = [];
      if (!this.isFormValid) {
        return;
      }
      try {
        await this.$templates2Service.create(this.postData);
        setTimeout(() => {
          this.$router.push(`/templates2`);
        }, 1000);
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
    }
  }
};
</script>
<style lang="scss">
.code-editor {
  background-color: #272822;
  color: #fff;

  textarea {
    outline: none;
    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 14px;
    line-height: 1.5;
    padding: 5px;
  }
}

.add-sheet-button {
  height: 100%;
}
</style>
