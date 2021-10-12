<template>
  <div class="boxes-container">
    <v-card
      v-for="item in contractStatusBoxes"
      :key="item.value"
      :color="item.color"
      dark
      class="elevation-2"
      :class="{ active: item.value === value }"
      @click="$emit('onSelectFilter', item)"
    >
      <v-card-title class="headline">
        {{ item.count ? item.count.total : 0 }}
      </v-card-title>
      <v-card-text>
        <strong>{{ item.title }}</strong>
        <i class="card-icon fa" :class="item.icon"></i>
      </v-card-text>

      <v-card-actions>
        <v-row class="mx-auto">
          <v-icon class="mr-1">mdi-account-circle</v-icon>
          <span class="subheading mr-2">{{ item.count ? item.count.influencers : 0 }}</span>
          <v-icon class="mr-1">mdi-city</v-icon>
          <span class="subheading">{{ item.count ? item.count.agencies : 0 }}</span>
        </v-row>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  props: ["stats", "value"],
  computed: {
    contractStatusBoxes() {
      const stats = this.stats;
      const contractStatuses = [
        {
          icon: "fa-users",
          color: "pink",
          count: stats.total,
          order: 1,
          title: "Registered",
          value: -1
        },
        {
          icon: "fa-share",
          color: "purple",
          count: stats.referred,
          order: 2,
          title: "Referred",
          value: 1
        },
        {
          icon: "fa-remove",
          color: "orange",
          count: stats.rejected,
          order: 3,
          title: "Rejected",
          value: 6
        },
        {
          icon: "fa-clock-o",
          color: "blue",
          count: stats.waiting,
          order: 4,
          title: "Waiting to be contacted",
          value: 0
        },
        {
          icon: "fa-tint",
          color: "#009688",
          count: stats.responseawaiting,
          order: 5,
          title: "Contacted / Awaiting response",
          value: 9
        },
        {
          icon: "fa-handshake-o",
          color: "brown",
          count: stats.contacted,
          order: 6,
          title: "Contacted / Pitch booked",
          value: 7
        },
        {
          icon: "fa-bookmark",
          color: "red",
          count: stats.toRebook,
          order: 7,
          title: "Didn't attend pitch / To be re-booked",
          value: 2
        },
        {
          icon: "fa-user-times",
          color: "grey",
          count: stats.disappeared,
          order: 8,
          title: "Non Contactable / Disappeared",
          value: 3
        },
        {
          icon: "fa-thumbs-o-up",
          color: "green",
          count: stats.signed,
          order: 9,
          title: "Contract Signed",
          value: 4
        },
        {
          icon: "fa-thumbs-o-down",
          color: "black",
          count: stats.notSigned,
          order: 10,
          title: "Contract Not Signed",
          value: 5
        },
        {
          icon: "fa-minus-square",
          color: "#555b6e",
          count: stats.dead,
          order: 11,
          title: "Dead",
          value: 11
        },
        {
          icon: "fa-calendar-times-o",
          color: "#9a031e",
          count: stats.cancelled,
          order: 12,
          title: "Cancelled Contract",
          value: 12
        }
      ];

      return contractStatuses.sort((a, b) => a.order - b.order);
    }
  },
  methods: {
    getStatusByValue(value) {
      return this.contractStatusBoxes.find(f => f.value === value);
    }
  }
};
</script>

<style lang="scss" scoped>
.boxes-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); //repeat(3, 1fr);
  grid-gap: 1rem;
}
</style>
