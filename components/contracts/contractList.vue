<template>
  <v-card class="elevation-3">
    <v-card-title class="justify-space-between">
      <label>
        <i class="mdi mdi-list"></i> Contract List
      </label>
      <div class="d-flex align-center" style="width:50%">
        <v-text-field small v-model="search" @input="debouncedQuery" append-icon="mdi-magnify"
                      label="Search"></v-text-field>
        <v-btn-toggle mandatory class="ml-2" v-model="selectedStatus" borderless>
          <v-btn small v-for="(item, i) in statuses" :key="i" :value="item.value">
            {{item.text}}
          </v-btn>
        </v-btn-toggle>
      </div>
    </v-card-title>
    <v-card-text>
      <v-data-table :options.sync="options" :loading="loading" :headers="headers" hide-default-footer
                    :items="contractList" :items-per-page="20" class="elevation-0">
        <template v-slot:item.influencer_name="{ item }">
          <nuxt-link :to="{ name: 'influencers-profile-id', params: { id: item.influencer_id }}">
            {{ item.influencer_name }}
            <i class="mdi mdi-open-in-new"></i>
          </nuxt-link>
        </template>
        <template v-slot:item.user_fullname="{ item }">
          <span v-if="item.user_fullname"> {{ item.user_fullname }}</span>
          <span v-else>-</span>
        </template>
        <template v-slot:item.contractStatus="{ item }">
          <v-chip small text-color="white" :color="filterContractStatus(item.contractStatus).color">
            {{ filterContractStatus(item.contractStatus).label }}
          </v-chip>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip small color="orange" text-color="white" v-if="item.status=='Pending'"> {{ item.status }}</v-chip>
          <v-chip small color="green" text-color="white" v-if="item.status=='Signed'"> {{ item.status }}</v-chip>
        </template>
        <template v-slot:item.sent_date="{ item }">
          <span class="d-block">{{$dayjs(item.sent_date).format('DD.MM.YYYY')}}</span>
          <span style="font-size:12px; color:#666">{{$dayjs(item.sent_date).format('HH:mm A')}}</span>
        </template>
        <template v-slot:item.signed_date="{ item }">
          <span v-if="item.signed_date" class="d-block">{{$dayjs(item.signed_date).format('DD.MM.YYYY')}}</span>
          <span v-if="item.signed_date" style="font-size:12px; color:#666">{{$dayjs(item.signed_date).format('HH:mm A')}}</span>
        </template>
      </v-data-table>
      <v-pagination v-model="page" :length="pageCount"></v-pagination>
    </v-card-text>
  </v-card>
</template>

<script>
  import config from "@/config";
  import {debounce} from "lodash";

  export default {
    props: ["filter"],
    data() {
      return {
        contractStatuses: config.contractStatuses,
        search: "",
        page: 1,
        pageCount: 0,
        options: {},
        loading: false,
        selectedStatus: -1,
        statuses: [
          {
            text: "All",
            value: -1
          },
          {
            text: "Pending",
            value: 1
          },
          {
            text: "Signed",
            value: 2
          }
        ],
        headers: [
          {text: "Influencer", value: "influencer_name", sortable: true},
          {text: "Dashboard Status", value: "contractStatus", sortable: false},
          {text: "Document Status", value: "status", align: "center", sortable: false},
          {
            text: "User",
            value: "user_fullname",
            sortable: false,
            align: "center"
          },
          {
            text: "Sent Date",
            value: "sent_date",
            align: "center",
            sortable: true
          },
          {
            text: "Signed Date",
            value: "signed_date",
            align: "center",
            sortable: true
          }
        ],
        contractList: []
      };
    },
    watch: {
      selectedStatus() {
        this.getInfluencerTemplates();
      },
      filter() {
        this.getInfluencerTemplates();
      },
      page() {
        this.getInfluencerTemplates();
      },
      options() {
        this.getInfluencerTemplates();
      }
    },
    methods: {
      async getInfluencerTemplates() {
        this.loading = true;
        const selectedDate = this.filter.selectedDate
          ? this.filter.selectedDate
          : null;
        const contractStatus = this.filter.selectedContractStatus;
        const data = {
          searchClue: this.search.length ? this.search : null,
          status_flag: this.selectedStatus != -1 ? this.selectedStatus : null,
          template_flag: this.filter.selectedType,
          startDate: selectedDate ? selectedDate.startDate : null,
          endDate: selectedDate ? selectedDate.endDate : null,
          contractStatus: (contractStatus || contractStatus === 0) && contractStatus !== -1 ? contractStatus : null,
          paginateNum: this.page,
          sortBy: this.options.sortBy.length ? this.options.sortBy[0] : null,
          sortDirection:
            this.options.sortBy.length && this.options.sortDesc[0]
              ? "DESC"
              : "ASC"
        };

        const url = `${config.msLandingUrl}/templates/findInfluencerTemplates`;
        const res = await this.$axios.get(url, {params: data});
        if (res) {
          this.contractList = res.data[0];
          this.pageCount = Math.floor(res.data[1] / 20) + 1;
        }
        this.loading = false;
      },
      debouncedQuery: debounce(function () {
        this.getInfluencerTemplates();
      }, 500),
      filterContractStatus(status) {
        return this.contractStatuses.find(x => x.value === status)
      }
    },
    mounted() {
      this.getInfluencerTemplates();
    }
  };
</script>
