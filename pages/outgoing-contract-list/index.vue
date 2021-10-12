<template>
    <v-container>
        <contract-filter class="mb-4" v-model="filter" />
        <contract-list ref="contractList" :filter="filter" />
    </v-container>
</template>

<script>
import contractFilter from "@/components/contracts/contractFilter.vue";
import contractList from "@/components/contracts/contractList.vue";

export default {
  components: {
    contractFilter,
    contractList
  },
  data() {
    return {
      filter: {}
    };
  }
};
</script>