<template>
  <v-layout column>
    <StatusFilterBox
      ref="statusFilterBox"
      v-model="filterType"
      :stats="stats"
      class="mb-2"
      @onSelectFilter="changeFilterType"
    />
    <v-row ref="filter">
      <v-col cols="12">
        <v-card class="elevation-2 mb-2">
          <v-card-text>
            <v-row class="filter">
              <v-col cols="12" md="3">
                <v-text-field
                  small
                  v-model="searchClue"
                  @input="debouncedQuery"
                  placeholder="Search by name, email or phone number"
                  append-icon="mdi-magnify"
                  class="pt-0"
                  outlined
                  dense
                  data-cy="search-clue"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3" v-if="$auth.user.role === 1">
                <user-select v-model="assignedto" :roles="2" :filter-cases="assignFilterCases" @change="callback" />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="influencerType"
                  :items="influencerTypes"
                  item-text="label"
                  item-value="value"
                  auto-select-first
                  v-on:change="callback"
                  class="no-padding"
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12" md="3">
                <v-autocomplete
                  v-model="countryCode"
                  :items="countries"
                  item-text="label"
                  item-value="value"
                  class="pt-0"
                  @change="callback"
                  outlined
                  dense
                ></v-autocomplete>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <div class="mb-2">
          <v-chip class="ma-2" dark :color="selectedFilter.color">
            {{ selectedFilter.title }}
          </v-chip>
          <v-chip
            class="ma-2"
            v-if="searchClue"
            close
            @click:close="
              searchClue = '';
              debouncedQuery();
            "
          >
            {{ searchClue }}
          </v-chip>
          <v-chip
            class="ma-2"
            v-if="assignedto != -1 && assignedToCases.find(f => f.value === assignedto)"
            close
            @click:close="
              assignedto = -1;
              callback();
            "
          >
            {{ assignedToCases.find(f => f.value === assignedto).label }}
          </v-chip>
          <v-chip
            class="ma-2"
            v-if="influencerType != -1 && influencerTypes.find(f => f.value === influencerType)"
            close
            @click:close="
              influencerType = -1;
              callback();
            "
          >
            {{ influencerTypes.find(f => f.value === influencerType).label }}
          </v-chip>
          <v-chip
            class="ma-2"
            v-if="countryCode != -1 && countries.find(f => f.value === countryCode)"
            close
            @click:close="
              countryCode = -1;
              callback();
            "
          >
            {{ countries.find(f => f.value === countryCode).label }}
          </v-chip>
        </div>
        <v-card class="elevation-2">
          <v-card-title>
            <div class="d-flex justify-space-between" style="width:100%">
              <label>
                <i class="fa fa-list"></i> Influencer List
                <span style="font-size:14px;color:#666;" v-if="listStats"
                  >Showing
                  <strong style="color: #1976d2;">{{ listStats.influencers }}</strong>
                  influencers and <strong style="color: #1976d2">{{ listStats.agencies }}</strong> agencies</span
                >
              </label>
              <JsonExcel
                class="v-btn v-btn--contained theme--light v-size--small primary"
                :fetch="downloadInfluencers"
                :before-generate="startDownload"
                :before-finish="finishDownload"
                name="influencers.xls"
                ><i class="fa fa-download mr-1"></i>Download As Excel
              </JsonExcel>
            </div>
          </v-card-title>
          <v-card-text>
            <InfluencerTable
              :headers="computedHeaders"
              :items="influencers"
              :loading="loading"
              :total-page-num="totalPageNum"
              :from="'dashboard'"
              @onChangeOptions="onChangeOptions"
              @refreshData="refreshData"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-layout>
</template>
<script>
import config from "@/config";
import RouteHelper from "@/utils/route-helper";
import InfluencerTable from "@/components/InfluencerTable";
import StatusFilterBox from "@/components/StatusFilterBox";
import UserSelect from "@/components/UserSelect.vue";
import JsonExcel from "vue-json-excel";
import moment from "moment";
import countries from "@/countries";
import languages from "@/languages";
import { debounce } from "lodash";

export default {
  components: {
    InfluencerTable,
    StatusFilterBox,
    JsonExcel,
    UserSelect
  },
  scrollToTop: false,
  data() {
    return {
      influencers: [],
      loading: false,
      stats: {},
      listStats: null,
      filterType: -1,
      paginateNum: 1,
      searchClue: "",
      totalPageNum: 0,
      totalCount: 0,
      assignedto: -1,
      assignFilterCases: config.assignFilterCases,
      influencerType: -1,
      selectedFilter: {
        color: "pink",
        title: "Registered"
      },
      influencerTypes: [{ label: "All Types", value: -1 }, ...config.influencerTypes],
      countryCode: -1,
      countries: [{ label: "All Countries", value: -1 }, ...countries.countriesList],
      languages: languages.languagesList,
      sortBy: "",
      sortDirection: "ASC",
      headers: [
        {
          text: "Influencer Name",
          value: "firstName",
          sortable: false,
          order: 0
        },
        {
          text: "Created Date",
          value: "createdAt",
          align: "center",
          sortable: true,
          order: 2
        },
        {
          text: "Opener",
          value: "assignedto",
          sortable: false,
          align: "center",
          width: 250,
          order: 4
        },
        {
          text: "Contract Status",
          value: "contractStatus",
          sortable: false,
          align: "center",
          width: 250,
          order: 5
        }
      ]
    };
  },
  head: {
    title: "Dashboard"
  },
  computed: {
    assignedToCases() {
      return config.assignedToCases
        .concat(this.$store.state.usersToBeAssigned)
        .concat(this.$store.state.closersToBeAssigned);
    },
    selectedSocialMediaCard() {
      return this.$store.state.selectedSocialMediaCard;
    },
    computedHeaders() {
      this.headers = this.headers.filter(f => f.value != "followers");
      this.headers = this.headers.filter(f => f.value != "influencerCount");
      if ([4, 5, 6].includes(this.filterType)) {
        this.headers.push({
          text: "Followers",
          value: "followers",
          sortable: true,
          order: 1
        });
      }
      if (this.filterType === 1) {
        this.headers.push({
          text: "Influencers",
          value: "influencerCount",
          sortable: false,
          order: 1
        });
      }
      return this.headers.sort((a, b) => a.order - b.order);
    }
  },
  watch: {
    $route() {
      this.setParameters();
      this.getInfluencers();
    },
    // eslint-disable-next-line no-unused-vars
    selectedSocialMediaCard(newValue, oldValue) {
      this.paginateNum = 1;
      this.getInfluencers();
    },
    filterType(val) {
      this.selectedFilter = this.$refs.statusFilterBox.getStatusByValue(val);
    }
  },
  created() {
    this.setParameters();
  },
  async mounted() {
    /* For Ip Address */
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => {
        if (data.ip) {
          sessionStorage.setItem("ip", data.ip);
        }
      })
      .catch(err => console.error(err));

    this.selectedFilter = this.$refs.statusFilterBox.getStatusByValue(this.filterType);
    this.getDashboardData();
    this.getInfluencers();
  },
  methods: {
    setParameters() {
      const params = RouteHelper.getHashParams(this.$route);
      this.filterType = params["filter"] ? Number(params.filter) : -1;
      this.searchClue = params["search"] ? params.search : "";
      this.paginateNum = params["page"] ? Number(params.page) : 1;
      this.sortBy = params["sortBy"] ? params.sortBy : "";
      this.sortDirection = params["sortDirection"] ? params.sortDirection : "";
      this.assignedto = params["assignedto"] ? params.assignedto : -1;
      this.influencerType = params["influencerType"] ? Number(params.influencerType) : -1;
      this.countryCode = params["countryCode"] ? params.countryCode : -1;
    },
    callback() {
      if (this.paginateNum === 1) {
        this.navigate();
        return;
      }
      this.paginateNum = 1;
    },
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
      const sortBy = this.sortBy;
      const sortDirection = this.sortDirection;
      const assignedto = this.assignedto;
      const influencerType = this.influencerType;
      const countryCode = this.countryCode;

      let query = "#";
      if (filter != -1) {
        query += `filter=${filter}&`;
      }
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
      if (countryCode && countryCode != -1) {
        query += `countryCode=${countryCode}&`;
      }
      if (query != "") {
        query = query.slice(0, -1);
      }
      this.$router.push({
        path: `/dashboard${query}`
      });
    },
    changeFilterType(filter) {
      this.paginateNum = 1;
      this.selectedFilter = filter;
      this.filterType = filter.value;
      this.sortBy = "";
      this.sortDirection = "ASC";
      this.$store.dispatch("setSelectedSocialMediaCard", null);
      this.navigate();
      this.goto("filter");
    },
    async downloadInfluencers() {
      let excelList = [];

      const data = {
        filter: this.filterType,
        filterBySocialFollowers: this.selectedSocialMediaCard,
        searchClue: this.searchClue.toLowerCase(),
        assignedto: this.assignedto,
        countryCode: this.countryCode,
        influencerType: this.influencerType,
        role: 1,
        autoComplete: true,
        from: "download"
      };
      const result = await this.$influencerService.list(data);
      if (result && result.list) {
        excelList = result.list.map(inf => {
          delete inf["readonly"];
          return {
            ...inf,
            influencerType: inf.influencerType === 1 ? "Influencer" : "Agency",
            special_account: inf.special_account ? "YES" : "NO",
            "EU/UK/ROW": this.getRegionByCountryCode(inf.countrycode),
            createdAt: moment(inf.createdAt).format(config.xlsDateFormat),
            updatedAt: moment(inf.updatedAt).format(config.xlsDateFormat),
            statusUpdatedAt: moment(inf.statusUpdatedAt).format(config.xlsDateFormat),
            languageSpoken: this.findLanguageSpoken(inf.languageSpoken),
            contractStatus: this.findContractStatus(inf.contractStatus),
            closerStatus: this.findCloserStatus(inf.closerStatus)
          };
        });
        this.loading = false;
      }

      return excelList;
    },
    startDownload() {
      this.loading = true;
    },
    finishDownload() {
      this.loading = false;
    },
    findLanguageSpoken(value) {
      const lang = this.languages.find(lang => lang.code === value);
      return lang ? lang.name : "";
    },
    findContractStatus(value) {
      const contractStatus = config.contractStatuses.find(contractStatus => contractStatus.value === value);
      return contractStatus ? contractStatus.label : "-";
    },
    findCloserStatus(value) {
      const closerStatus = config.closerStatuses.find(closerStatus => closerStatus.value === value);
      return closerStatus ? closerStatus.label : "-";
    },
    async getDashboardData() {
      try {
        let options = {
          role: this.$auth.user.role,
          user_id: this.$auth.user.id
        };
        const result = await this.$influencerService.dashboard(options);
        if (result) {
          this.stats = result;
        }
      } catch (error) {
        console.log(error);
      }
    },
    async getInfluencers() {
      this.loading = true;
      try {
        // const url = `${config.msLandingUrl}/influencer/list`;
        let data = {
          paginateNum: this.paginateNum,
          filter: this.filterType,
          filterBySocialFollowers: this.selectedSocialMediaCard,
          searchClue: this.searchClue.toLowerCase(),
          assignedto: this.assignedto,
          countryCode: this.countryCode,
          influencerType: this.influencerType,
          role: this.$auth.user.role,
          user_id: this.$auth.user.id,
          from: "dashboard",
          sortBy: this.sortBy,
          sortDirection: this.sortDirection
        };
        const result = await this.$influencerService.list(data);

        if (result && result.list) {
          this.totalPageNum = Math.floor(result.count / 20) + 1;
          this.totalCount = result.count;
          this.influencers = result.list;
          this.listStats = result.stats;
          this.loading = false;
        }
      } catch (error) {
        console.log(error);
        this.influencers = [];
        this.loading = false;
      }
    },
    onChangeOptions(options) {
      this.paginateNum = options.page;
      this.sortBy = options.sortBy;
      this.sortDirection = options.sortDirection;
      this.navigate();
    },
    goto(refName) {
      var element = this.$refs[refName];
      var top = element.offsetTop;
      window.scrollTo({ top: top, behavior: "smooth" });
    },
    async refreshData() {
      await this.getDashboardData();
      await this.getInfluencers();
    },
    getRegionByCountryCode(countryCode) {
      switch (countryCode) {
        case "":
        case null:
          return "";
        case "GB":
          return "UK";
        case "AT":
        case "BE":
        case "BG":
        case "HR":
        case "CY":
        case "CZ":
        case "DK":
        case "EE":
        case "FI":
        case "FR":
        case "DE":
        case "GR":
        case "HU":
        case "IE":
        case "IT":
        case "LV":
        case "LT":
        case "LU":
        case "MT":
        case "NL":
        case "PL":
        case "PT":
        case "RO":
        case "SK":
        case "SI":
        case "ES":
        case "SE":
          return "EU";
        default:
          return "ROW";
      }
    }
  }
};
</script>
<style lang="scss">
.v-main__wrap {
  background: #f5f5f5;
}
.no-padding {
  padding-top: 0px;
}
.active {
  transform: scale(1.04);
}

.v-card.active {
  .headline {
    font-weight: bold !important;
  }

  .v-card__text {
    color: #fff;
  }
}
.v-card__subtitle,
.v-card__text,
.v-card__title {
  padding: 8px 16px;
}

.v-card__actions {
  padding: 5px 16px;
}

.headline {
  padding-bottom: 0px;
}
.card-icon {
  position: absolute;
  right: 1rem;
  font-size: 3rem;
  top: calc(50% - 1.5rem);
}
// .card-icon {
//   width: 25%;
// }
// .card-icon .fa {
//   font-size: 4rem;
// }
.card-count h1 {
  font-size: 3rem;
}
div.filter,
div.count {
  padding: 0 10px;
}
div.filter {
  .v-text-field__details {
    display: none !important;
  }
}
.list-count-statement {
  font-size: 1.2em;
  font-weight: bold;
  margin-right: 10px;
}
.shown-count-statement {
  color: #ee6c4d;
  font-size: 1em;
  font-weight: bold;
  margin-left: 10px;
}
.export-btn-container {
  text-align: right;
}
.search-wrapper {
  position: relative;
  label {
    position: absolute;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.5);
    top: 8px;
    left: 12px;
    z-index: -1;
    transition: 0.15s all ease-in-out;
  }
  input {
    width: 80%;
    padding: 4px 12px;
    color: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    transition: 0.15s all ease-in-out;
    background: white;
    &:focus {
      outline: none;
      transform: scale(1.05);
      & + label {
        font-size: 10px;
        transform: translateY(-24px) translateX(-12px);
      }
    }
    &::-webkit-input-placeholder {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.5);
      font-weight: 100;
    }
  }
}
</style>
