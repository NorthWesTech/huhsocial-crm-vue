<template>
  <v-row>
    <v-col v-if="!allDocuments.length" cols="12">
      <v-alert color="warning" class="pa-3" dense text> No Contract has created </v-alert>
    </v-col>

    <v-col v-if="allDocuments.length" cols="12">
      <v-simple-table v-if="!loading && allDocuments" :dense="$vuetify.breakpoint.smAndDown">
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
              v-for="item in allDocuments"
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
                  {{ formatDateTime(item.invitation_sent_date) }}
                </v-chip>
                <v-chip v-if="item.status_flag == 2" small color="green" text-color="white"
                  >Signed -
                  {{ formatDateTime(item.influencer_updated_date) }}
                </v-chip>
              </td>
              <td v-if="!isReadonly">
                <v-btn
                  v-if="item.is_active && item.status_flag == 0"
                  small
                  depressed
                  color="primary"
                  :loading="loading"
                  @click="sendMailForInfluencerTemplatesReview(item.influencer_templates_id, 1, $event)"
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
                  @click="sendMailForInfluencerTemplatesReview(item.influencer_templates_id, 1, $event)"
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
                  link
                  :to="{
                    name: 'manage-templates-influencers-edit-influencerId',
                    params: {
                      influencerId: item.influencer_templates_id
                    }
                  }"
                >
                  <v-icon>fa-pencil-square-o</v-icon>
                </v-btn>

                <v-btn
                  v-if="item.is_active && item.status_flag == 0"
                  icon
                  @click="deleteContractInfluencerTemplates(item.influencer_templates_id)"
                >
                  <v-icon>fa-trash-o</v-icon>
                </v-btn>

                <!-- <v-btn
                  v-if="item.status_flag == 2"
                  icon
                  link
                  :href="`${msLandingUrl}/templates/downloadInfluencerTemplate/${item.influencer_templates_id}`"
                > -->
                <v-btn
                  v-if="item.status_flag == 2"
                  icon
                  link
                  @click="
                    downloadContract(
                      `${msLandingUrl}/templates/downloadInfluencerTemplate/${item.influencer_templates_id}`,
                      `${item.influencer_template_name}_contract.pdf`
                    )
                  "
                >
                  <v-icon>fa-download</v-icon>
                </v-btn>

                <v-btn
                  v-if="item.is_active"
                  icon
                  @click="deactivateInfluencerTemplate(item.influencer_templates_id, item.template_type)"
                >
                  <v-icon>fa-stop-circle-o</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-col>
  </v-row>
</template>

<script>
import config from "@/config";

export default {
  name: "InfluencerDocumentsListOld",
  props: {
    allDocuments: {
      type: Array,
      required: true
    },
    formatDateTime: {
      type: Function,
      required: true
    },
    sendMailForInfluencerTemplatesReview: {
      type: Function,
      required: true
    },
    deleteContractInfluencerTemplates: {
      type: Function,
      required: true
    },
    downloadContract: {
      type: Function,
      required: true
    },
    deactivateInfluencerTemplate: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      isReadonly: false,
      msLandingUrl: config.msLandingUrl
    };
  }
};
</script>
