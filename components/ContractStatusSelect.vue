<template>
  <div style="display: inline-block">
    <v-select
      v-model="contractStatus"
      :value="value"
      :items="contractStatuses"
      item-text="label"
      item-value="value"
      class="no-padding"
      auto-select-first
      :outlined="outlined !== undefined ? outlined : true"
      :loading="loading"
      dense
      size="small"
      @change="onChange"
    />
    <v-dialog v-model="showStatusChangeConfirmationDialog" max-width="290">
      <v-card>
        <v-card-title>Contract Status Change</v-card-title>
        <v-card-text>
          Are you sure to change contract status of
          <strong>{{ influencer.firstName + " " + influencer.lastName }}</strong> ?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="dismissStatusChangeConfirmationDialog">Dismiss</v-btn>
          <v-btn color="green" text @click.stop="onConfirmStatusChange">Change Status</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: ["value", "influencer", "contractStatuses", "outlined", "template"],
  data() {
    return {
      valueToBeConfirmed: null,
      contractStatus: this.value,
      showStatusChangeConfirmationDialog: false,
      loading: false
    };
  },
  watch: {
    async contractStatus(value) {
      if (value === 4 || value === 5) {
        console.log("Value not allowed.");

        this.$nextTick(() => {
          this.contractStatus = this.value;
        });
      }
    }
  },
  methods: {
    async changeContractStatus(contractStatus) {
      this.loading = true;
      await this.$influencerService.changeContractStatus({
        id: this.influencer.id || this.influencer.influencerId,
        closer: this.influencer.closer,
        contractStatus,
        updatedBy: this.$auth.user.id
      });

      this.$emit("input", contractStatus);
      this.$emit("change", contractStatus);
      this.loading = false;
    },
    onChange(contractStatus) {
      if (contractStatus === 4 || contractStatus === 5) {
        this.valueToBeConfirmed = contractStatus;
        this.showStatusChangeConfirmationDialog = true;
        return;
      }

      this.$nextTick(async () => {
        await this.changeContractStatus(this.contractStatus);
      });
    },
    async onConfirmStatusChange() {
      const contractStatus = this.valueToBeConfirmed;
      await this.changeContractStatus(contractStatus);
      this.valueToBeConfirmed = null;
      this.contractStatus = contractStatus;
      this.showStatusChangeConfirmationDialog = false;
    },
    dismissStatusChangeConfirmationDialog() {
      this.valueToBeConfirmed = null;
      this.showStatusChangeConfirmationDialog = false;
    }
  }
};
</script>
