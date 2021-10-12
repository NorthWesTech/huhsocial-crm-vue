<template>
  <div>
    <v-card class="elevation-0 mb-3" style="background: transparent;">
      <v-card-text>
        <div class="template-header">
          <h2 style="color:#000;">New Multiple Signed Contract</h2>
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
    <v-stepper v-model="step" non-linear alt-labels class="elevation-2 mb-3">
      <v-stepper-header>
        <v-stepper-step step="1">
          Select Template
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step step="2">
          Placeholders
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step step="3">
          Summary
        </v-stepper-step>
      </v-stepper-header>
    </v-stepper>
    <v-form ref="form" lazt-validation>
      <template v-if="step == 1">
        <v-card class="elevation-2 mb-3">
          <v-card-title>
            <v-icon>mdi-form-select</v-icon>
            <span class="title ml-2">Select Template</span>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field outlined dense v-model="inftemplateName" required></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="template"
                  :items="templates"
                  item-text="label"
                  item-value="value"
                  label="Template Names"
                  dense
                  outlined
                ></v-autocomplete>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-skeleton-loader v-if="loading" class="mx-auto" style="width:100%" type="card"></v-skeleton-loader>
        <v-card v-if="!loading && template">
          <v-card-title>
            Template Details
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="12">
                <editor
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
      </template>
      <template v-if="step == 2">
        <h2>Create Placeholder Recipients</h2>

        <v-timeline class="pr-2" dense>
          <draggable
            :list="recipients"
            :disabled="!enabled"
            class="list-group"
            ghost-class="ghost"
            @start="dragging = true"
            @end="dragging = false"
          >
            <v-slide-x-reverse-transition group hide-on-leave>
              <v-timeline-item
                v-for="item in recipients"
                :key="item.id"
                icon="mdi-drag"
                small
                fill-dot
                :color="item.color"
              >
                <v-alert class="mb-0">
                  <h3>{{ item.title }}</h3>
                  <v-row>
                    <v-col col="4">
                      <v-text-field
                        v-model="item.name"
                        :rules="nameRules"
                        label="Name"
                        outlined
                        dense
                        :disabled="item.placeholder == 'influencer' && signOnBehalf"
                      ></v-text-field>
                      <v-btn small @click="removePlaceholder(item)" v-if="item.type == 2">Remove</v-btn>
                      <v-checkbox
                        v-if="item.placeholder == 'agency'"
                        v-model="signOnBehalf"
                        class="m-0"
                        dense
                        label="Signing on behalf of Influencer"
                      ></v-checkbox>
                    </v-col>
                    <v-col col="4">
                      <v-text-field
                        v-model="item.email"
                        :rules="emailRules"
                        label="Email"
                        outlined
                        dense
                        :disabled="item.placeholder == 'influencer' && signOnBehalf"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-alert>
              </v-timeline-item>
            </v-slide-x-reverse-transition>
          </draggable>
        </v-timeline>
        <v-btn color="gray" class="mt-5" @click="addPlaceholder('cc')"
          ><i class="fa fa-plus"></i> Add Receives a Copy</v-btn
        >
      </template>
      <template v-if="step == 3">
        <div class="d-flex pb-3 pt-3" style="grid-gap: 1rem">
          <div v-for="item in recipients">
            {{ item.title }}:
            <v-chip :color="item.color" dark>
              {{ item.name }}
            </v-chip>
          </div>
        </div>
        <div class="summary-view" ref="templateHtml" v-html="templateContent"></div>
      </template>
    </v-form>
    <div class="d-flex justify-space-between mt-5 elevation-2 pa-3 wizard-nav">
      <v-btn @click="step--" :disabled="step == 1">
        <v-icon left dark>
          mdi-arrow-left
        </v-icon>
        Back
      </v-btn>
      <v-btn @click="nextStep" color="primary" v-if="step != 3">
        Next
        <v-icon right dark>
          mdi-arrow-right
        </v-icon>
      </v-btn>
      <v-btn @click="saveTemplate" color="success" v-if="step == 3">
        Complete
        <v-icon right dark>
          mdi-check
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import ContractValue from "@/components/ContractValue.vue";
import editor from "@/components/templates/editor";
import draggable from "vuedraggable";
import helper from "@/utils/helper.js";

const SignType = {
  NeedsToSign: 1,
  ReceivesCopy: 2
};

export default {
  components: {
    ContractValue,
    editor,
    draggable
  },
  data() {
    return {
      step: 1,
      template: null,
      loading: false,
      templateContent: null,
      enabled: true,
      recipients: [],
      signOnBehalf: false,
      types: [
        {
          value: "1",
          label: "Needs to Sign",
          icon: "mdi-draw"
        },
        {
          value: "2",
          label: "Receives a Copy",
          icon: "mdi-closed-caption-outline"
        }
      ],
      dragging: false,
      nameRules: [v => !!v || "Recipient Name is required"],
      emailRules: [v => !!v || "E-mail is required", v => /.+@.+/.test(v) || "E-mail must be valid"]
    };
  },
  watch: {
    template(value) {
      this.getTemplate(value);
    },
    step(value) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (value == 3) {
        this.$nextTick(() => {
          this.handlePlaceholder();
        });
      }
    }
  },
  computed: {
    hasAgency() {
      return !!this.recipients.find(f => f.placeholder == "agency");
    },
    hasParent() {
      return !!this.recipients.find(f => f.placeholder == "parent");
    },
    currentDate() {
      return this.$dayjs().format("DD-MM-YYYY");
    },
    contractValue() {
      return this.influencerInfo.contractValue.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    },
    contractShares() {
      return (this.influencerInfo.contractValue / 12.5).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    },
    fee() {
      return (this.influencerInfo.contractValue / 12.5) * 0.01;
    }
  },
  methods: {
    handlePlaceholder() {
      const placeholders = this.recipients.filter(f => f.type == SignType.NeedsToSign);
      const agency = placeholders.find(f => f.placeholder == "agency");
      if (this.signOnBehalf) {
        document.querySelectorAll(`[data-person='influencer']`).forEach(e => {
          e.dataset.person = "agency";
        });

        document.querySelector("form:not(.v-form)").dataset["signOnBehalf"] = agency.name;
      }
      placeholders.forEach(item => {
        document.querySelectorAll(`[data-person=${item.placeholder}]`).forEach(e => {
          e.style.background = item.color;
          e.dataset.signatureFrom = item.name;
          if (e.hasAttribute("data-person-name")) {
            e.value = item.name;
          }
        });
      });
    },
    addPlaceholder(placeholder) {
      let last = this.recipients[this.recipients.length - 1];

      const placeholderType = {
        agency: {
          title: "Agency",
          color: "#4CAF50"
        },
        parent: {
          title: "Parent",
          color: "#795548"
        },
        cc: {
          title: "Receives a Copy",
          color: "#47525d"
        }
      };
      if (placeholder == "influencer") {
        this.recipients.push({
          id: 0,
          name: this.influencerName,
          email: this.influencerInfo.email,
          color: "#2196F3",
          type: "1",
          title: "Influencer",
          placeholder: "influencer"
        });
      } else {
        this.recipients.push({
          name: "",
          email: "",
          id: last.id + 1,
          color: placeholderType[placeholder].color,
          type: placeholder == "cc" ? "2" : "1",
          placeholder,
          title: placeholderType[placeholder].title
        });
      }
    },
    removePlaceholder(item) {
      this.recipients = this.recipients.filter(f => f.id != item.id);
    },
    saveTemplate() {
      this.loading = true;
      this.$refs.templateHtml.querySelectorAll("[data-person]").forEach(e => {
        e.style.background = "";
        if (e.hasAttribute("data-person-name")) {
          e.value = e.dataset.name;
        }
      });
      const newTemplateContent = `
        <html>
          <body>
            ${this.$refs.templateHtml.innerHTML}
          </body>
        </html>
      `;
      const data = {
        influencer_id: this.influencerInfo.influencerId,
        template_id: this.template,
        status_flag: 0,
        modified_by: this.$auth.user.id,
        template_type: 4,
        modified_date: new Date(),
        assign_to_influencer: true,
        influencer_template_name: this.inftemplateName,
        influencer_template_content: newTemplateContent,
        contract_group_id: helper.createGuid(),
        is_active: true,
        placeholders: []
      };

      if (this.signOnBehalf) {
        this.recipients = this.recipients.filter(item => item.placeholder != "influencer");
      }

      this.errorSummary = null;
      const self = this;
      try {
        Promise.all(
          this.recipients.forEach(async item => {
            if (item.type == SignType.NeedsToSign) {
              data.cc_name = null;
              data.cc_email = null;
              data.influencer_signature_name = item.name;
              data.influencer_signature_email = item.email;
            }

            if (item.type == SignType.ReceivesCopy) {
              data.influencer_signature_name = null;
              data.influencer_signature_email = null;
              data.cc_name = item.name;
              data.cc_email = item.email;
            }

            const result = await this.$templatesService.saveInfluencerTemplate(data);
            if (result && result) {
              if (result.errors) {
                self.errorSummary = parseApiError(result);
                self.loading = false;
              }
            }
          })
        );
      } catch (error) {
        self.errorSummary = parseApiError(error);
      }
      this.$nuxt.$router.replace(`/influencers/profile/${this.influencerInfo.influencerId}#tab=multiple`);
    },
    async getTemplate(id) {
      this.loading = true;
      const result = await this.$templatesService.templatebyid(id);
      this.templateContent = this.changeEditorContent(result.template_content);
      this.loading = false;

      this.recipients = [];
      let placeholders = [];
      const div = document.createElement("div");
      div.innerHTML = result.template_content.trim();
      div.querySelectorAll("[data-person]").forEach(e => {
        if (!placeholders.includes(e.dataset.person)) {
          placeholders.push(e.dataset.person);
        }
      });
      placeholders.forEach(e => {
        this.addPlaceholder(e);
      });
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
    submitCallback(newTemplateContent) {
      this.step = 2;
    },
    nextStep() {
      const isValid = this.$refs.form.validate();
      if (!isValid) return;
      this.step++;
    }
  },
  async asyncData({ params, $influencerService, $templatesService }) {
    const influencer = await $influencerService.info(params.id);
    const templates = await $templatesService.alltemplates();
    const influencerInfo = influencer.profileInfo;
    return {
      influencerInfo,
      inftemplateName: `${influencerInfo.firstName} ${influencerInfo.lastName}`,
      influencerName: `${influencerInfo.firstName} ${influencerInfo.lastName}`,
      templates: templates
        .filter(f => f.template_type == 4)
        .map(item => {
          return {
            label: item.template_name,
            value: item.template_id
          };
        })
    };
  }
};
</script>

<style lang="scss" scoped>
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
</style>

<style>
.pdf-page {
  background: #fff;
  margin: 0.75rem 0;
  border-radius: 0.5rem;
  border: 1px solid #eae7e7;
  box-shadow: 0px 3px 3px #d8d6d6;
  min-height: 1024px;
}

.placeholder-select {
  border: 1px solid #ccc;
  width: 100%;
  padding: 0.3rem 1rem;
  background: #fffcd5;
}

.table-container .row-2,
.table-container .row-3 {
  height: 60px !important;
}

.wizard-nav {
  background: #fff;
  position: sticky;
  bottom: 36px;
}
</style>
