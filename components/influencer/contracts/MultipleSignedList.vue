<template>
  <v-card class="mt-3 elevation-2">
    <v-card-title>
      <v-col cols="12" md="6" class="d-flex">
        <h3>Multiple Signed Contracts</h3>
        <!-- <label class="ml-2">
          <span style="font-size:14px;color:#666;" v-if="influencerContractTemplatesInfo.length > 0"
            >Showing
            <strong style="color: #1976d2;">{{ influencerContractTemplatesInfo.length }}</strong>
            records</span
          >
        </label> -->
      </v-col>

      <v-col cols="12" md="6" class="text-xs-right">
        <v-btn
          outlined
          depressed
          color="green"
          :to="{
            name: 'multiple-signature-contract-id',
            params: { id: influencer }
          }"
        >
          New Contract
          <!-- params: { type: 4, influencerId: id } -->
        </v-btn>
      </v-col>
    </v-card-title>
    <v-card-text>
      <div class="contract-list">
        <div class="contract-list--header">
          <h3>Template Name</h3>
          <h3 class="text-center">Progress</h3>
          <h3 class="text-center">Status</h3>
          <!-- <h3 class="text-center">Date</h3> -->
          <h3 v-if="!isReadonly">Actions</h3>
          <h3 v-if="!isReadonly">Edit</h3>
        </div>
        <div class="contract-list--item" v-for="item in templates">
          <div>
            {{ item.influencer_template_name }}
            <!-- <div v-for="(rec, index) in item.recipients">
              {{ rec.influencer_signature_email }} -->
            <!-- <span v-if="index === 0">{{ rec.influencer_signature_name }}</span>
              <span v-if="index === 1" class="grey--text caption"> (+{{ item.recipients.length - 1 }} others) </span> -->
            <!-- </div> -->
          </div>
          <div class="text-center">
            <v-progress-linear
              :color="item.isSigned ? 'green' : 'grey'"
              :value="calculateSign(item.recipients)"
            ></v-progress-linear>
            <a
              href="javascript:;"
              class="text-decoration-none"
              @click="
                showRecipients = true;
                recipients = item.recipients;
              "
            >
              <small class="progress-info">
                {{ item.recipients.filter(f => f.status_flag == 2).length }}/{{ item.recipients.length }}
              </small>
            </a>
          </div>
          <div class="text-center">
            <v-chip v-if="item.status_flag == 0" small color="red" text-color="white">Not Sent </v-chip>
            <v-chip v-if="item.status_flag == 1 && !item.isSigned" small color="orange" text-color="white"
              >Sent
              <!-- {{ convertDate(item.invitation_sent_date) }} -->
            </v-chip>
            <v-chip v-if="item.isSigned" small color="green" text-color="white"
              >Signed
              <!-- {{ convertDate(item.influencer_updated_date) }} -->
            </v-chip>
          </div>
          <!-- <div class="text-center">
            <span v-if="!item.isSigned">
              {{ $dayjs(item.invitation_sent_date).format("DD/MM/YYYY HH:mm") }}
            </span>
            <span v-if="item.isSigned">
              {{ $dayjs(item.influencer_updated_date).format("DD/MM/YYYY HH:mm") }}
            </span>
          </div> -->
          <div v-if="!isReadonly">
            <v-btn
              small
              depressed
              color="primary"
              :loading="loading"
              v-if="item.is_active && item.status_flag == 0"
              @click="sendContract(item.influencer_templates_id, item.contract_group_id, $event)"
            >
              Send Contract
              <i class="spinner fa fa-circle-o-notch fa-spin"></i>
            </v-btn>

            <v-btn
              small
              depressed
              color="primary"
              :loading="loading"
              v-if="item.is_active && !item.isSigned && item.status_flag != 0"
              @click="sendContract(item.influencer_templates_id, item.contract_group_id, $event)"
            >
              Re-Send Contract
              <i class="spinner fa fa-circle-o-notch fa-spin"></i>
            </v-btn>

            <v-btn
              small
              depressed
              color="primary"
              :loading="loading"
              :to="{
                name: 'influencers-profile-view-influcertemplateid',
                params: {
                  influcertemplateid: item.influencer_templates_id
                }
              }"
              target="_blank"
            >
              View Contract
            </v-btn>
          </div>
          <div v-if="!isReadonly">
            <!-- <v-btn
              icon
              link
              v-if="item.is_active && item.status_flag == 0"
              :to="{
                name: 'manage-templates-influencers-edit-influencerId',
                params: {
                  influencerId: item.influencer_templates_id
                }
              }"
            >
              <v-icon>fa-pencil-square-o</v-icon>
            </v-btn> -->

            <v-btn
              icon
              v-if="item.is_active && item.status_flag == 0"
              @click="deleteTemplate(item.influencer_templates_id)"
            >
              <v-icon>fa-trash-o</v-icon>
            </v-btn>

            <!-- <v-btn
              icon
              link
              v-if="item.status_flag == 2"
              :href="`${msLandingUrl}/templates/downloadInfluencerTemplate/${item.influencer_templates_id}`"
            >
              <v-icon>fa-download</v-icon>
            </v-btn> -->

            <!-- <v-btn
              icon
              v-if="item.is_active"
              @click="deactivateInfluencerTemplate(item.influencer_templates_id, item.template_type)"
            >
              <v-icon>fa-stop-circle-o</v-icon>
            </v-btn> -->
          </div>
        </div>
      </div>
      <v-dialog v-model="showRecipients" max-width="750px">
        <v-card>
          <v-card-title class="headline">Recipients</v-card-title>
          <v-card-text>
            <div class="contract-list">
              <div class="contract-list--item" v-for="item in recipients">
                <div>{{ item.influencer_signature_name }}</div>
                <div>{{ item.influencer_signature_email }}</div>
                <div class="text-center">
                  <v-chip v-if="item.status_flag == 0" small color="red" text-color="white">Not Sent </v-chip>
                  <v-chip v-if="item.status_flag == 1" small color="orange" text-color="white"> Sent </v-chip>
                  <v-chip v-if="item.status_flag == 2" small color="green" text-color="white"> Signed </v-chip>
                </div>
                <div class="text-center">
                  <span v-if="item.status_flag == 1">
                    {{ $dayjs(item.invitation_sent_date).format("DD/MM/YYYY HH:mm") }}
                  </span>
                  <span v-if="item.status_flag == 2">
                    {{ $dayjs(item.influencer_updated_date).format("DD/MM/YYYY HH:mm") }}
                  </span>
                </div>
              </div>
            </div>
          </v-card-text>
          <!-- <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="gray" text @click="dismissDeleteDialog">Dismiss</v-btn>
          </v-card-actions> -->
        </v-card>
      </v-dialog>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    influencer: {
      type: String,
      required: true
    },
    isReadonly: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      templates: [],
      loading: false,
      showRecipients: false,
      recipients: []
    };
  },
  methods: {
    async getTemplates() {
      this.loading = true;
      this.templates = [];
      const result = await this.$templatesService.influencerstemplateByTypeAndId(4, this.influencer);
      if (result) {
        const templates = result
          .map(item => {
            delete item.influencer_template_content;
            delete item.template_content;
            return item;
          })
          .sort((a, b) => b.created_date - a.created_date);

        let infTemplates = [];
        templates.forEach(item => {
          if (!infTemplates.find(f => f.contract_group_id == item.contract_group_id)) {
            const recipients = templates.filter(
              i => i.contract_group_id == item.contract_group_id && i.influencer_signature_name
            );
            const notSignedRecipients = recipients.filter(f => f.status_flag != 2);
            infTemplates.push({
              ...item,
              recipients: recipients,
              isSigned: !notSignedRecipients.length
            });
          }
        });
        this.templates = infTemplates;
        this.$emit("input", this.templates.length);
      }
      this.loading = false;
    },
    calculateSign(all) {
      var signed = all.filter(f => f.status_flag == 2).length;
      return ((signed / all.length) * 100).toFixed(0);
    },
    async sendContract(influencer_templates_id, contract_group_id, event) {
      event.stopPropagation();
      event.target.classList.add("showSpinner");
      const result = await this.$templatesService.sendMultipleSignatureContract(contract_group_id);
      if (result && result.code === 6000) {
        const self = this;
        setTimeout(() => {
          self.getTemplates();
        }, 2000);
      }
      event.target.classList.remove("showSpinner");
    },
    async deleteTemplate(inftemplateId) {
      await this.$templatesService.deleteInfluencerstemplate(inftemplateId);
      await this.getTemplates();
    }
  }
  // mounted() {
  //   this.getTemplates();
  // }
};
</script>

<style lang="scss" scoped>
.contract-list {
  &--header,
  &--item {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-gap: 0.5rem;
    padding-bottom: 0.5rem;
  }

  &--header {
    // padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #ccc;
  }
}
</style>
