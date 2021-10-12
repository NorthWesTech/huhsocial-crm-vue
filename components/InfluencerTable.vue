<template>
  <div>
    <v-data-table
      :options.sync="options"
      :loading="loading"
      :headers="headers"
      :items="items"
      :items-per-page="20"
      :item-class="itemRowBackground"
      hide-default-footer
      class="elevation-0 mb-3"
      data-cy="influencer-table"
    >
      <template v-slot:[`item.firstName`]="{ item }">
        <div class="d-flex align-center">
          <span :title="countryName(item.countrycode)" class="image-country" v-if="item.countrycode">
            <country-flag :country="item.countrycode" size="normal" />
          </span>
          <span class="noimage-country mr-3" v-else>
            <span class="no-image"></span>
          </span>
          <nuxt-link :to="{ name: 'influencers-profile-id', params: { id: item.id } }" data-cy="table-full-name">
            {{ `${item.firstName} ${item.lastName}` }}
          </nuxt-link>
          {{ item.special_account ? "&nbsp;&#9733;" : "" }}
        </div>
      </template>
      <template v-slot:[`item.followers`]="{ item }">
        {{ item.default_followers }}
      </template>
      <template v-slot:[`item.influencerCount`]="{ item }">
        {{ item.influencerCount }}
        <span v-if="item.influencerCount > 0">influencers</span>
      </template>
      <template v-slot:[`item.createdAt`]="{ item }">
        <span class="d-block">{{ $dayjs(item.createdAt).format("DD.MM.YYYY") }}</span>
        <span style="font-size: 12px; color: #666">{{ $dayjs(item.createdAt).format("HH:mm A") }}</span>
      </template>
      <template v-slot:[`item.email`]="{ item }">
        {{ item.email ? item.email : "No email" }}
      </template>
      <template v-slot:[`item.phoneNumber`]="{ item }">
        {{ item.phoneNumber ? item.phoneNumber : "No Phone Number" }}
      </template>
      <template v-slot:[`item.assignedto`]="{ item }">
        <div class="v-select-table-wrapper" v-if="$auth.user.role === 1">
          <user-select v-model="item.assignedto" :roles="2" @change="changeAssignedUser(item.id, item.assignedto)" />
        </div>
        <span v-else>{{ findAssignedUser(item.assignedto) }}</span>
      </template>
      <template v-slot:[`item.contractStatus`]="{ item }">
        <div class="v-select-table-wrapper" v-if="!item.readonly">
          <contract-status-select
            v-model="item.contractStatus"
            :influencer="item"
            :contract-statuses="contractStatuses"
            @change="onContractStatusChanged"
          />
        </div>
        <span v-else>{{ findStatusByValue(contractStatuses, item.contractStatus) }}</span>
      </template>
      <template v-slot:[`item.owner`]="{ item }">
        <div class="v-select-table-wrapper">
          <user-select v-model="item.owner" :roles="4" @change="changeOwner(item.id, item.owner)" />
        </div>
      </template>
      <template v-slot:[`item.cardReceived`]="{ item }">
        <div class="v-select-table-wrapper">
          <card-received-select v-model="item.cardReceived" @change="changeCardReceived(item.id, item.cardReceived)" />
        </div>
      </template>
      <template v-slot:[`item.brief`]="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <span v-bind="attrs" v-on="on" v-html="helper.truncate(item.brief, 20)"></span>
          </template>
          <span>{{ item.brief }}</span>
        </v-tooltip>
      </template>
      <template v-slot:[`item.action`]="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              link
              v-on="on"
              :to="{
                name: item.readonly ? 'influencers-profile-id' : 'influencers-edit-id',
                params: { id: item.id }
              }"
            >
              <v-icon>{{ item.readonly ? "fa-eye" : "fa-pencil-square-o" }}</v-icon>
            </v-btn>
          </template>
          <span>{{ item.readonly ? "View" : "Edit" }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              v-if="$auth.user.role === 1"
              color="red"
              v-on="on"
              icon
              @click.stop="openDeleteDialog(item.id, item)"
            >
              <v-icon>fa-trash-o</v-icon>
            </v-btn>
          </template>
          <span>Delete</span>
        </v-tooltip>
      </template>
    </v-data-table>
    <v-pagination v-model="paginateNum" :length="totalPageNum" :total-visible="7"></v-pagination>
    <v-dialog v-model="showDeleteDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Delete influencer</v-card-title>
        <v-card-text>Are you sure to delete this influencer?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray" text @click="dismissDeleteDialog">Dismiss</v-btn>
          <v-btn color="red darken-1" text @click.stop="deleteInfluencer">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import CountryFlag from "vue-country-flag";
import countries from "@/countries";
import config from "@/config";
import helper from "@/utils/helper.js";
import axios from "@/utils/create-axios";
import RouteHelper from "@/utils/route-helper";
import UserSelect from "@/components/UserSelect.vue";
import CardReceivedSelect from "@/components/CardReceivedSelect.vue";
import ContractStatusSelect from "@/components/ContractStatusSelect.vue";

export default {
  components: { CountryFlag, UserSelect, ContractStatusSelect, CardReceivedSelect },
  props: ["headers", "items", "loading", "totalPageNum", "from"],
  data() {
    const params = RouteHelper.getHashParams(this.$route);
    const page = params.hasOwnProperty("page") ? Number(params.page) : 1;
    const sortBy = params.hasOwnProperty("sortBy") ? params.sortBy : "";
    const sortDirection = params.hasOwnProperty("sortDirection") ? params.sortDirection : "";
    return {
      showDeleteDialog: false,
      idToBoDelete: null,
      options: {
        sortBy: [sortBy],
        sortDesc: [sortDirection === "DESC"]
      },
      paginateNum: page,
      helper
    };
  },
  computed: {
    assignedToCases() {
      return config.assignedToCases
        .concat(this.$store.state.usersToBeAssigned)
        .concat(this.$store.state.closersToBeAssigned);
    },
    contractStatuses() {
      const { role } = this.$auth.user;

      return config.contractStatuses.map(status => {
        return {
          ...status,
          disabled: role && !status.roles.includes(role)
        };
      });
    }
  },
  watch: {
    "options.sortBy"(value) {
      if (!value) return;
      this.emitChangeOptions();
    },
    "options.sortDirection"(value) {
      if (!value) return;
      this.emitChangeOptions();
    },
    paginateNum(value) {
      if (!value) return;
      this.emitChangeOptions();
    }
  },
  methods: {
    countryName(countryCode) {
      if (countryCode) {
        const index = countries.countriesList.findIndex(x => x.value === countryCode);
        if (index >= 0) {
          return countries.countriesList[index].label;
        }
      }
      return false;
    },
    daysPassedFromDateToNow(date) {
      return parseInt(Math.abs(new Date() - new Date(date)) / (60 * 60 * 24 * 1000));
    },
    emitChangeOptions() {
      const sortBy = this.options.sortBy.length ? this.options.sortBy[0] : null;
      const sortDirection = this.options.sortBy.length && this.options.sortDesc[0] ? "DESC" : "ASC";
      const page = this.paginateNum;
      this.$emit("onChangeOptions", {
        sortBy,
        sortDirection,
        page
      });
    },
    async changeAssignedUser(id, user) {
      await this.$influencerService.changeAssignedUser({
        id,
        user
      });
      this.$emit("refreshData");
    },
    async changeOwner(id, owner) {
      await this.$influencerService.changeOwner({
        id,
        owner
      });
      this.$emit("refreshData");
    },
    async changeCardReceived(id, cardReceived) {
      await this.$influencerService.edit({ influencerId: id, cardReceived });
      this.$emit("refreshData");
    },
    onContractStatusChanged() {
      this.$emit("refreshData");
    },
    findAssignedUser(value) {
      const user = this.assignedToCases.find(user => user.value === value);
      return user ? user.label : "-";
    },
    findStatusByValue(statuses, value) {
      let status = statuses.find(status => status.value === value);
      return status ? status.label : "-";
    },
    itemRowBackground(item) {
      if (this.from === "dashboard") {
        if (item.contractStatus === 5 /* && !item.closer*/) {
          const days = this.daysPassedFromDateToNow(item.createdAt);
          if (days >= 3) {
            return "expired-row";
          }
          return;
        }
      }

      if (item.readonly) {
        return "readonly-row";
      }
    },
    openDeleteDialog(id, item) {
      this.idToBoDelete = id;
      this.showDeleteDialog = true;
    },
    dismissDeleteDialog() {
      this.idToBoDelete = null;
      this.showDeleteDialog = false;
    },
    async deleteInfluencer() {
      const url = `${config.msLandingUrl}/influencer/${this.idToBoDelete}`;
      await axios.delete(url);
      this.showDeleteDialog = false;
      this.$emit("refreshData");
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
tbody tr.readonly-row {
  background-color: #faf3dd;
}
tbody tr.expired-row {
  background-color: #ffadad;
}

.image-country,
.no-image-country {
  margin-left: 0;
  margin-right: 12px;
}
</style>
