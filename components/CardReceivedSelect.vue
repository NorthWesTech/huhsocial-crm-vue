<template>
  <v-select
    :value="value"
    :items="cardReceivedFilterCases"
    item-text="label"
    item-value="value"
    outlined
    dense
    @change="onChange"
  >
    <template v-slot:selection="{ item }">
      <span :style="`color:${item.color}`">{{ item.label }}</span>
    </template>
    <template v-slot:item="{ item }">
      <span :style="`color:${item.color}`">{{ item.label }}</span>
    </template>
  </v-select>
</template>
<script>
import config from "@/config";
export default {
  data() {
    return {
      cardReceivedCases: config.cardReceivedCases
    };
  },
  props: ["value", "filterCases"],
  methods: {
    onChange(item) {
      this.$emit("input", item);
      this.$emit("change", item);
    }
  },
  computed: {
    cardReceivedFilterCases() {
      if (!this.filterCases) {
        return this.cardReceivedCases;
      }

      return this.filterCases.concat(this.cardReceivedCases);
    }
  }
};
</script>

<style lang="scss" scoped></style>
