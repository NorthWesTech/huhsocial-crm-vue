<template>
  <v-layout column>
    <h1 class="mb-2">Influencer Content Posting Table</h1>
    <v-card class="elevation-2 mb-2">
      <v-row class="filter">
        <v-col cols="12" md="3">
          <v-menu
            ref="datePickerMenu"
            v-model="showDatePicker"
            :close-on-content-click="false"
            :return-value.sync="dateOfPosting"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                v-model="dateOfPosting"
                label="Date of Posting"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="dateOfPosting"
              no-title
              scrollable
              :allowed-dates="allowedPostingDates"
              :first-day-of-week="1"
              min="2020-11-25"
              max="2021-12-31"
              @input="onDateOfPostingInput"
            >
            </v-date-picker>
          </v-menu>
        </v-col>
      </v-row>
    </v-card>
    <v-card class="elevation-2 mb-2">
      <v-card-text>
        <v-row class="filter">
          <v-col cols="12" md="3" class="text-left">
            <v-btn tile :to="{ name: 'influencer-owners' }"> &lt;&lt; Influencers </v-btn>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="searchClue"
              small
              placeholder="Search by name, email or phone number"
              append-icon="mdi-magnify"
              class="pt-0"
              :disabled="!dateOfPosting"
              outlined
              dense
              @input="debouncedQuery"
            ></v-text-field>
          </v-col>
          <v-col v-if="$auth.user.role === 1" cols="12" md="3">
            <user-select
              v-model="ownerFilter"
              :roles="4"
              :filter-cases="ownerFilterCases"
              :disabled="!dateOfPosting"
              @change="callback"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="dayOfPosting"
              :items="days"
              item-text="label"
              item-value="value"
              class="no-padding"
              :disabled="!dateOfPosting"
              auto-select-first
              outlined
              dense
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
        v-if="ownerFilter !== -1 && ownerCases.find(f => f.value === ownerFilter)"
        class="ma-2"
        close
        @click:close="
          ownerFilter = -1;
          callback();
        "
      >
        {{ ownerCases.find(f => f.value === ownerFilter).label }}
      </v-chip>
      <v-chip
        v-if="dayOfPosting != -1 && days.find(d => d.value === dayOfPosting)"
        class="ma-2"
        close
        @click:close="
          dayOfPosting = -1;
          callback();
        "
      >
        {{ days.find(d => d.value === dayOfPosting).label }}
      </v-chip>
    </div>
    <v-card class="elevation-2">
      <v-card-title>
        <div class="d-flex justify-space-between" style="width: 100%">
          <label>
            <i class="fa fa-list"></i> Influencers
            <span v-if="totalCount" style="font-size: 14px; color: #666"
              >Showing <strong style="color: #1976d2">{{ totalCount }}</strong> records
              <span v-if="dateOfPosting">
                for week <strong style="color: #1976d2">{{ getWeek(dateOfPosting) }}</strong></span
              ></span
            >
          </label>
          <JsonExcel
            class="v-btn v-btn--contained theme--light v-size--small primary"
            :fetch="downloadInfluencers"
            :before-generate="startDownload"
            :before-finish="finishDownload"
            name="ContentTracking.xls"
            ><i class="fa fa-download mr-1"></i>Download As Excel
          </JsonExcel>
        </div>
      </v-card-title>
      <v-card-text>
        <div v-if="!dateOfPosting" class="selectDateOfPostingAlert">
          <v-alert border="top" colored-border type="info" elevation="2"
            >Please select date of posting first from above date picker
          </v-alert>
        </div>
        <div v-if="dateOfPosting && influencers.length > 0" class="content-posting-container">
          <table border="1" class="stats">
            <tr>
              <th colspan="2">Totals for selected week</th>
            </tr>
            <tr>
              <td class="statText">Total Influencers</td>
              <td class="statValue" style="background-color: #1976d2; color: #fff">{{ stats.totalInfluencers }}</td>
            </tr>
            <!-- <tr>
              <td class="statText">Total Posted Day</td>
              <td class="statValue" style="background-color: #faedcb">{{ stats.totalPosted }}</td>
            </tr> -->
            <tr>
              <td class="statText">Total Approved Day</td>
              <td class="statValue" style="background-color: #b7e4c7">{{ stats.totalApproved }}</td>
            </tr>
            <tr>
              <td class="statText">Total Posted on planned day</td>
              <td
                class="statValue"
                style="background-color: #ef476f; color: #fff"
                v-html="stats.dayOfPosting + '&nbsp;&nbsp;&hearts;'"
              ></td>
            </tr>
          </table>

          <table ref="contentPostingTable" border="1" class="content-posting">
            <thead>
              <tr>
                <th>Name</th>
                <th v-if="$auth.user.role === 1">Owner</th>
                <th>Status</th>
                <th class="wd">Monday</th>
                <th class="wd">Tuesday</th>
                <th class="wd">Wednesday</th>
                <th class="wd">Thursday</th>
                <th class="wd">Friday</th>
                <th class="wd">Saturday</th>
                <th class="wd">Sunday</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in influencers" :key="item.influencerId" :class="rowAppearance(item)">
                <td class="fullName">
                  <nuxt-link :to="{ name: 'influencers-profile-id', params: { id: item.influencerId } }">
                    {{ item.fullName }}
                  </nuxt-link>
                </td>
                <td v-if="$auth.user.role === 1">{{ findOwner(item.owner) }}</td>
                <td class="row-status" @click.prevent="openPostDetailsDialog(item)" v-html="rowStatus(item)"></td>
                <td :class="wd(item.day1)" @click="onWeekDayClick(item, 1)" v-html="dayStatusText(item, 1)"></td>
                <td :class="wd(item.day2)" @click="onWeekDayClick(item, 2)" v-html="dayStatusText(item, 2)"></td>
                <td :class="wd(item.day3)" @click="onWeekDayClick(item, 3)" v-html="dayStatusText(item, 3)"></td>
                <td :class="wd(item.day4)" @click="onWeekDayClick(item, 4)" v-html="dayStatusText(item, 4)"></td>
                <td :class="wd(item.day5)" @click="onWeekDayClick(item, 5)" v-html="dayStatusText(item, 5)"></td>
                <td :class="wd(item.day6)" @click="onWeekDayClick(item, 6)" v-html="dayStatusText(item, 6)"></td>
                <td :class="wd(item.day7)" @click="onWeekDayClick(item, 7)" v-html="dayStatusText(item, 7)"></td>
                <div class="actions">
                  <v-row align="center" justify="space-around">
                    <v-speed-dial v-model="fab" direction="right" :open-on-hover="true">
                      <template #activator>
                        <v-btn v-model="fab" color="blue darken-2" dark fab small text icon>
                          <v-icon v-if="fab">mdi-close</v-icon>
                          <v-icon v-else>mdi-table-cog</v-icon>
                        </v-btn>
                      </template>
                      <v-btn fab dark small color="red" @click.prevent="openDeleteDialog(item)">
                        <v-icon>mdi-table-row-remove</v-icon>
                      </v-btn>
                      <v-btn fab dark small color="indigo" @click.prevent="openPostDetailsDialog(item)">
                        <v-icon>mdi-dock-window</v-icon>
                      </v-btn>
                    </v-speed-dial>
                  </v-row>
                </div>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td :colspan="$auth.user.role === 1 ? 3 : 2" style="text-align: right">Total Counts:</td>
                <td>{{ stats.appDay1 }} / {{ stats.infDay1 }}</td>
                <td>{{ stats.appDay2 }} / {{ stats.infDay2 }}</td>
                <td>{{ stats.appDay3 }} / {{ stats.infDay3 }}</td>
                <td>{{ stats.appDay4 }} / {{ stats.infDay4 }}</td>
                <td>{{ stats.appDay5 }} / {{ stats.infDay5 }}</td>
                <td>{{ stats.appDay6 }} / {{ stats.infDay6 }}</td>
                <td>{{ stats.appDay7 }} / {{ stats.infDay7 }}</td>
              </tr>
            </tfoot>
          </table>
          <v-pagination v-model="paginateNum" :length="totalPageNum" :total-visible="7"></v-pagination>
          <v-dialog v-model="showDeleteDialog" max-width="290">
            <v-card>
              <v-card-title class="headline">Remove Row Status</v-card-title>
              <v-card-text>Are you sure to remove this row status?</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="gray" text @click="dismissDeleteDialog">Dismiss</v-btn>
                <v-btn color="red darken-1" text @click.stop="deleteInfluencerPostingRow">Delete</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="showPostDetailsDialog" max-width="600">
            <v-card>
              <v-card-title>Content Posting Row Details</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col v-if="!postDetailsDialogData.posted" cols="12" md="6">
                      <v-select
                        v-model="postDetailsDialogData.reason"
                        :items="reasonCases"
                        label="Reason"
                        item-text="label"
                        item-value="value"
                        auto-select-first
                        dense
                        outlined
                        @change="changeReasonWhyDidntPost"
                      />
                    </v-col>
                    <v-col v-else cols="12" md="6">
                      <v-select
                        v-model="postDetailsDialogData.socialMedia"
                        :items="socialMediaCases"
                        label="Social Media"
                        item-text="label"
                        item-value="value"
                        auto-select-first
                        dense
                        outlined
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col v-if="postDetailsDialogData.reason === 5" cols="12" md="12">
                      <v-textarea
                        v-model="postDetailsDialogData.notes"
                        label="Notes"
                        rows="3"
                        outlined
                        dense
                      ></v-textarea>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click.stop="closePostDetailsDialog">Close</v-btn>
                <v-btn color="blue darken-1" text @click.stop="savePostDetails">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
        <div v-if="dateOfPosting && influencers.length === 0" class="noDataAlert">
          <v-alert border="top" colored-border type="info" elevation="2">No influencer found</v-alert>
        </div>
      </v-card-text>
    </v-card>
  </v-layout>
</template>
<script>
import config from "@/config";
import RouteHelper from "@/utils/route-helper";
import UserSelect from "@/components/UserSelect.vue";
import moment from "moment";
import { debounce } from "lodash";
import JsonExcel from "vue-json-excel";

export default {
  components: {
    UserSelect,
    JsonExcel
  },
  data() {
    return {
      fab: false,
      loading: false,
      stats: {
        appDay1: 0,
        appDay2: 0,
        appDay3: 0,
        appDay4: 0,
        appDay5: 0,
        appDay6: 0,
        appDay7: 0,
        infDay1: 0,
        infDay2: 0,
        infDay3: 0,
        infDay4: 0,
        infDay5: 0,
        infDay6: 0,
        infDay7: 0,
        totalInfluencers: 0,
        totalApproved: 0,
        dayOfPosting: 0
      },
      dayOfPosting: -1,
      dateOfPosting: null,
      showDatePicker: false,
      showDeleteDialog: false,
      showPostDetailsDialog: false,
      postDetailsDialogData: this.emptyPostDetails(),
      idToBoDelete: null,
      influencers: [],
      searchClue: "",
      paginateNum: 1,
      ownerFilter: -1,
      ownerFilterCases: config.ownerFilterCases,
      reasonCases: config.reasonCases,
      socialMediaCases: config.socialMediaCases,
      cardReceivedCases: config.cardReceivedCases,
      days: config.days,
      totalPageNum: 0,
      totalCount: 0
    };
  },
  computed: {
    ownerCases() {
      return config.assignedToCases.concat(this.$store.state.ownersToBeAssigned);
    }
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    $route(to, from) {
      this.getInfluencers();
    },
    paginateNum(value) {
      if (!value) return;
      this.navigate();
    },
    dateOfPosting(value) {
      if (!value) return;
      this.navigate();
    },
    ownerFilter(value) {
      if (!value) return;
      this.navigate();
    },
    dayOfPosting(value) {
      if (!value) return;
      this.navigate();
    }
  },
  mounted() {
    this.getInfluencers();
  },
  created() {
    this.setParameters();
  },
  methods: {
    wd(day) {
      return day === 2 ? "wd approved" : day === 1 ? "wd posted" : "wd";
    },
    dayStatusText(item, day) {
      return (
        (item[`day${day}`] === 2 ? "Approved" : item[`day${day}`] === 1 ? "Posted" : "") +
        `${item.dayOfPosting === day ? " &hearts;" : ""}`
      );
    },
    rowStatus(item) {
      return item.posted ? this.findSocialMediaByValue(item.socialMedia) : this.findReasonByValue(item.reason);
    },
    rowAppearance(item) {
      return item.approved ? "approved" : item.posted ? "posted" : item.reason ? "closed" : "na";
    },
    getYear(date) {
      return moment(date).format("YYYY");
    },
    getWeek(date) {
      return moment(date).isoWeek();
    },
    refreshData() {
      this.getInfluencers();
    },
    findOwner(value) {
      const owner = this.ownerCases.find(owner => owner.value === value);
      return owner ? owner.label : "-";
    },
    debouncedQuery: debounce(function () {
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
    onDateOfPostingInput(date) {
      this.$refs.datePickerMenu.save(date);
      this.showDatePicker = false;
    },
    async onWeekDayClick(item, day) {
      if (!this.dateOfPosting || item.reason) {
        return;
      }

      const status = item[`day${day}`];

      if (status === 2) {
        return;
      }

      this.loading = true;

      const payload = { ...item };
      payload[`day${day}`] = status + 1;

      await this.$contentPostingService.update(payload);

      this.getInfluencers();
    },
    navigate() {
      const page = this.paginateNum;
      const dateOfPosting = this.dateOfPosting;
      const search = this.searchClue;
      const owner = this.ownerFilter;
      const dayOfPosting = this.dayOfPosting;

      let query = "#";
      if (page) {
        query += `page=${page}&`;
      }
      if (dateOfPosting) {
        query += `dateOfPosting=${dateOfPosting}&`;
      }
      if (search !== "") {
        query += `search=${search}&`;
      }
      if (owner && owner !== -1) {
        query += `owner=${owner}&`;
      }
      if (dayOfPosting && dayOfPosting !== -1) {
        query += `dayOfPosting=${dayOfPosting}&`;
      }
      if (query !== "") {
        query = query.slice(0, -1);
      }
      this.$router.push({
        path: `/influencer-owners/content-posting${query}`
      });
    },
    setParameters() {
      const params = RouteHelper.getHashParams(this.$route);
      this.paginateNum = params["page"] ? Number(params.page) : 1;
      this.dateOfPosting = params["dateOfPosting"] ? params.dateOfPosting : null;
      this.searchClue = params["search"] ? params.search : "";
      this.sortBy = params["sortBy"] ? params.sortBy : "";
      this.sortDirection = params["sortDirection"] ? params.sortDirection : "";
      this.ownerFilter = params["owner"] ? params.owner : -1;
      this.dayOfPosting = params["dayOfPosting"] ? Number(params.dayOfPosting) : -1;
    },
    callback() {
      if (this.paginateNum === 1) {
        this.navigate();
        return;
      }
      this.paginateNum = 1;
    },
    async getInfluencers() {
      if (!this.dateOfPosting) {
        return;
      }

      this.loading = true;

      const year = this.getYear(this.dateOfPosting);
      const week = this.getWeek(this.dateOfPosting);

      const query = {
        year,
        week,
        owner: this.ownerFilter,
        searchQuery: this.searchClue.toLowerCase(),
        dayOfPosting: this.dayOfPosting,
        paginateNum: this.paginateNum
      };

      const result = await this.$contentPostingService.list(query);

      if (result) {
        const influencers = result.list.map(inf => {
          let posted = false;
          let approved = false;

          Object.keys(inf).map(key => {
            if (key.startsWith("day") && key !== "dayOfPosting") {
              posted = posted || inf[key] > 0;
              approved = approved || inf[key] > 1;
            }
          });

          return {
            ...inf,
            posted,
            approved
          };
        });

        const stats = result.stats;

        let totalApproved = 0;
        Object.keys(stats).map(key => {
          if (key.startsWith("appDay")) {
            totalApproved += stats[key];
          }
        });
        stats.totalApproved = totalApproved;

        this.totalPageNum = Math.floor(result.count / 20) + 1;
        this.influencers = influencers;
        this.totalCount = result.count;
        this.stats = stats;

        this.loading = false;
      }
    },
    openDeleteDialog(item) {
      this.idToBoDelete = {
        influencerId: item.influencerId,
        year: item.year,
        week: item.week
      };
      this.showDeleteDialog = true;
    },
    dismissDeleteDialog() {
      this.idToBoDelete = null;
      this.showDeleteDialog = false;
    },
    async deleteInfluencerPostingRow() {
      const { influencerId, year, week } = this.idToBoDelete;
      await this.$contentPostingService.delete(influencerId, year, week);
      this.showDeleteDialog = false;
      this.getInfluencers();
    },
    openPostDetailsDialog(item) {
      this.postDetailsDialogData = {
        ...item
      };
      this.showPostDetailsDialog = true;
    },
    emptyPostDetails() {
      return {
        influencerId: null,
        year: null,
        week: null,
        day1: 0,
        day2: 0,
        day3: 0,
        day4: 0,
        day5: 0,
        day6: 0,
        day7: 0,
        posted: false,
        approved: false,
        socialMedia: null,
        reason: null,
        notes: null
      };
    },
    closePostDetailsDialog() {
      this.postDetailsDialogData = this.emptyPostDetails();
      this.showPostDetailsDialog = false;
    },
    async savePostDetails() {
      await this.$contentPostingService.update(this.postDetailsDialogData);
      this.closePostDetailsDialog();
      this.getInfluencers();
    },
    changeReasonWhyDidntPost(reason) {
      if (reason) {
        this.postDetailsDialogData.socialMedia = null;
        if (reason !== 5) {
          this.postDetailsDialogData.notes = null;
        }
      }
    },
    findSocialMediaByValue(value) {
      let socialMedia = this.socialMediaCases.find(item => item.value === value);
      return socialMedia ? `<span class="${socialMedia.icon}"> ${socialMedia.label}</span>` : "-";
    },
    findReasonByValue(value) {
      let reason = this.reasonCases.find(item => item.value === value);
      return reason ? reason.label : "-";
    },
    async downloadInfluencers() {
      const influencers = await this.$contentPostingService.download({
        searchQuery: this.searchClue.toLowerCase(),
        owner: this.ownerFilter
      });
      return influencers.map(influencer => {
        return {
          Influencer: `${influencer.firstName} ${influencer.lastName}`,
          Owner: influencer.owner,
          "Card Received": this.cardReceivedCases.find(item => item.value === influencer.cardReceived).label,
          Week: influencer.week,
          "Approved at": influencer.approvedAt ? moment(influencer.approvedAt).format("yyyy-MM-DD h:mm") : undefined,
          "Posted at": influencer.postedAt ? moment(influencer.postedAt).format("yyyy-MM-DD h:mm") : undefined
        };
      });
    },
    startDownload() {
      this.loading = true;
    },
    finishDownload() {
      this.loading = false;
    }
  }
};
</script>
<style lang="scss">
.row.filter {
  display: flex;
  justify-content: space-between;
}
.v-main__wrap {
  background: #f5f5f5;
}
.v-text-field__details {
  display: none !important;
}
.selectDateOfPostingAlert,
.noDataAlert {
  padding: 40px;
}
.selectDateOfPostingAlert .v-alert {
  width: 600px;
  margin: 0 auto;
}
.noDataAlert .v-alert {
  width: 300px;
  margin: 0 auto;
}
.content-posting-container {
  overflow: scroll;
}
table.stats,
table.content-posting {
  margin-bottom: 20px;
  border-collapse: collapse;
  border-color: #ccc;
  border-style: none;
  font-size: 75%;
}
table.stats th {
  background-color: #edf6f9;
}
table.stats th,
table.stats td {
  padding: 1px 5px;
}
table.stats td.statText {
  min-width: 200px;
  font-weight: bold;
  background-color: #f1faee;
}
table.stats td.statValue {
  min-width: 60px;
  padding-left: 15px;
  font-weight: bold;
}
table.content-posting tbody tr.closed {
  background-color: #fcd5ce;
}
table.content-posting thead th,
table.content-posting tfoot td {
  padding: 3px 5px;
  font-weight: bold;
  text-align: center;
  background-color: #edf6f9;
}
table.content-posting tbody td {
  padding: 2px 5px;
}
table.content-posting tbody td.fullName a {
  color: #1976d2;
  text-decoration: none;
}
table.content-posting tbody td.fullName a:hover {
  text-decoration: underline;
}
table.content-posting tbody td.row-status {
  cursor: pointer;
}
table.content-posting tbody td.row-status:hover {
  color: #fff;
  background-color: #0077b6;
}
table.content-posting thead th.wd {
  min-width: 75px;
}
table.content-posting tbody td.wd {
  cursor: pointer;
  font-weight: bold;
  text-align: center;
}
table.content-posting tbody td.wd.approved,
table.content-posting tbody tr.posted td.wd.posted:hover {
  background-color: #b7e4c7;
}
table.content-posting tbody td.wd.posted,
table.content-posting tbody tr.na td.wd:hover,
table.content-posting tbody tr.posted td.wd:hover {
  background-color: #faedcb;
}

table.content-posting tbody tr .actions {
  position: absolute;
  margin-top: -5px;
  margin-left: 13px;
}
table.content-posting tbody tr .actions div.row {
  visibility: hidden;
}
table.content-posting tbody tr:hover .actions div.row {
  visibility: visible;
}
</style>
