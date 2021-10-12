<template>
  <v-app v-resize="onResize">
    <v-navigation-drawer :mini-variant="miniVariant" :clipped="true" fixed app permanent>
      <v-list @refresh="getSocialData">
        <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" router exact>
          <v-list-item-action class="mr-2">
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
          <v-list-item-icon v-if="waiting && item.to === '/referred-influencers'">
            <v-chip small text-color="white" class="blink" :color="getColorByStatusValue(0)">{{ waiting.influencers }}</v-chip>
          </v-list-item-icon>
          <v-list-item-icon v-if="newLeadCount && item.to === '/new-lead-influencers'">
            <v-chip small text-color="white" class="blink" color="#5E35B1">{{ newLeadCount.influencers }}</v-chip>
          </v-list-item-icon>
        </v-list-item>

        <!-- <v-list-item
          v-for="(item, key) in cards"
          :key="key"
          :class="key"
        >
          <v-list-item-action>
            <v-icon class="color-white">{{ icons[key] }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <div class="d-flex flex-column justify-center align-tems-center">
              <div class="color-white">Total: {{ item.total ? item.total: 0 }}</div>
              <div class="color-white">Avg: {{ item.avg ? item.avg : 0 }}</div>
            </div>
          </v-list-item-content>
        </v-list-item>-->

        <div class="contract_signed">
          <v-card-title class="title">Contract Signed</v-card-title>
          <v-list-item
            v-for="(item, key) in contract_signed"
            :key="key"
            :class="key"
            @click="onSocialMediaCardClick(key, true)"
          >
            <v-list-item-action>
              <v-icon class="color-white">{{ icons[key] }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <div class="d-flex flex-column justify-center align-items-center">
                <div class="color-white"><span class="social-label">Total:</span>{{ item.total ? item.total : 0 }}</div>
                <div class="color-white"><span class="social-label">Avg:</span>{{ item.avg ? item.avg : 0 }}</div>
              </div>
            </v-list-item-content>
          </v-list-item>
        </div>

        <div class="contract_signed">
          <v-card-title class="title">Contract Not Signed</v-card-title>
          <v-list-item
            v-for="(item, key) in contract_not_signed"
            :key="key"
            :class="key"
            @click="onSocialMediaCardClick(key, false)"
          >
            <v-list-item-action>
              <v-icon class="color-white">{{ icons[key] }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <div class="d-flex flex-column justify-center align-items-center">
                <div class="color-white"><span class="social-label">Total:</span>{{ item.total ? item.total : 0 }}</div>
                <div class="color-white"><span class="social-label">Avg:</span>{{ item.avg ? item.avg : 0 }}</div>
              </div>
            </v-list-item-content>
          </v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="true" fixed app>
      <v-app-bar-nav-icon @click.stop="miniVariant = !miniVariant"></v-app-bar-nav-icon>
      <nuxt-link to="/">
        <img src="/inf-admin/templateimages/logo.png" alt="Lanistar Logo" width="150px" />
      </nuxt-link>
      <div class="mx-auto header-search--wrapper" style="width:500px">
        <autocomplete
          :search="searchInfluencer"
          :get-result-value="getSelectedInfluencerName"
          :debounce-time="400"
          placeholder="influencer name, email, phone or @social-username"
          @submit="handleSearchSubmit"
        >
          <template #result="{ result, props }">
            <li v-bind="props" class="autocomplete-result">
              <nuxt-link :to="{ name: 'influencers-profile-id', params: { id: result.id } }">
                <span>{{ `${result.firstName} ${result.lastName}` }}</span>
                <span>
                  <v-chip small>
                    {{ result.assignedToUser }}
                  </v-chip>
                  <v-chip dark small :color="result.contractStatusItem.color">
                    {{ result.contractStatusItem.label }}
                  </v-chip>
                </span>
              </nuxt-link>
              <div v-if="result.instagram">
                <v-chip
                  v-for="inst in result.instagram.split(',')"
                  :key="`${result.id}-${inst}`"
                  x-small
                  color="instagram-search-chip"
                >
                  @{{ inst }}
                </v-chip>
              </div>
              <div v-if="result.email">
                <v-chip x-small color="primary" outlined>
                  {{ result.email }}
                </v-chip>
              </div>
            </li>
          </template>
        </autocomplete>
      </div>
      <UserMenu />
      <v-btn class="elevation-0" text @click.prevent="logoff">
        <i style="color: #333; font-size: 1.5rem" class="fa fa-sign-out"></i>
        <!-- <v-icon normal >fa-sign-out</v-icon> -->
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <nuxt />
        <QuickMenu />
      </v-container>
    </v-main>

    <v-footer :fixed="fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
import "@trevoreyre/autocomplete-vue/dist/style.css";
import config from "@/config";
import { mapState } from "vuex";
import Autocomplete from "@trevoreyre/autocomplete-vue";
import "@trevoreyre/autocomplete-vue/dist/style.css";
import UserMenu from "@/components/layout/UserMenu.vue";
import QuickMenu from "@/components/layout/QuickMenu.vue";

const cards = {
  instagram: {
    total: 0,
    avg: 0
  },
  facebook: {
    total: 0,
    avg: 0
  },
  twitter: {
    total: 0,
    avg: 0
  },
  youtube: {
    total: 0,
    avg: 0
  },
  tiktok: {
    total: 0,
    avg: 0
  }
};

const contractSignValues = {
  instagram: {
    total: 0,
    avg: 0
  },
  facebook: {
    total: 0,
    avg: 0
  },
  twitter: {
    total: 0,
    avg: 0
  },
  youtube: {
    total: 0,
    avg: 0
  },
  tiktok: {
    total: 0,
    avg: 0
  }
};

export default {
  components: {
    Autocomplete,
    UserMenu,
    QuickMenu
  },
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: "mdi-apps",
          title: "Dashboard",
          to: "/dashboard#page=1"
        },
        {
          icon: "mdi-account-multiple",
          title: "Influencers",
          to: "/influencers#page=1"
        },
        // {
        //   icon: "mdi-account-plus",
        //   title: "Add New Influencer",
        //   to: "/influencers/new"
        // },
        {
          icon: "mdi-account-network",
          title: "Referred Influencers",
          to: "/referred-influencers"
        },
        {
          icon: "mdi-account-clock",
          title: "New Leads",
          to: "/new-lead-influencers"
        },
        {
          icon: "mdi-account-switch",
          title: "Invite Influencer",
          to: "/influencers/invite"
        },
        {
          icon: "mdi-chart-box",
          title: "Stats",
          to: "/stats"
        },
        {
          icon: "mdi-email-send",
          title: "Outgoing Contracts",
          to: "/outgoing-contract-list"
        }
      ],
      icons: {
        instagram: "mdi-instagram",
        facebook: "mdi-facebook",
        twitter: "mdi-twitter",
        youtube: "mdi-youtube",
        tiktok: "mdi-at"
      },
      cards,
      contract_signed: contractSignValues,
      contract_not_signed: contractSignValues,
      waiting: undefined,
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: "Lanistar Influencers",
      isLoading: false,
      newLeadCount: null
    };
  },
  computed: {
    ...mapState({
      assignedUsers: state => state.usersToBeAssigned
    })
  },
  mounted() {
    this.$bus.$on("refresh", () => {
      this.getSocialData();
    });
    this.getSocialData();
    this.miniVariant = this.$vuetify.breakpoint.mdAndDown;
    this.addUserManagement();
    this.getWaiting();
    this.getCountByStatus();
  },
  async created() {
    if (!this.$auth.loggedIn) {
      return;
    }
    const users = await this.$store.$userService.list();
    await this.$store.dispatch(
      "setUsersToBeAssigned",
      users.filter(f => f.role == 2)
    );
    await this.$store.dispatch(
      "setClosersToBeAssigned",
      users.filter(f => f.role == 3)
    );
    await this.$store.dispatch(
      "setOwnersToBeAssigned",
      users.filter(f => f.role == 4)
    );
    await this.$store.dispatch("setUsers", users);
  },
  methods: {
    searchInfluencer(input) {
      return new Promise((resolve, reject) => {
        if (input.length < 3) {
          return resolve([]);
        }
        this.$influencerService
          .list({
            searchClue: input.toLowerCase(),
            role: this.$auth.user.role,
            user_id: this.$auth.user.id,
            from: "dashboard"
          })
          .then(result => {
            resolve(
              result.list.map(item => {
                item.contractStatusItem = config.contractStatuses.find(f => f.value == item.contractStatus);
                item.assignedToUser = this.findAssignedUser(item.assignedto);
                return item;
              })
            );
          })
          .catch(reject);
      });
    },
    getSelectedInfluencerName() {
      return null;
    },
    handleSearchSubmit(result) {
      return this.$router.push(`/influencers/profile/${result.id}`);
    },
    findAssignedUser(value) {
      const assignedToCases = config.assignedToCases.concat(this.$store.state.usersToBeAssigned);
      const user = assignedToCases.find(user => user.value === value);
      return user ? user.label : "-";
    },
    async addUserManagement() {
      const closerScreen = {
        icon: "mdi-account-multiple-remove",
        title: "Closing Team",
        to: "/dashboard-closer"
      };
      const ownerScreen = {
        icon: "fa-handshake-o",
        title: "Influencer Owners",
        to: "/influencer-owners"
      };
      if (this.$auth.user.role === 3) {
        this.items.push(closerScreen);
      } else if (this.$auth.user.role === 4) {
        this.items.push(ownerScreen);
      } else if (this.$auth.user.role === 1 || this.$auth.user.role === 0) {
        this.items.push(closerScreen);
        this.items.push(ownerScreen);
        this.items.push({
          icon: "mdi-account-cog-outline",
          title: "Manage Users",
          to: "/manage/adminManage"
        });
        this.items.push({
          icon: "mdi-file",
          title: "Manage Templates",
          to: "/manage/templates/list"
        });
        this.items.push({
          icon: "mdi-file",
          title: "Templates 2",
          to: "/templates2"
        });
      } else if (this.$auth.user.role === 2) {
        // this.items.push({
        //    icon: 'mdi-cog-outline',
        //    title: 'Change Password',
        //   to: '/manage/changePassword'
        // });
      }
    },
    async getSocialData() {
      try {
        // const url = `${config.msLandingUrl}/influencer/socialfollowers`;
        // let options = {
        //   user_id: this.$auth.user.id,
        //   role: this.$auth.user.role
        // };
        // const result = await axios.post(url, options);
        const result = await this.$influencerService.socialfollowers();
        if (result) {
          this.cards = result.all;
          this.contract_signed = result.signed;
          this.contract_not_signed = result.notsigned;
        }
      } catch (error) {
        console.log(error);
      }
    },
    async getWaiting() {
      try {
        let options = {
          user_id: this.$auth.user.id,
          role: this.$auth.user.role
        };
        this.waiting = (await this.$influencerService.getWaiting(options)).data.waiting;
      } catch (error) {
        console.log(error);
      }
    },
    async getCountByStatus() {
      try {
        let options = {
          user_id: this.$auth.user.id,
          role: this.$auth.user.role,
          contractStatus: 10
        };
        const res = await this.$influencerService.getCountByStatus(options);
        if (res) {
          this.newLeadCount = res.data.result;
        }
      } catch (error) {
        console.log(error);
      }
    },
    onSocialMediaCardClick(key, contractSigned) {
      this.$store.dispatch("setSelectedSocialMediaCard", key);
      this.$router.push({
        path: `/dashboard#filter=${contractSigned ? 4 : 5}`
      });
    },
    onResize() {
      // this.miniVariant = this.$vuetify.breakpoint.mdAndDown
    },
    logoff() {
      this.$auth.logout();
    },
    getColorByStatusValue(value) {
      return config.contractStatuses.find(status => status.value === value).color;
    }
  }
};
</script>

<style scoped>
.fullname {
  overflow: hidden;
  max-width: 50%;
}
.v-list-item--active {
  color: #1976d2 !important;
}
</style>

<style lang="scss">
.twitter {
  background-color: #2196f3 !important;
  border-color: #2196f3 !important;
}
.youtube {
  background-color: #f44336 !important;
  border-color: #f44336 !important;
}
.facebook {
  background-color: #303f9f !important;
  border-color: #303f9f !important;
}
.tiktok {
  background-color: #1e1e1e;
  border-color: #1e1e1e;
}

.instagram {
  background-color: #e91e63 !important;
  border-color: #e91e63 !important;
}
.color-white {
  // font-family: 'Montserrat', sans-serif;
  color: white !important;
}
.social-label {
  display: inline-block;
  width: 50px;
  text-align: right;
  padding-right: 10px;
  // font-family: 'PT Sans Narrow', sans-serif;
  // font-size: 16px;
  // font-weight: bold;
}

.header-user--avatar {
  background-color: #c9f7f5;
  color: #1bc5bd;
  width: 35px;
  height: 35px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 4px;
}

.header-search--wrapper {
  .v-input__append-inner {
    display: none;
  }
}

.search-list-item {
  display: flex;
  justify-content: space-between;
  width: 100%;
  color: #333 !important;
  text-decoration: none;
}

.v-application {
  background: #f7f7f7 !important;
}

.blink {
  animation: blink-animation 1s steps(5, start) infinite;
  -webkit-animation: blink-animation 1s steps(5, start) infinite;
}
@keyframes blink-animation {
  to {
    visibility: hidden;
  }
}
@-webkit-keyframes blink-animation {
  to {
    visibility: hidden;
  }
}
.autocomplete-input {
  background-color: rgb(221, 219, 219);
}
.autocomplete-result-list {
  .autocomplete-result {
    padding: 12px;
    background-image: none;
    border-top: 1px solid #efefef;
  }
  a {
    text-decoration: none;
  }
}
</style>
