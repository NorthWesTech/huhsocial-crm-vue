<template>
  <v-card class="elevation-3">
    <v-card-title class="justify-space-between">
      <label>
        <i class="fa fa-list"></i> Referred Influencers
        <span v-if="totalCount" style="font-size:14px;color:#666;">
          Showing <strong style="color: #1976d2;">{{ totalCount }}</strong> records
        </span>
      </label>
      <div class="d-flex align-center v-input-table-wrapper" style="width:50%">
        <v-text-field
          v-model="searchClue"
          dense
          outlined
          append-icon="mdi-magnify"
          label="Search"
          class="mr-2"
          style="width:33%"
          @input="debouncedQuery"
        ></v-text-field>
        <user-select
          v-if="$auth.user.role === 1"
          v-model="assignedto"
          :roles="2"
          :filter-cases="assignFilterCases"
          class="mr-2"
        />
        <v-select
          v-model="contractStatus"
          :items="contractFilterStatuses"
          item-text="label"
          dense
          outlined
          style="width:33%"
        ></v-select>
      </div>
    </v-card-title>
    <v-card-text>
      <v-data-table
        :options.sync="options"
        :loading="loading"
        :headers="headers"
        :items="influencers"
        :items-per-page="20"
        hide-default-footer
        class="elevation-0 mb-3"
      >
        <template #[`item.influencerName`]="{ item }">
          <nuxt-link :to="{ name: 'influencers-profile-id', params: { id: item.id } }">
            {{ `${item.firstName} ${item.lastName}` }}
          </nuxt-link>
        </template>
        <template #[`item.referredByUser`]="{ item }">
          <nuxt-link :to="{ name: 'influencers-profile-id', params: { id: item.referredBy } }">
            {{ item.referredByUser }}
          </nuxt-link>
        </template>
        <template #[`item.createdAt`]="{ item }">
          <span class="d-block">{{ $dayjs(item.createdAt).format("DD.MM.YYYY") }}</span>
          <span style="font-size:12px; color:#666">{{ $dayjs(item.createdAt).format("HH:mm A") }}</span>
        </template>
        <template #[`item.assignedto`]="{ item }">
          <div v-if="$auth.user.role === 1" class="v-select-table-wrapper">
            <user-select v-model="item.assignedto" :roles="2" @change="changeAssignedUser(item.id, item.assignedto)" />
          </div>
          <span v-else>{{ findAssignedUser(item.assignedto) }}</span>
        </template>
        <template #[`item.contractStatus`]="{ item }">
          <div v-if="!item.readonly" class="v-select-table-wrapper">
            <contract-status-select
              v-model="item.contractStatus"
              :influencer="item"
              :contract-statuses="contractStatuses"
              @change="getInfluencerList"
            />
          </div>
          <span v-else>{{ findStatusByValue(contractStatuses, item.contractStatus) }}</span>
        </template>
      </v-data-table>
      <v-pagination v-model="paginateNum" :length="totalPageNum" :total-visible="7"></v-pagination>
    </v-card-text>
  </v-card>
</template>

<script>
import config from "@/config";
import { debounce } from "lodash";
import RouteHelper from "@/utils/route-helper";
import UserSelect from "@/components/UserSelect.vue";
import ContractStatusSelect from "@/components/ContractStatusSelect.vue";

export default {
  components: { UserSelect, ContractStatusSelect },
  data() {
    return {
      influencers: [],
      assignFilterCases: config.assignFilterCases,
      contractFilterStatuses: [{ label: "All Statuses", value: -1 }, ...config.contractStatuses],
      contractStatus: 0,
      waitingToBeContacted: undefined,
      totalPageNum: 0,
      paginateNum: 1,
      searchClue: "",
      loading: false,
      tempDateTime: new Date(),
      dialog: false,
      options: {},
      assignedto: -1,
      totalCount: 0
    };
  },
  async fetch() {
    await this.getInfluencerList();
  },
  computed: {
    assignedToCases() {
      return config.assignedToCases.concat(this.$store.state.usersToBeAssigned);
    },
    contractStatuses() {
      const { role } = this.$auth.user;

      return config.contractStatuses.map(status => {
        return {
          ...status,
          disabled: role && !status.roles.includes(role)
        };
      });
    },
    headers() {
      let headers = [
        { text: "Influencer Name", value: "influencerName", sortable: false },
        { text: "Referred By", value: "referredByUser", sortable: false },
        {
          text: "Created Date",
          value: "createdAt",
          sortable: true,
          align: "center"
        },
        {
          text: "Contract Status",
          value: "contractStatus",
          sortable: false,
          align: "center",
          width: 250
        }
      ];

      if (this.$auth.user.role === 1)
        headers.splice(3, 0, {
          text: "Opener",
          value: "assignedto",
          sortable: false,
          align: "center",
          width: 250
        });

      return headers;
    }
  },
  watch: {
    $route() {
      this.getInfluencerList();
    },
    paginateNum() {
      this.navigate();
    },
    options() {
      this.navigate();
    },
    assignedto() {
      this.navigate();
    },
    contractStatus() {
      this.navigate();
    }
  },
  created() {
    this.setParameters();
  },
  methods: {
    debouncedQuery: debounce(function() {
      if (this.paginateNum === 1) {
        this.navigate();
        return;
      }
      this.paginateNum = 1;
    }, 500),
    navigate() {
      const search = this.searchClue;
      const page = this.paginateNum;
      const assignedto = this.assignedto;
      const contractStatus = this.contractStatus;
      const sortBy = this.options.sortBy.length ? this.options.sortBy[0] : null;
      const sortDirection = this.options.sortBy.length && this.options.sortDesc[0] ? "DESC" : "ASC";

      let query = "#";
      if (page) {
        query += `page=${page}&`;
      }
      if (search != "") {
        query += `search=${search}&`;
      }
      if (assignedto && assignedto !== -1) {
        query += `assignedto=${assignedto}&`;
      }
      if ((contractStatus || contractStatus === 0) && contractStatus !== -1) {
        query += `filter=${contractStatus}&`;
      }
      if (sortBy) {
        query += `sortBy=${sortBy}&`;
      }
      if (sortBy && sortDirection) {
        query += `sortDirection=${sortDirection}&`;
      }
      if (query != "") {
        query = query.slice(0, -1);
      }
      this.$router.push({
        path: `/referred-influencers${query}`
      });
    },
    async changeAssignedUser(id, user) {
      await this.$influencerService.changeAssignedUser({
        id,
        user
      });
      this.getInfluencerList();
    },
    findStatusByValue(statuses, value) {
      let found = statuses.find(function(status) {
        if (status.value === value) {
          return status;
        }
      });
      if (found) {
        return found.label;
      } else {
        return "-";
      }
    },
    findAssignedUser(value) {
      const user = this.assignedToCases.find(user => user.value === value);
      return user ? user.label : "-";
    },
    async getInfluencerList() {
      this.loading = true;
      let data = {
        searchClue: this.searchClue,
        paginateNum: this.paginateNum,
        hasReferred: true,
        from: "referred",
        assignedto: this.assignedto,
        filter: this.contractStatus,
        role: this.$auth.user.role,
        user_id: this.$auth.user.id,
        sortBy: this.options.sortBy?.length ? this.options.sortBy[0] : null,
        sortDirection: this.options.sortBy?.length && this.options.sortDesc[0] ? "DESC" : "ASC"
      };
      try {
        const result = await this.$influencerService.list(data);
        if (result && result.list) {
          this.totalPageNum = Math.floor(result.count / 20) + 1;
          this.totalCount = result.count;
          this.influencers = result.list;
          this.loading = false;
        }
      } catch (error) {
        console.log(error);
      }
    },
    setParameters() {
      const params = RouteHelper.getHashParams(this.$route);
      this.searchClue = Object.prototype.hasOwnProperty.call(params, "search") ? params.search : "";
      this.paginateNum = Object.prototype.hasOwnProperty.call(params, "page") ? Number(params.page) : 1;
      this.sortBy = Object.prototype.hasOwnProperty.call(params, "sortBy") ? params.sortBy : "";
      this.sortDirection = Object.prototype.hasOwnProperty.call(params, "sortDirection") ? params.sortDirection : "";
      this.assignedto = Object.prototype.hasOwnProperty.call(params, "assignedto") ? params.assignedto : -1;
      this.contractStatus = Object.prototype.hasOwnProperty.call(params, "filter") ? Number(params.filter) : 0;
    }
  }
};
</script>

<style lang="scss">
.v-select-table-wrapper {
  padding: 8px 0;
  .v-text-field__details {
    display: none !important;
  }
}

.v-input-table-wrapper {
  .v-text-field__details {
    display: none !important;
  }
}
</style>
