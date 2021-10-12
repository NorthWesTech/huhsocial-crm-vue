<template>
  <v-layout column>
    <h1 class="mb-2">
      Influencers
    </h1>
    <v-card class="elevation-2 mb-2">
      <v-card-text>
        <v-row class="filter">
          <v-col cols="12" md="6">
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
            <user-select v-model="assignedto" :roles="2" :filter-cases="assignFilterCases" @change="callback" />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="influencerType"
              :items="influencerTypes"
              item-text="label"
              item-value="value"
              auto-select-first
              outlined
              dense
              class="no-padding"
              @change="callback"
            ></v-select>
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
        v-if="assignedto != -1 && assignedToCases.find(f => f.value === assignedto)"
        class="ma-2"
        close
        @click:close="
          assignedto = -1;
          callback();
        "
      >
        {{ assignedToCases.find(f => f.value === assignedto).label }}
      </v-chip>
      <v-chip
        v-if="influencerType != -1 && influencerTypes.find(f => f.value === influencerType)"
        class="ma-2"
        close
        @click:close="
          influencerType = -1;
          callback();
        "
      >
        {{ influencerTypes.find(f => f.value === influencerType).label }}
      </v-chip>
    </div>
    <v-card class="elevation-2">
      <v-card-title>
        <div class="d-flex justify-space-between" style="width:100%">
          <label>
            <i class="fa fa-list"></i> Influencer List
            <span v-if="totalCount" style="font-size:14px;color:#666;"
              >Showing
              <strong style="color: #1976d2;">{{ totalCount }}</strong>
              records</span
            >
          </label>
        </div>
      </v-card-title>
      <v-card-text>
        <InfluencerTable
          :headers="headers"
          :items="influencers"
          :loading="loading"
          :total-page-num="totalPageNum"
          :from="'influencers'"
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

import { debounce } from "lodash";

export default {
  components: {
    InfluencerTable,
    UserSelect
  },
  data() {
    return {
      loading: false,
      influencers: [],
      deleteId: null,
      influencerTypes: [{ label: "All Types", value: -1 }, ...config.influencerTypes],
      searchClue: "",
      paginateNum: 1,
      assignedto: -1,
      assignFilterCases: config.assignFilterCases,
      influencerType: -1,
      totalPageNum: 0,
      totalCount: 0,
      deleteItem: null,
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
          text: "Contract Status",
          value: "contractStatus",
          sortable: false,
          align: "center",
          width: 250
        },
        {
          text: "Actions",
          value: "action",
          align: "center",
          sortable: true
        }
      ]
    };
  },
  computed: {
    assignedToCases() {
      return config.assignedToCases
        .concat(this.$store.state.usersToBeAssigned)
        .concat(this.$store.state.closersToBeAssigned);
    }
  },
  watch: {
    $route() {
      this.getInfluencers();
    }
  },
  created() {
    this.setParameters();
  },
  async mounted() {
    this.getInfluencers();
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
    navigate() {
      const search = this.searchClue;
      const page = this.paginateNum;
      const sortBy = this.sortBy;
      const sortDirection = this.sortDirection;
      const assignedto = this.assignedto;
      const influencerType = this.influencerType;

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
      if (assignedto && assignedto != -1) {
        query += `assignedto=${assignedto}&`;
      }
      if (influencerType && influencerType != -1) {
        query += `influencerType=${influencerType}&`;
      }
      if (query != "") {
        query = query.slice(0, -1);
      }
      this.$router.push({
        path: `/influencers${query}`
      });
    },
    setParameters() {
      const params = RouteHelper.getHashParams(this.$route);
      this.searchClue = params["search"] ? params.search : "";
      this.paginateNum = params["page"] ? Number(params.page) : 1;
      this.sortBy = params["sortBy"] ? params.sortBy : "";
      this.sortDirection = params["sortDirection"] ? params.sortDirection : "";
      this.assignedto = params["assignedto"] ? params.assignedto : -1;
      this.influencerType = params["influencerType"] ? Number(params.influencerType) : -1;
    },
    callback() {
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
          paginateNum: this.paginateNum,
          searchClue: this.searchClue.toLowerCase(),
          assignedto: this.assignedto,
          influencerType: this.influencerType,
          filter: -1,
          role: this.$auth.user.role,
          user_id: this.$auth.user.id,
          from: "influencers",
          sortBy: this.sortBy,
          sortDirection: this.sortDirection
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
.v-main__wrap {
  background: #f5f5f5;
}
.v-text-field__details {
  display: none !important;
}
</style>
