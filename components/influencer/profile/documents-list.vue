<template>
  <v-row>
    <v-col v-if="!documentsList.length" cols="12">
      <v-alert color="warning" class="pa-3" dense text> No Contract has created </v-alert>
    </v-col>

    <v-col v-if="documentsList.length" cols="12">
      <v-simple-table v-if="!loading && documentsList" :dense="$vuetify.breakpoint.smAndDown">
        <template #default>
          <thead>
            <tr>
              <th>Template Name</th>
              <th>Contract Status</th>
              <th>Created At</th>
              <th v-if="!isReadonly">Actions</th>
              <th v-if="!isReadonly">Edit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in documentsList" :key="item.id" :class="{ stopped: !item.isActive }">
              <td>
                {{ item.template.name }}
              </td>
              <td>
                <v-chip v-if="item.status == 0" small color="red" text-color="white">Not Sent </v-chip>
                <v-chip v-if="item.status == 1" small color="orange" text-color="white"
                  >Sent -
                  {{ formatDateTime(item.sentDate) }}
                </v-chip>
                <v-chip v-if="item.status == 2" small color="green" text-color="white">Signed </v-chip>
              </td>
              <td class="text-center">
                <span class="d-block">{{ $dayjs(item.createdAt).format("DD.MM.YYYY") }}</span>
                <span style="font-size: 12px; color: #666">{{ $dayjs(item.createdAt).format("HH:mm A") }}</span>
              </td>
              <td v-if="!isReadonly">
                <select-template-recipients-dialog
                  v-if="item.isActive && item.status == 0 && item.recipients"
                  :recipients="item.recipients.slice(1)"
                  :document-id="item.id"
                  :loading="loading"
                  button-label="Send Document"
                  info-text="Please select recipient(s) to send the document for sign/review"
                  @onSelect="handleSendForReview"
                />
                <select-template-recipients-dialog
                  v-if="item.isActive && item.status == 1 && item.recipients"
                  :recipients="item.recipients.slice(1)"
                  :document-id="item.id"
                  :loading="loading"
                  button-label="Re-Send Document"
                  info-text="Please select recipient(s) to send the document for sign/review"
                  @onSelect="handleSendForReview"
                />

                <v-btn
                  small
                  color="primary"
                  outlined
                  :loading="loading"
                  :to="{
                    name: 'influencers-documents-view',
                    params: {
                      view: item.id
                    }
                  }"
                  target="_blank"
                >
                  View Document
                </v-btn>

                <v-btn
                  v-if="item.recipients"
                  small
                  icon
                  link
                  :to="{
                    name: 'influencers-documents-documentId-review-and-sign',
                    params: {
                      documentId: item.id
                    },
                    query: {
                      r: item.recipients[1].id
                    }
                  }"
                >
                  <v-icon small>mdi-draw</v-icon>
                </v-btn>
              </td>
              <td v-if="!isReadonly">
                <v-tooltip v-if="item.isActive && item.status == 0" bottom>
                  <template #activator="{ on, attr }">
                    <v-btn
                      small
                      icon
                      link
                      :to="{
                        name: 'influencers-documents-edit',
                        params: {
                          edit: item.id
                        }
                      }"
                      v-bind="attr"
                      v-on="on"
                    >
                      <v-icon small>mdi-book-edit-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Edit Document</span>
                </v-tooltip>
                <v-tooltip v-if="item.isActive && item.status == 0" bottom>
                  <template #activator="{ on }">
                    <v-btn icon small @click="documentIdToDelete = item.id" v-on="on">
                      <v-icon small>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <span>Delete Document</span>
                </v-tooltip>
                <v-tooltip v-if="item.status == 2" bottom>
                  <template #activator="{ on }">
                    <v-btn
                      icon
                      small
                      @click="
                        handleDownload(
                          `${msLandingUrl}/templates/influencer-docs/${item.id}`,
                          `${item.template.name}_contract.pdf`
                        )
                      "
                      v-on="on"
                    >
                      <v-icon small>mdi-cloud-download</v-icon>
                    </v-btn>
                  </template>
                  <span>Download Document</span>
                </v-tooltip>
                <v-tooltip v-if="item.isActive" bottom>
                  <template #activator="{ on }">
                    <v-btn icon small @click="documentToStop = item.id" v-on="on">
                      <v-icon small>mdi-stop-circle</v-icon>
                    </v-btn>
                  </template>
                  <span>Stop Process</span>
                </v-tooltip>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-col>

    <v-dialog :value="documentIdToDelete" max-width="290">
      <v-card>
        <v-card-title class="headline">Delete Document</v-card-title>
        <v-card-text>Are you sure to delete this document?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray" text @click="documentIdToDelete = null">Cancel</v-btn>
          <v-btn color="red darken-1" text @click.stop="handleDeleteDocument">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :value="documentToStop" max-width="290">
      <v-card>
        <v-card-title class="headline">Stop Signing Process</v-card-title>
        <v-card-text>Are you sure to stop signing process for this document?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray" text @click="documentToStop = null">Cancel</v-btn>
          <v-btn color="red darken-1" text @click.stop="handleDeactivate">Yes Stop</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import config from "@/config";
import globalMixins from "@/mixins/globals";
import SelectTemplateRecipientsDialog from "@/components/templates/select-template-recipients-dialog";

export default {
  name: "InfluencerDocumentsList",
  components: { SelectTemplateRecipientsDialog },
  mixins: [globalMixins],
  props: {
    templateType: {
      type: Number,
      required: true
    },
    allDocuments: {
      type: Array,
      required: true
    },
    isReadonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      sendDocId: null,
      loading: false,
      msLandingUrl: config.msLandingUrl,
      documentIdToDelete: null,
      documentToStop: null
    };
  },
  computed: {
    documentsList() {
      return this.allDocuments.filter(d => d.template.templateType == this.templateType);
    }
  },
  mounted() {
    // console.log(this.allDocuments)
  },
  methods: {
    async handleSendForReview({ documentId, specificRecipients }) {
      this.loading = true;
      try {
        const ids = Array.isArray(specificRecipients) ? specificRecipients.map(r => r.id) : [];
        const result = await this.$templates2Service.sendToRecipients(documentId, { specificRecipients: ids });
        if (result.code === 6000) {
          this.$emit("documentSent", { documentId, specificRecipients });
        }
      } catch (error) {
        this.$emit("error", error);
      }
      this.loading = false;
    },
    async handleDeleteDocument() {
      this.loading = true;
      try {
        const deleteReuslt = await this.$templates2Service.deleteDocumentById(this.documentIdToDelete);
        if (deleteReuslt.code === 6000) {
          this.$emit("documentDeleted", { documentId: this.documentIdToDelete });
        }
      } catch (error) {
        this.$emit("error", error.response.data.errors);
      }
      this.documentIdToDelete = null;
      this.loading = false;
    },
    async handleDownload() {},
    async handleDeactivate() {
      this.loading = true;
      try {
        const deactivateResult = await this.$templates2Service.stopProcess(this.documentToStop);
        if (deactivateResult.code === 6000) {
          this.$emit("documentStopped", { documentId: this.documentToStop });
        }
      } catch (error) {
        this.$emit("error", error.response.data.errors);
      }
      this.documentToStop = null;
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.stopped {
  opacity: 0.5;
}
</style>
