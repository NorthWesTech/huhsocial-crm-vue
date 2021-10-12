<template>
  <div class="pb-10">
    <h1 class="mb-2">Edit Document Template</h1>

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
                <template-recipients-manager
                  mode="template"
                  @onAddRecipient="addRecipientByType"
                  @on-change="
                    data => {
                      recipients = data;
                    }
                  "
                />
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
              <div class="page-info-inner">
                <span> Page: {{ `${hasCoverPage ? index : index + 1}` }} of {{ pages.length }} </span>
                <v-tooltip>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-if="pg.blocks.length === 0"
                      small
                      icon
                      color="red"
                      dark
                      depressed
                      v-bind="attrs"
                      v-on="on"
                      @click="pageToBeDeleted = pg"
                    >
                      <v-icon small>mdi-delete-circle</v-icon>
                    </v-btn>
                  </template>
                  <span>Remove this page</span>
                </v-tooltip>
              </div>
            </div>
            <template-page
              :page-header="pageHeader"
              :page-footer="pageFooter"
              :page-index="hasCoverPage ? index - 1 : index"
              :edit-mode="editMode"
            ></template-page>
          </div>
        </v-carousel-item>
      </v-carousel>

      <!-- <h2>Pages</h2>
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

    <v-dialog :value="pageToBeDeleted" max-width="290">
      <v-card>
        <v-card-title class="headline">Remove Page</v-card-title>
        <v-card-text>Are you sure to remove this page?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray" text @click="pageToBeDeleted = null">Cancel</v-btn>
          <v-btn color="red darken-1" text @click.stop="handleRemovePage">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar :value="errors.length > 0" :timeout="5000" bottom color="red">
      <span v-for="(err, erri) in errors" :key="`error-${erri}`">{{ err.message }}<br /></span>
    </v-snackbar>
    <v-snackbar :value="successMessage" :timeout="5000" bottom color="green">
      <span>{{ successMessage }}</span>
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
  name: "EditTemplate2",
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
      loading: false,
      id: null,
      editMode: true,
      activeTab: null,
      pagesCarousel: 0,
      addSheetVisible: false,
      pageToBeDeleted: null,
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
      errors: [],
      successMessage: null
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
  async created() {
    const { edit: id } = this.$route.params;
    if (!id) {
      this.$router.replace("/templates2");
      return;
    }
    this.id = id;
    await this.getTemplateInfo();
  },
  methods: {
    ...mapActions({
      addPage: "template-editor/addPage",
      removePage: "template-editor/removePage",
      addBlock: "template-editor/addBlock",
      initRecipientData: "template-editor/initRecipientData",
      addRecipient: "template-editor/addRecipient",
      clearState: "template-editor/clearState",
      setDocumentOption: "template-editor/setDocumentOption",
      setTemplateVariables: "template-editor/setTemplateVariables"
    }),
    async getTemplateInfo() {
      this.loading = true;
      this.clearState();
      try {
        const infoResult = await this.$templates2Service.findById(this.id);
        if (!infoResult || !infoResult?.template) {
          this.errors = [
            {
              message: "Template info could not be fetched!",
              code: 0,
              prop: null
            }
          ];
        } else {
          this.templateName = infoResult.template.name;
          this.templateType = infoResult.template.templateType;
          this.language = infoResult.template.language;
          this.hasCoverPage = infoResult.template.hasCoverPage;
          this.coverPageHtml = infoResult.template.coverPageHtml;
          this.pageHeader = infoResult.template.pageHeaderHtml;
          this.pageFooter = infoResult.template.pageFooterHtml;
          if (Array.isArray(infoResult.template.pages)) {
            infoResult.template.pages.forEach(p => {
              this.addPage(p);
            });
          }

          const initRecipientData = [];
          const shared = {
            phone: "+00 1112222333",
            addressLine1: "Flat 1, 14 Road Name",
            addressPostcode: "E12 34B",
            addressCity: "London",
            addressCountry: "United Kingdom"
          };
          if (Array.isArray(infoResult.template.recipients)) {
            infoResult.template.recipients.forEach(r => {
              switch (r.recipientType) {
                case "Ambassador":
                  initRecipientData.push({
                    selectedRecipient: r,
                    nickname: "Ambassador",
                    recipientName: "Ambassador Lastname",
                    email: "ambassador@example.com",
                    ...shared
                  });
                  break;
                case "Agency":
                  initRecipientData.push({
                    selectedRecipient: r,
                    nickname: "Agency",
                    recipientName: "Agency Owner",
                    email: "info@agency.com",
                    ...shared
                  });
                  break;
                case "Parent":
                  initRecipientData.push({
                    selectedRecipient: r,
                    nickname: "Parent",
                    recipientName: "Parent Lastname",
                    email: "parent@example.com",
                    ...shared
                  });
                  break;

                default:
                  initRecipientData.push({
                    selectedRecipient: r,
                    ...shared
                  });
                  break;
              }
              this.addRecipient(r);
            });
          }
          this.initRecipientData(initRecipientData);
        }
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
    addRecipientByType(type) {
      this.addRecipient({
        isCompany: false,
        recipientType: config.recipientTypes[type]
      });
    },
    pageSize(pageIndex) {
      return this.$store.getters["template-editor/pageSize"](pageIndex);
    },
    handleAddPage() {
      this.addPage();
      this.pagesCarousel = this.pages.length;
    },
    handleRemovePage() {
      this.removePage(this.pageToBeDeleted);
      process.nextTick(() => {
        this.pageToBeDeleted = null;
        this.successMessage = "Page has been removed";
      });
    },
    addBlockFromSheet(blockData) {
      const { pageIndex, ...rest } = blockData;
      this.addSheetVisible = false;
      // console.log(blockData);
      let finalPage = Number(pageIndex) || this.pages.length - 1;
      // console.log("finalPage 1 " + finalPage);

      if (finalPage < 1) {
        finalPage = this.pages.length - 1;
      }
      // console.log("finalPage 2 " + finalPage);
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
        await this.$templates2Service.update(this.id, this.postData);
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

.page-info {
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: -10px;

  .page-info-inner {
    width: 300px;
    background-color: #efefef;
    color: #333;
    font-size: 12px;
    border-radius: 10px;
    padding: 5px 10px;
    text-align: center;
  }
}
.add-sheet-button {
  height: 100%;
}
</style>
