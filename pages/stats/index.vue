<template>
  <v-card class="elevation-3">
    <v-card-title class="justify-space-between">
      <label> <i class="fa fa-list"></i> Statistics </label>
    </v-card-title>
    <v-card-text>
      <v-data-table
        v-if="this.$auth.user.role === 1"
        :loading="loading"
        :headers="headers"
        :items="stats"
        hide-default-footer
        disable-pagination
        class="elevation-0 mb-3"
      >
        <template #[`item.fullname`]="{ item }">
          <span style="color:#2196F3">{{ item.fullname }}</span>
        </template>
        <template #[`item.mon`]="{ item }">{{ item.mon ? item.mon : "-" }}</template>
        <template #[`item.tue`]="{ item }">{{ item.tue ? item.tue : "-" }}</template>
        <template #[`item.wed`]="{ item }">{{ item.wed ? item.wed : "-" }}</template>
        <template #[`item.thu`]="{ item }">{{ item.thu ? item.thu : "-" }}</template>
        <template #[`item.fri`]="{ item }">{{ item.fri ? item.fri : "-" }}</template>
        <template #[`item.sat`]="{ item }">{{ item.sat ? item.sat : "-" }}</template>
        <template #[`item.sun`]="{ item }">{{ item.sun ? item.sun : "-" }}</template>
        <template #[`item.totalPitches`]="{ item }">
          <span :style="{ color: getColorByStatusValue(5) }">{{ item.totalPitches ? item.totalPitches : "-" }}</span>
        </template>
        <template #[`item.totalReferrals`]="{ item }">
          <span :style="{ color: getColorByStatusValue(0) }">{{
            item.totalReferrals ? item.totalReferrals : "-"
          }}</span>
        </template>
        <template #[`item.totalContracts`]="{ item }">
          <span :style="{ color: getColorByStatusValue(4) }">{{
            item.totalContracts ? item.totalContracts : "-"
          }}</span>
        </template>
      </v-data-table>
      <v-data-table
        v-else
        :loading="loading"
        :headers="userHeaders"
        :items="userStats"
        hide-default-footer
        disable-pagination
        class="elevation-0 mb-3"
      >
        <template #[`item.status`]="{ item }">
          <span :style="{ color: getColorByStatusValue(item.status) }">{{ getStatusHeader(item.status) }}</span>
        </template>
        <template #[`item.mon`]="{ item }">{{ item.mon ? item.mon : "-" }}</template>
        <template #[`item.tue`]="{ item }">{{ item.tue ? item.tue : "-" }}</template>
        <template #[`item.wed`]="{ item }">{{ item.wed ? item.wed : "-" }}</template>
        <template #[`item.thu`]="{ item }">{{ item.thu ? item.thu : "-" }}</template>
        <template #[`item.fri`]="{ item }">{{ item.fri ? item.fri : "-" }}</template>
        <template #[`item.sat`]="{ item }">{{ item.sat ? item.sat : "-" }}</template>
        <template #[`item.sun`]="{ item }">{{ item.sun ? item.sun : "-" }}</template>
        <template #[`item.total`]="{ item }">
          <span style="font-weight:bold">{{ item.total ? item.total : "-" }}</span>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import moment from "moment";
import config from "@/config";

export default {
  data() {
    return {
      loading: false,
      stats: [],
      headers: [
        { text: "Full Name", value: "fullname" },
        { text: "Monday", value: "mon" },
        { text: "Tuesday", value: "tue" },
        { text: "Wednesday", value: "wed" },
        { text: "Thursday", value: "thu" },
        { text: "Friday", value: "fri" },
        { text: "Saturday", value: "sat" },
        { text: "Sunday", value: "sun" },
        { text: "Total Pitches", value: "totalPitches" },
        { text: "Total Referrals", value: "totalReferrals" },
        { text: "Total Contracts", value: "totalContracts" }
      ],
      userStats: [],
      userHeaders: [
        { text: "Status", value: "status" },
        { text: "Monday", value: "mon" },
        { text: "Tuesday", value: "tue" },
        { text: "Wednesday", value: "wed" },
        { text: "Thursday", value: "thu" },
        { text: "Friday", value: "fri" },
        { text: "Saturday", value: "sat" },
        { text: "Sunday", value: "sun" },
        { text: "Total", value: "total" }
      ],
      statusesMap: {
        0: "Referrals",
        4: "Contracts",
        5: "Pitches"
      }
    };
  },
  async fetch() {
    this.$auth.user.role === 1 ? await this.getAllUsersStats() : await this.getStatsByUser();
  },
  methods: {
    async getAllUsersStats() {
      this.loading = true;
      try {
        const today = moment();
        const fromDate = moment(today.startOf("isoWeek")).format("yyyy-MM-DD");
        const toDate = moment(today.endOf("isoWeek")).format("yyyy-MM-DD");
        this.stats = await this.$userService.getAllUsersStats(fromDate, toDate);
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async getStatsByUser() {
      this.loading = true;
      try {
        const today = moment();
        const fromDate = moment(today.startOf("isoWeek")).format("yyyy-MM-DD");
        const toDate = moment(today.endOf("isoWeek")).format("yyyy-MM-DD");
        const statsResult = await this.$influencerService.getStatsByUser(this.$auth.user.id, fromDate, toDate);
        this.userStats = statsResult.stats;
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    getColorByStatusValue(value) {
      return config.contractStatuses.find(status => status.value === value).color;
    },
    getStatusHeader(status) {
      return this.statusesMap[status];
    }
  }
};
</script>
