<template>
  <v-card class="elevation-3">
    <v-card-title>
      <i class="mdi mdi-filter"></i> Filter
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col cols="8" md="4">
            <v-select item-text="label" item-value="value" v-model="selectedType" :items="templateTypes" label="Contract Type" outlined></v-select>
          </v-col>
          <v-col cols="8" md="4">
            <v-select item-text="label" item-value="value" v-model="selectedDate" :items="dateRanges" label="Select Date" outlined></v-select>
          </v-col>
          <v-col cols="8" md="4">
            <v-select item-text="label" item-value="value" v-model="selectedContractStatus" :items="contractStatuses" label="Select Status" outlined></v-select>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import config from "@/config";
export default {
  data() {
    return {
      selectedType: 1,
      templateTypes: config.templatesType,
      selectedDate: { label: "All", value: "-1" },
      dateRanges: [{ label: "All", value: "-1" }],
      contractStatuses: [{ label: "All", value: -1 }, ...config.contractStatuses],
      selectedContractStatus: -1,
    };
  },
  watch: {
    selectedType() {
      this.onInput();
    },
    selectedDate() {
      this.onInput();
    },
    selectedContractStatus() {
      this.onInput();
    }
  },
  methods: {
    onInput() {
      this.$emit("input", {
        selectedType: this.selectedType,
        selectedDate: this.selectedDate,
        selectedContractStatus: this.selectedContractStatus
      });
    },
    handleDateList() {
      const dateList = [
        {
          label: "Today",
          value: {
            startDate: this.$dayjs()
              .startOf("day")
              .format("YYYY-MM-DD"),
            endDate: this.$dayjs()
              .endOf("day")
              .format("YYYY-MM-DD")
          }
        },
        {
          label: "Last 2 Days",
          value: {
            startDate: this.$dayjs()
              .subtract("2", "day")
              .startOf("day")
              .format("YYYY-MM-DD"),
            endDate: this.$dayjs()
              .endOf("day")
              .format("YYYY-MM-DD")
          }
        },
        {
          label: "Last 3 Days",
          value: {
            startDate: this.$dayjs()
              .subtract("3", "day")
              .startOf("day")
              .format("YYYY-MM-DD"),
            endDate: this.$dayjs()
              .endOf("day")
              .format("YYYY-MM-DD")
          }
        },
        {
          label: "This Week",
          value: {
            startDate: this.$dayjs()
              .startOf("week")
              .format("YYYY-MM-DD"),
            endDate: this.$dayjs()
              .endOf("week")
              .format("YYYY-MM-DD")
          }
        },
        {
          label: "This Month",
          value: {
            startDate: this.$dayjs()
              .startOf("month")
              .format("YYYY-MM-DD"),
            endDate: this.$dayjs()
              .endOf("month")
              .format("YYYY-MM-DD")
          }
        }
      ];
      // this.selectedDate = dateList[0];
      this.dateRanges.push(...dateList);
    }
  },
  created() {
    this.handleDateList();
    this.onInput();
  }
};
</script>
