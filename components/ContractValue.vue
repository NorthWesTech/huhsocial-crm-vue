<template>
  <div class="contract-value-container">
    <v-chip
      v-if="contractValue.value"
      dark
      :color="contractValue.color"
      @click="onClick"
    >
      <span v-if="showLabel">Contract Value:</span>
      <span>
        <strong> {{ contractValue.label }}</strong>
        <small>({{ contractValue.shares }} shares)</small>
      </span>
    </v-chip>
    <v-chip v-if="typeof contractValue != 'object'" @click="onClick">
      <span v-if="showLabel">Contract Value:</span>
      <strong> {{ contractValue }}</strong>
    </v-chip>
  </div>
</template>

<script>
import config from "@/config";
const formatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  notation: "standard",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});
export default {
  props: {
    value: {
      type: Number,
      default: 0,
      required: true
    },
    showLabel: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    contractValue() {
      const contractValue = config.contractValues.find(
        f => f.value == this.value
      );
      return contractValue ? contractValue : formatter.format(this.value);
    }
  },
  methods: {
    onClick() {
      this.$emit("click");
    }
  }
};
</script>
<style lang="scss" scoped>
.contract-value-container {
  display: inline;
}
</style>
