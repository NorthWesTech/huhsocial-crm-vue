<template>
  <v-card class="mt-3 elevation-2">
    <v-card-title>
      <v-col cols="12" md="6" class="d-flex">
        <h3>{{ title }}</h3>
        <label class="ml-2">
          <span v-if="contracts.length > 0" style="font-size: 14px; color: #666"
            >Showing
            <strong style="color: #1976d2">{{ contracts.length }}</strong>
            records</span
          >
        </label>
      </v-col>

      <v-col cols="12" md="6" class="text-xs-right">
        <v-btn
          outlined
          depressed
          color="green"
          :to="{
            name: 'manage-templates-influencers-type-influencerId',
            params: { type: templateType, influencerId: influencerId }
          }"
        >
          New Contract
        </v-btn>
      </v-col>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col v-if="!contracts.length" cols="12">
          <v-alert color="warning" class="pa-3" dense text> No Contract has created </v-alert>
        </v-col>

        <v-col v-if="contracts.length" cols="12">
          <v-simple-table v-if="!loading && contracts" :dense="$vuetify.breakpoint.smAndDown">
            <template #default>
              <thead>
                <tr>
                  <th>Template Name</th>
                  <th>Contract Status</th>
                  <th v-if="!isReadonly">Actions</th>
                  <th v-if="!isReadonly">Edit</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in contracts"
                  :key="item.influencer_templates_id"
                  :class="!item.is_active ? 'disabled-contract-row' : ''"
                >
                  <td>
                    {{ item.influencer_template_name }}
                    <span v-if="item.cc_email" style="display: block; font-size: 12px">CC: {{ item.cc_email }}</span>
                  </td>
                  <td>
                    <v-chip v-if="item.status_flag == 0" small color="red" text-color="white">Not Sent </v-chip>
                    <v-chip v-if="item.status_flag == 1" small color="orange" text-color="white"
                      >Sent -
                      {{ $dayjs(item.invitation_sent_date).format("DD-MM-YYYY HH:mm") }}
                    </v-chip>
                    <v-chip v-if="item.status_flag == 2" small color="green" text-color="white"
                      >Signed -
                      {{ $dayjs(item.influencer_updated_date).format("DD-MM-YYYY HH:mm") }}
                    </v-chip>
                    <v-chip v-if="item.status_flag == 3" small color="blue" text-color="white"
                      >Opened -
                      {{ $dayjs(item.influencer_updated_date).format("DD-MM-YYYY HH:mm") }}
                    </v-chip>
                  </td>
                  <td v-if="!isReadonly">
                    <v-btn
                      v-if="item.is_active && item.status_flag == 0"
                      small
                      depressed
                      color="primary"
                      :loading="loading"
                      @click="sendContract(item.influencer_templates_id, templateType, $event)"
                    >
                      Send Contract
                      <i class="spinner fa fa-circle-o-notch fa-spin"></i>
                    </v-btn>

                    <v-btn
                      v-if="item.is_active && item.status_flag == 1"
                      small
                      depressed
                      color="primary"
                      :loading="loading"
                      @click="sendContract(item.influencer_templates_id, templateType, $event)"
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
                  </td>
                  <td v-if="!isReadonly">
                    <v-btn
                      v-if="item.is_active && item.status_flag == 0"
                      icon
                      @click="deleteContract(item.influencer_templates_id)"
                    >
                      <v-icon>fa-trash-o</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    influencerId: {
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
      title: "Void Contracts",
      contracts: [],
      templateType: 5,
      loading: false
    };
  },
  methods: {
    async getContracts() {
      const result = await this.$templatesService.influencerstemplateByTypeAndId(this.templateType, this.influencerId);
      if (result) {
        this.contracts = result;
        this.$emit("input", this.contracts.length);
      }
    },
    async deleteContract(inftemplateId) {
      const result = await this.$templatesService.deleteInfluencerstemplate(inftemplateId);
      if (result) {
        const deletedItemIndex = this.contracts.findIndex(item => {
          return item.influencer_templates_id === inftemplateId;
        });
        this.contracts.splice(deletedItemIndex, 1);
      }
    },
    async sendContract(influencer_templates_id, type, event) {
      event.stopPropagation();
      event.target.classList.add("showSpinner");
      const result = await this.$templatesService.influencerVoidContractReviewMail(influencer_templates_id);
      event.target.classList.remove("showSpinner");
      if (result && result.code === 6000) {
        await this.getContracts();
      }
    },
    deactiveContract() {}
  },
  async mounted() {
    await this.getContracts();
  }
};
</script>

<style lang="scss" scoped></style>
