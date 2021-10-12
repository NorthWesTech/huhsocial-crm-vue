<template>
  <v-container>
    <h2>Closing Team</h2>
    <div class="boxes-container mt-3 mb-3">
      <v-card color="pink" dark class="elevation-2" :class="{ active: filterType == -1 }" @click="filterType = -1">
        <v-card-title class="headline">
          {{ stats.total }}
        </v-card-title>
        <v-card-text>
          <strong>Total</strong>
          <i class="card-icon fa fa-users"></i>
        </v-card-text>
      </v-card>
      <v-card
        :color="item.extra.color"
        dark
        class="elevation-2"
        v-for="item in closerStatusBoxes"
        :key="item.value"
        :class="{ active: item.value === filterType }"
        @click="filterType = item.value"
      >
        <v-card-title class="headline">
          {{ item.extra.count }}
        </v-card-title>
        <v-card-text>
          <strong>{{ item.label }}</strong>
          <i class="card-icon fa" :class="item.extra.icon"></i>
        </v-card-text>
      </v-card>
    </div>
    <v-card class="elevation-3">
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
          <div class="d-flex align-center v-input-table-wrapper" style="width:50%">
            <v-text-field
              v-model="searchClue"
              dense
              outlined
              append-icon="mdi-magnify"
              label="Search"
              class="mr-2"
              style="width:50%"
              @input="debouncedQuery"
            ></v-text-field>
            <user-select
              v-if="$auth.user.role === 1"
              v-model="closerFilter"
              :roles="3"
              :filter-cases="closerFilterCases"
              style="width:50%;margin-right:5px;"
            />
            <user-select v-model="assignedtoFilter" :roles="2" :filter-cases="assignFilterCases" />
          </div>
        </div>
        <div>
          <v-chip v-if="filterType != -1" class="ma-2" close @click:close="filterType = -1">
            {{ closerStatuses.find(f => f.value === filterType).label }}
          </v-chip>
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
          <template v-slot:[`item.influencerName`]="{ item }">
            <nuxt-link :to="{ name: 'influencers-profile-id', params: { id: item.id } }">
              {{ `${item.firstName} ${item.lastName}` }}
            </nuxt-link>
          </template>
          <template v-slot:[`item.createdAt`]="{ item }">
            <span class="d-block">{{ $dayjs(item.createdAt).format("DD.MM.YYYY") }}</span>
            <span style="font-size:12px; color:#666">{{ $dayjs(item.createdAt).format("HH:mm A") }}</span>
          </template>
          <template v-slot:[`item.assignedto`]="{ item }">
            <div v-if="$auth.user.role === 1" class="v-select-table-wrapper">
              <user-select v-model="item.closer" :roles="3" @change="changeCloser(item.id, item.closer)" />
            </div>
            <span v-else>{{ findAssignedUser(item.assignedto) }}</span>
          </template>
          <template v-slot:[`item.closerStatus`]="{ item }">
            <div class="v-select-table-wrapper">
              <v-select
                v-model="item.closerStatus"
                :items="closerStatuses"
                item-text="label"
                item-value="value"
                @change="changeCloserStatus(item.id, item.closerStatus)"
                auto-select-first
                dense
                outlined
              />
            </div>
          </template>
          <template v-slot:[`item.brief`]="{ item }">
            <v-tooltip bottom max-width="350">
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">
                  <div v-html="helper.truncate(item.brief, 20)"></div>
                  <div style="color:blue" v-html="helper.truncate(item.lastComment ? '- ' + item.lastComment: '', 20)"></div>
                  <div style="color:blue" v-html="helper.truncate(item.previousComment ? '- ' + item.previousComment: '', 20)"></div>
                </div>
              </template>
              {{ item.brief }}
              <hr color="white" style="margin:5px 0; border-style: dashed" v-if="item.brief && (item.lastComment || item.previousComment)"/>
              <div style="color:blue" v-if="item.lastComment || item.previousComment">
                {{ item.lastComment ? '- ' + item.lastComment: '' }}<br/>
                {{ item.previousComment ? '- ' + item.previousComment: '' }}
              </div>
            </v-tooltip>
          </template>
        </v-data-table>
        <v-pagination v-model="paginateNum" :length="totalPageNum" :total-visible="7"></v-pagination>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import config from "@/config";
import helper from "@/utils/helper.js";
import UserSelect from "@/components/UserSelect.vue";
import { debounce } from "lodash";

export default {
  components: {
    UserSelect
  },
  data() {
    return {
      influencers: [],
      // closerStatuses: config.closerStatuses,
      totalPageNum: 0,
      paginateNum: 1,
      totalCount: 0,
      searchClue: "",
      loading: false,
      filterType: -1,
      closerFilter: -1,
      assignedtoFilter: -1,
      closerFilterCases: config.closerFilterCases,
      assignFilterCases: config.assignFilterCases,
      stats: [],
      options: {},
      headers: [
        { text: "Influencer Name", value: "influencerName", sortable: false },
        {
          text: "Created Date",
          value: "createdAt",
          sortable: true,
          align: "center"
        },
        {
          text: this.$auth.user.role === 1 ? "Closer" : "Opener",
          value: "assignedto",
          sortable: false,
          align: "center",
          width: 250
        },
        {
          text: "Closer Status",
          value: "closerStatus",
          sortable: false,
          align: "center",
          width: 250
        },
        {
          text: "Notes",
          value: "brief",
          sortable: false,
          width: 250
        }
      ]
    };
  },
  async fetch() {
    await this.getDashboardData();
    await this.getInfluencerList();
  },
  computed: {
    closerStatusBoxes() {
      const stats = this.stats;
      const extras = [
        {
          icon: "fa-clock-o",
          color: "blue",
          count: stats.waiting,
          order: 1
        },
        {
          icon: "fa-history",
          color: "#AB47BC",
          count: stats.moreTime,
          order: 2
        },
        {
          icon: "fa-repeat",
          color: "#1565C0",
          count: stats.contractAmendments,
          order: 3
        },
        {
          icon: "fa-stop-circle",
          color: "#00796B",
          count: stats.nonContactable,
          order: 4
        },
        {
          icon: "fa-thumbs-up",
          color: "#4CAF50",
          count: stats.signed,
          order: 5
        },
        {
          icon: "fa-remove",
          color: "#FFB74D",
          count: stats.rejected,
          order: 6
        },
        {
          icon: "fa-institution",
          color: "#ddbea9",
          count: stats.withLawyer,
          order: 7
        },
        {
          icon: "fa-globe",
          color: "#03045e",
          count: stats.america,
          order: 8
        },
        {
          icon: "fa-ban",
          color: "grey",
          count: stats.na,
          order: 9
        },
        {
          icon: "fa-sun-o",
          color: "#d90429",
          count: stats.signingToday,
          order: 10
        }
      ];

      if (this.$auth.user.role === 1) {
        extras.push(
          {
            icon: "fa-minus-square",
            color: "#555b6e",
            count: stats.dead,
            order: 11
          },
          {
            icon: "fa-calendar-times-o",
            color: "#9a031e",
            count: stats.cancelled,
            order: 12
          }
        );
      }

      // return config.closerStatuses
      return this.closerStatuses
        .map((item, index) => {
          return {
            ...item,
            extra: extras[index]
          };
        })
        .sort((a, b) => a.extra.order - b.extra.order);
    },
    closerStatuses() {
      return config.closerStatuses.filter(status => status.role >= this.$auth.user.role);
    },
    assignedToCases() {
      return config.assignedToCases.concat(this.$store.state.usersToBeAssigned);
    },
    closerCases() {
      return config.assignedToCases.concat(this.$store.state.closersToBeAssigned);
    }
  },
  watch: {
    $route() {
      this.getInfluencerList();
    },
    filterType() {
      this.paginateNum = 1;
      this.navigate();
    },
    paginateNum() {
      this.navigate();
    },
    options() {
      this.navigate();
    },
    closerFilter() {
      this.navigate();
    },
    assignedtoFilter() {
      this.navigate();
    }
  },
  beforeCreate() {
    this.helper = helper;
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
      const filter = this.filterType;
      const search = this.searchClue;
      const page = this.paginateNum;
      const closer = this.closerFilter;
      const assignedto = this.assignedtoFilter;
      const sortBy = this.options.sortBy.length ? this.options.sortBy[0] : null;
      const sortDirection = this.options.sortBy.length && this.options.sortDesc[0] ? "DESC" : "ASC";

      let query = "#";
      if (filter != -1) {
        query += `filter=${filter}&`;
      }
      if (page) {
        query += `page=${page}&`;
      }
      if (closer && closer !== -1) {
        query += `closer=${closer}&`;
      }
      if (assignedto && assignedto !== -1) {
        query += `assignedto=${assignedto}&`;
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
      if (query != "") {
        query = query.slice(0, -1);
      }
      this.$router.push({
        path: `/dashboard-closer${query}`
      });
    },
    async changeCloser(id, closer) {
      const data = { id, closer };
      await this.$influencerService.changeCloser(data);
    },
    async changeCloserStatus(id, closerStatus) {
      const data = { id, closerStatus, updatedBy: this.$auth.user.id };
      const result = await this.$influencerService.changeCloserStatus(data);
      if (result) {
        this.getDashboardData();
        this.getInfluencerList();
      }
    },
    async getDashboardData() {
      try {
        let data = {
          role: this.$auth.user.role,
          user_id: this.$auth.user.id
        };
        const result = await this.$influencerService.dashboardCloser(data);
        if (result) {
          this.stats = result;
        }
      } catch (error) {
        console.log(error);
      }
    },
    findAssignedUser(value) {
      const user = this.assignedToCases.find(user => user.value === value);
      return user ? user.label : "-";
    },
    async getInfluencerList() {
      this.loading = true;
      let data = {
        paginateNum: this.paginateNum,
        filter: this.filterType,
        searchClue: this.searchClue.toLowerCase(),
        role: this.$auth.user.role,
        user_id: this.$auth.user.id,
        closer: this.closerFilter,
        assignedto: this.assignedtoFilter,
        from: "closer",
        sortBy: this.options.sortBy.length ? this.options.sortBy[0] : null,
        sortDirection: this.options.sortBy.length && this.options.sortDesc[0] ? "DESC" : "ASC"
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
    }
  }
};
</script>

<style lang="scss">
.boxes-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); //repeat(3, 1fr);
  grid-gap: 1rem;
}

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

.card-icon {
  position: absolute;
  right: 1rem;
  font-size: 3rem;
  top: calc(50% - 1.5rem);
}

.v-card.active {
  transform: scale(1.04);

  .headline {
    font-weight: bold !important;
  }

  .v-card__text {
    color: #fff;
  }
}
</style>
