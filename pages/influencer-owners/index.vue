<template>
  <v-layout column>
    <h1 class="mb-2">Influencer Owners</h1>
    <v-card class="elevation-2 mb-2">
      <v-card-text>
        <v-row class="filter" justify="start">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchClue"
              small
              placeholder="Search by name, email or phone number"
              append-icon="mdi-magnify"
              class="pt-0"
              outlined
              dense
              @input="debouncedQuery"
            ></v-text-field>
          </v-col>
          <v-col v-if="$auth.user.role === 1" cols="12" md="3">
            <user-select v-model="ownerFilter" :roles="4" :filter-cases="ownerFilterCases" @change="callback" />
          </v-col>
          <v-col cols="12" md="2">
            <card-received-select
              v-model="cardReceivedFilter"
              :filter-cases="cardReceivedFilterCases"
              @change="onChangeCardReceived"
            />
          </v-col>
          <v-col cols="12" md="3" class="text-right" style="margin-left: auto">
            <v-btn tile :to="{ name: 'influencer-owners-content-posting' }">
              <v-icon left>mdi-folder-table-outline</v-icon>
              Content Posting Table
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <div class="mb-2">
      <v-chip
        v-if="searchClue"
        class="ma-2"
        close
        @click:close="
          searchClue = '';
          debouncedQuery();
        "
      >
        {{ searchClue }}
      </v-chip>
      <v-chip
        v-if="ownerFilter != -1 && ownerFilterCases.find(f => f.value === ownerFilter)"
        class="ma-2"
        close
        @click:close="
          ownerFilter = -1;
          callback();
        "
      >
        {{ ownerFilterCases.find(f => f.value === ownerFilter).label }}
      </v-chip>
    </div>
    <v-card class="elevation-2">
      <v-card-title>
        <div class="d-flex justify-space-between" style="width: 100%">
          <label>
            <i class="fa fa-list"></i> Influencers
            <span v-if="totalCount" style="font-size: 14px; color: #666"
              >Showing
              <strong style="color: #1976d2">{{ totalCount }}</strong>
              records</span
            >
          </label>
        </div>
      </v-card-title>
      <v-card-text>
        <InfluencerTable
          :headers="computedHeaders"
          :items="influencers"
          :loading="loading"
          :total-page-num="totalPageNum"
          :from="'owner'"
          @onChangeOptions="onChangeOptions"
          @refreshData="refreshData"
        />
      </v-card-text>
    </v-card>
  </v-layout>
</template>
<script>
import config from "@/config";
import RouteHelper from "@/utils/route-helper";
import InfluencerTable from "@/components/InfluencerTable";
import UserSelect from "@/components/UserSelect.vue";
import CardReceivedSelect from "@/components/CardReceivedSelect.vue";

import { debounce } from "lodash";

export default {
  components: {
    InfluencerTable,
    UserSelect,
    CardReceivedSelect
  },
  data() {
    return {
      loading: false,
      showDatePicker: false,
      influencers: [],
      searchClue: "",
      paginateNum: 1,
      ownerFilter: -1,
      ownerFilterCases: config.ownerFilterCases,
      totalPageNum: 0,
      totalCount: 0,
      cardReceivedFilter: -1,
      cardReceivedFilterCases: config.cardReceivedFilterCases,
      headers: [
        {
          text: "Influencer Name",
          value: "firstName",
          sortable: false
        },
        {
          text: "Created Date",
          value: "createdAt",
          align: "center",
          sortable: true
        },
        {
          text: "Opener",
          value: "assignedto",
          sortable: false,
          align: "center",
          width: 250
        },
        {
          text: "Owner",
          value: "owner",
          sortable: false,
          align: "center",
          width: 250
        },
        {
          text: "Card Received",
          value: "cardReceived",
          sortable: false,
          align: "center",
          width: 250
        }
      ]
    };
  },
  computed: {
    computedHeaders() {
      if (this.$auth.user.role === 1) {
        return this.headers;
      }

      return this.headers.filter(f => f.value != "owner");
    }
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    $route(to, from) {
      this.getInfluencers();
    }
  },
  mounted() {
    this.getInfluencers();
  },
  created() {
    this.setParameters();
  },
  methods: {
    refreshData() {
      this.getInfluencers();
    },
    debouncedQuery: debounce(function() {
      if (this.paginateNum === 1) {
        this.navigate();
        return;
      }
      this.paginateNum = 1;
    }, 500),
    onChangeOptions(options) {
      this.paginateNum = options.page;
      this.sortBy = options.sortBy;
      this.sortDirection = options.sortDirection;
      this.navigate();
    },
    allowedPostingDates(val) {
      return new Date(val).getDay() === 1;
    },
    navigate() {
      const search = this.searchClue;
      const page = this.paginateNum;
      const sortBy = this.sortBy;
      const sortDirection = this.sortDirection;
      const owner = this.ownerFilter;
      const cardReceived = this.cardReceivedFilter;

      let query = "#";
      if (page) {
        query += `page=${page}&`;
      }
      if (search != "") {
        query += `search=${search}&`;
      }
      if (sortBy) {
        query += `sortBy=${sortBy}&`;
      }
      if (sortBy && sortDirection) {
        query += `sortDirection=${sortDirection}&`;
      }
      if (owner && owner !== -1) {
        query += `owner=${owner}&`;
      }
      if (cardReceived !== -1) {
        query += `cardReceived=${cardReceived}&`;
      }
      if (query != "") {
        query = query.slice(0, -1);
      }
      this.$router.push({
        path: `/influencer-owners${query}`
      });
    },
    setParameters() {
      const params = RouteHelper.getHashParams(this.$route);
      this.searchClue = params["search"] ? params.search : "";
      this.paginateNum = params["page"] ? Number(params.page) : 1;
      this.sortBy = params["sortBy"] ? params.sortBy : "";
      this.sortDirection = params["sortDirection"] ? params.sortDirection : "";
      this.ownerFilter = params["owner"] ? params.owner : -1;
      this.cardReceivedFilter = params["cardReceived"] ? params.cardReceived === "true" : -1;
    },
    callback() {
      if (this.paginateNum === 1) {
        this.navigate();
        return;
      }
      this.paginateNum = 1;
    },
    onChangeCardReceived() {
      if (this.paginateNum === 1) {
        this.navigate();
        return;
      }
      this.paginateNum = 1;
    },
    async getInfluencers() {
      this.loading = true;

      try {
        const data = {
          filter: 4, // Contract Signed
          paginateNum: this.paginateNum,
          searchClue: this.searchClue.toLowerCase(),
          influencerType: 1,
          owner: this.ownerFilter,
          role: this.$auth.user.role,
          user_id: this.$auth.user.id,
          from: "owner",
          sortBy: this.sortBy,
          sortDirection: this.sortDirection,
          cardReceived: this.cardReceivedFilter
        };
        const result = await this.$influencerService.list(data);
        if (result) {
          this.totalPageNum = Math.floor(result.count / 20) + 1;
          this.influencers = result.list;
          this.totalCount = result.count;
          this.loading = false;
        }
      } catch (error) {
        console.log(error.response);
      }
    }
  }
};
</script>
<style lang="scss">
.row.filter {
  justify-content: space-between;
}
.v-main__wrap {
  background: #f5f5f5;
}
.v-text-field__details {
  display: none !important;
}
</style>
