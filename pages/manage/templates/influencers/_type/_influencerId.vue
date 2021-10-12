<template>
  <v-layout column>
    <v-sheet v-if="warningMessage">
      <v-alert type="warning">
        {{ warningMessage }}
      </v-alert>
    </v-sheet>
    <v-card class="elevation-0 mb-3" style="background: transparent">
      <v-card-text>
        <div class="template-header">
          <h2 style="color: #000">New {{ templateTypeName }}</h2>
          <div class="influencer-info">
            <div v-if="influencerInfo">
              Influencer:
              <v-chip
                color="primary"
                dark
                @click="
                  $router.push({
                    name: 'influencers-profile-id',
                    params: { id: influencerInfo.influencerId }
                  })
                "
              >
                {{ influencerInfo.firstName }} {{ influencerInfo.lastName }}
              </v-chip>
            </div>
            <div v-if="influencerInfo && influencerInfo.contractValue">
              Contract Value:
              <contract-value
                :value="influencerInfo.contractValue"
                :show-label="false"
                @click="
                  $router.push({
                    name: 'influencers-edit-id',
                    params: { id: influencerInfo.influencerId }
                  })
                "
              />
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <v-card class="elevation-2 mb-3" v-if="influencerInfo">
      <v-card-title> {{ templateTypeName }} Details</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field outlined dense :label="labelName" v-model="inftemplateName" required></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              outlined
              dense
              v-model="templatesDefaultItem"
              :items="templatesItems"
              item-text="label"
              item-value="value"
              label="Template Names"
              auto-select-first
              @change="onchange"
            ></v-select>
          </v-col>
        </v-row>
        <v-row justify="start" v-if="!showCCForm">
          <v-col cols="12">
            <v-btn small bottom @click="showCCForm = true">
              <v-icon left dark>mdi-account-plus</v-icon>
              Add CC
            </v-btn>
            <v-btn small bottom @click="showAttachments = true" class="ml-2" v-if="templatetype == 5">
              <v-icon left dark>mdi-attachment</v-icon>
              Add Attachment
            </v-btn>
            <v-chip v-if="attachment" close @click:close="attachment = null">{{ attachment.fileName }}</v-chip>

            <!-- <pre>
              {{ attachment }}
            </pre> -->
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
        <v-row v-if="showRecipients">
          <recipients v-model="recipients" />
        </v-row>
      </v-card-text>
    </v-card>
    <v-skeleton-loader v-if="loading" class="mx-auto" style="width: 100%" type="card"></v-skeleton-loader>
    <v-card v-if="!loading">
      <v-card-title> Template Details</v-card-title>
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

    <v-dialog v-model="showAttachments" persistent scrollable max-width="70%" @click:outside="showAttachments = false">
      <FilesForm
        ref="filesForm"
        :influencer-id="influencerId"
        selectable="true"
        @close="showAttachments = false"
        @select="selectFile"
      />
    </v-dialog>
  </v-layout>
</template>

<script>
import axios from "@/utils/create-axios";
import config from "@/config";
import parseApiError from "@/utils/parse-api-error";
import editor from "@/components/templates/editor";
import recipients from "@/components/templates/recipients.vue";
import ContractValue from "@/components/ContractValue.vue";
import helper from "@/utils/helper.js";
import FilesForm from "@/components/influencer/FilesForm.vue";

export default {
  components: {
    editor,
    recipients,
    ContractValue,
    FilesForm
  },
  props: {
    method: { type: Function }
  },
  data() {
    return {
      influencerId: "",
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
      influencerName: null,
      influencerEmail: null,
      influencerTelephone: null,
      currentDate: this.getcurrentDate(),
      companySignature: config.companySignature,
      showRecipients: false,
      showCCForm: false,
      recipients: [],
      ccEmail: "",
      contractValue: "",
      contractShares: 0,
      fee: 0,
      instagram: "",
      email: "",
      terminationDate: "",
      showAttachments: false,
      attachment: null
    };
  },
  async mounted() {
    const { type } = this.$route.params;
    const { influencerId } = this.$route.params;

    this.defaulttemplateType = type;

    if (!influencerId || !type) {
      this.warningMessage = "Influencer id or Template type is missing";
      return;
    }
    if (type == 1) {
      this.templateTypeName = "Contract";
    }
    if (type == 2) {
      this.templateTypeName = "NDA";
    }
    if (type == 3) {
      this.templateTypeName = "Term Sheet";
    }
    if (type == 4) {
      this.templateTypeName = "Multiple Signed Contract";
      this.showRecipients = true;
    }
    if (type == 5) {
      this.templateTypeName = "Void Contracts";
    }
    //this.templateTypeName = (type == 1) ? 'Contract' : 'NDA';
    this.labelName = `${this.templateTypeName}   Name`;
    this.influencerId = influencerId;
    this.templatetype = type;
    await this.getInfluencerInfo();
    await this.getTemplatesByType();
    /*if(this.templatesDefaultItem) {
          this.getTemplate();
    }else {
       this.warningMessage = 'NDA templates not found.'
    }*/
  },
  methods: {
    getcurrentDate() {
      let temp = new Date();
      return `${temp.getDate()}-${temp.getMonth() + 1}-${temp.getFullYear()}`;
    },
    async getInfluencerInfo() {
      this.loading = true;
      try {
        const result = await this.$influencerService.info(this.influencerId);
        if (result) {
          this.influencerInfo = result.profileInfo;
          this.influencerName = `${this.influencerInfo.firstName} ${this.influencerInfo.lastName}`;
          this.influencerEmail = this.influencerInfo.email;
          this.influencerTelephone = this.influencerInfo.phoneNumber;
          this.inftemplateName = this.influencerName;
          this.contractValue = this.influencerInfo.contractValue.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          this.contractShares = (this.influencerInfo.contractValue / 12.5)
            .toString()
            .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          this.fee = (this.influencerInfo.contractValue / 12.5) * 0.01;
          this.instagram = this.influencerInfo.instagram;
          this.email = this.influencerInfo.email;
          this.terminationDate = this.$dayjs()
            .add(14, "days")
            .format("DD-MM-YYYY");
        }
      } catch (error) {
        this.warningMessage = parseApiError(error);
      }
      this.loading = false;
    },
    async getTemplatesByType() {
      this.loading = true;

      try {
        const url = `${config.msLandingUrl}/templates/getTemplatesByType/${this.templatetype}`;
        const result = await axios.get(url);
        if (result && result.data && result.data.length > 0) {
          this.templatesData = result.data;

          this.templatesData.forEach(element => {
            const options = {
              label: element.template_name,
              value: element.template_id,
              order: 1
            };
            if (this.templatetype == 1 && element.template_lang === this.influencerInfo.languageSpoken) {
              options.order = 0;
              this.templatesDefaultItem = options.value;
            }
            this.templatesItems.push(options);
          });

          if (this.templatetype == 1 && !this.templatesDefaultItem) {
            this.templatesDefaultItem = this.templatesData.find(
              template => template.template_name == "Influencer Contract"
            ).template_id;
          }

          this.templatesItems = this.templatesItems.sort((a, b) => a.order - b.order);

          this.getTemplate();
        } else {
          this.warningMessage = `${this.templateTypeName} templates not found.`;
        }
      } catch (error) {
        this.warningMessage = parseApiError(error);
      }
      this.loading = false;
    },
    onchange() {
      this.getTemplate();
    },
    async getTemplate() {
      this.loading = true;
      try {
        this.errorSummary = null;

        const url = `${config.msLandingUrl}/templates/templatebyid/${this.templatesDefaultItem}`;
        const result = await axios.get(url);

        if (result && result.data) {
          if (result.data.errors) {
            this.errorSummary = parseApiError(result);
            this.loading = false;
            return;
          }

          this.templateContent = this.changeEditorContent(result.data.template_content);
          this.templateName = result.data.template_name;
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
      if (this.templatetype == 4) {
        this.saveInfluencerTemplateForRecipients(newTemplateContent);
        return;
      }

      const data = {
        influencer_id: this.influencerId,
        template_id: this.templatesDefaultItem,
        status_flag: 0,
        modified_by: this.$auth.user.id,
        template_type: this.templatetype,
        modified_date: new Date(),
        assign_to_influencer: true,
        influencer_template_name: this.inftemplateName,
        influencer_template_content: newTemplateContent,
        cc_email: this.ccEmail,
        is_active: true,
        attachment: this.attachment ? this.attachment.id : ""
      };

      this.loading = true;

      try {
        this.errorSummary = null;
        const url = `${config.msLandingUrl}/templates/saveInfluencerTemplate`;
        const result = await axios.post(url, {
          ...data
        });

        if (result && result.data) {
          if (result.data.errors) {
            this.errorSummary = parseApiError(result);
            this.loading = false;
            return;
          }

          const tab = this.templatetype == 5 ? "void" : "contract";

          this.$nuxt.$router.replace(`/influencers/profile/${this.influencerId}#tab=${tab}`);
        }
      } catch (error) {
        this.errorSummary = parseApiError(error);
      }
      this.loading = false;
    },
    async saveInfluencerTemplateForRecipients(newTemplateContent) {
      const data = {
        influencer_id: this.influencerId,
        template_id: this.templatesDefaultItem,
        status_flag: 0,
        modified_by: this.$auth.user.id,
        template_type: this.templatetype,
        modified_date: new Date(),
        assign_to_influencer: true,
        influencer_template_name: this.inftemplateName,
        influencer_template_content: newTemplateContent,
        contract_group_id: helper.createGuid()
      };

      this.errorSummary = null;
      const url = `${config.msLandingUrl}/templates/saveInfluencerTemplate`;
      const result = await axios.post(url, {
        ...data
      });

      if (result && result.data) {
        if (result.data.errors) {
          this.errorSummary = parseApiError(result);
          this.loading = false;
          return;
        }
        const self = this;
        try {
          Promise.all(
            self.recipients.forEach(async item => {
              data.influencer_signature_name = item.name;
              data.influencer_signature_email = item.email;

              const url = `${config.msLandingUrl}/templates/saveInfluencerTemplate`;
              const result = await axios.post(url, {
                ...data
              });
              if (result && result.data) {
                if (result.data.errors) {
                  self.errorSummary = parseApiError(result);
                  self.loading = false;
                }
              }
            })
          );
        } catch (error) {
          self.errorSummary = parseApiError(error);
        }
      }
      this.$nuxt.$router.replace(`/influencers/profile/${this.influencerId}`);
    },
    changeEditorContent(content) {
      return content.replace(/{{\s*([\S]+?)\s*}}/g, (full, property) => {
        return escape(this[property]);
      });

      function escape(str) {
        if (str == null) {
          return "";
        }

        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/>/g, "&gt;")
          .replace(/</g, "&lt;")
          .replace(/"/g, "&#34;")
          .replace(/'/g, "&#39;");
      }
    },
    selectFile(file) {
      this.attachment = file;
      this.showAttachments = false;
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
