<template>
  <v-autocomplete
    :value="value"
    :items="assignedToCases"
    item-text="label"
    item-value="value"
    class="pt-0"
    :disabled="disabled"
    outlined
    dense
    @change="onChange"
  >
    <template slot="item" slot-scope="data">
      <div class="d-flex justify-lg-space-between" style="width:100%">
        <span>{{ data.item.label }}</span>
        <v-chip v-if="data.item.role === 2" small chip color="#B2DFDB">Opener</v-chip>
        <v-chip v-if="data.item.role === 3" small chip color="#A1887F" dark>Closer</v-chip>
        <v-chip v-if="data.item.role === 4" small chip color="#fca311" dark>Owner</v-chip>
      </div>
    </template>
  </v-autocomplete>
</template>

<script>
import config from "@/config";
export default {
  props: ["value", "roles", "filterCases", "disabled"],
  computed: {
    assignedToCases() {
      let cases = null;

      if (!this.filterCases) {
        cases = config.assignedToCases;
      } else {
        cases = [...this.filterCases, { label: "Not assigned yet", value: "na" }];
      }

      switch (this.roles) {
        case 2:
          return cases.concat(this.$store.state.usersToBeAssigned);
        case 3:
          return cases.concat(this.$store.state.closersToBeAssigned);
        case 4:
          return cases.concat(this.$store.state.ownersToBeAssigned);
        default:
          return cases;
      }
    }
  },
  methods: {
    onChange(item) {
      this.$emit("input", item);
      this.$emit("change", item);
    }
  }
};
</script>

<style lang="scss" scoped></style>
