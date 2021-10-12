<template>
  <v-dialog v-model="modalIsVisible" :loading="loading" max-width="600" @input="checkRecipients">
    <template #activator="{ on, attrs }">
      <v-btn outlined color="primary" small v-bind="attrs" v-on="on"> {{ buttonLabel }} </v-btn>
    </template>
    <v-card>
      <v-card-title class="headline">{{ title }}</v-card-title>
      <v-card-text>{{ infoText }}</v-card-text>
      <v-alert v-if="recipients.length === 0" text color="warning"> No recipients found! </v-alert>
      <template v-if="recipients.length > 0">
        <v-list two-line>
          <v-list-item-group v-model="selecteds" multiple>
            <template v-for="recipient in recipients">
              <v-list-item :key="`recipeint-sel-${recipient.id}`" two-line>
                <template #default="{ active }">
                  <v-list-item-content>
                    <v-list-item-title v-text="recipient.person"></v-list-item-title>
                    <v-list-item-subtitle class="text-caption" v-text="recipient.nickname"></v-list-item-subtitle>
                    <v-list-item-subtitle
                      v-if="recipient.companyInfo"
                      class="text--primary"
                      v-html="recipient.companyInfo"
                    ></v-list-item-subtitle>
                    <v-list-item-subtitle>{{ recipient.email }} - {{ recipient.phone }}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-icon v-if="!active" color="grey lighten-1"> mdi-check-circle-outline </v-icon>
                    <v-icon v-else color="green darken-3"> mdi-check-circle </v-icon>
                  </v-list-item-action>
                </template>
              </v-list-item>
            </template>
          </v-list-item-group>
        </v-list>
      </template>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" text @click="handleDismiss">Dismiss</v-btn>
        <v-btn color="primary" text @click="handleSelect">{{
          selectedRecipients.length > 0 ? `Send to ${selectedRecipients.length} Recipient(s)` : "Send to All"
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import globalMixins from "@/mixins/globals";

export default {
  name: "SelectTemplateRecipientsDialog",
  mixins: [globalMixins],
  props: {
    recipients: {
      type: Array,
      required: true
    },
    documentId: {
      type: String,
      required: true
    },
    infoText: {
      type: String,
      default: "Please select resipient(s)"
    },
    title: {
      type: String,
      default: "Select Recipient(s)"
    },
    buttonLabel: {
      type: String,
      default: "Select Recipient(s)"
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modalIsVisible: false,
      selecteds: []
    };
  },
  computed: {
    selectedRecipients() {
      return this.selecteds.map(r => this.recipients[r]);
    }
  },
  methods: {
    checkRecipients(visible) {
      // if (visible && this.recipients.length === 1) {
      //   this.handleSelect();
      // }
    },
    handleSelect() {
      this.$emit("onSelect", {
        documentId: this.documentId,
        specificRecipients: this.selectedRecipients
      });
      this.modalIsVisible = false;
      process.nextTick(() => {
        this.selecteds = [];
      });
    },
    handleDismiss() {
      this.modalIsVisible = false;
      this.$emit("onDismiss");
    }
  }
};
</script>
