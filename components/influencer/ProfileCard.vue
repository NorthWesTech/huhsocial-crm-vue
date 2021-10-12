<template>
  <v-card>
    <v-card-text>
      <div class="card-actions"></div>
      <v-list-item style="min-height: 100px">
        <v-list-item-avatar size="72">
          <user-avatar :avatar="avatar" />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            <h1 style="color: #333">
              <span v-if="influencerInfo.influencerType == 1">{{ influencerFullName }}</span>
              <span v-else>
                {{ influencerFullName }}
                <span style="color: #666; font-size: 16px">{{ influencerInfo.companyTitle }}</span>
              </span>
              <v-chip :color="status.color" dark>
                <contract-status-select
                  v-model="influencerInfo.contractStatus"
                  :influencer="influencerInfo"
                  :contract-statuses="contractStatuses"
                  style="width: 260px; vertical-align: middle"
                  :outlined="false"
                  template="chips"
                  class="ml-4"
                />
              </v-chip>
            </h1>
          </v-list-item-title>
          <v-list-item-subtitle>
            <span v-if="influencerInfo.email" class="mr-2 pre-info">
              <i class="mdi mdi-email-outline mr-1"></i>
              <a :href="`mailto:${influencerInfo.email}`" class="info-link">
                {{ influencerInfo.email }}
              </a>
            </span>
            <span v-if="influencerInfo.phoneNumber" class="mr-2 pre-info">
              <i class="mdi mdi-phone-outline"></i>
              {{ influencerInfo.phoneNumber }}
            </span>
            <span v-if="country" class="mr-2 pre-info">
              <i class="mdi mdi-map-marker"></i>
              {{ country.label }}
            </span>
            <span v-if="influencerInfo.languageSpoken" class="mr-2 pre-info">
              {{ getLanguageName(influencerInfo.languageSpoken) }}
            </span>
            <v-chip :color="roleColor.Opener" dark small>
              <span>Opener: </span>
              <strong v-if="assignedtoUser">{{ assignedtoUser.label }}</strong>
            </v-chip>
            <v-chip :color="roleColor.Closer" dark small>
              <span>Closer: </span>
              <strong v-if="closerUser">{{ closerUser.label }}</strong>
            </v-chip>
            <v-chip :color="roleColor.Owner" dark small>
              <span>Owner: </span>
              <strong v-if="ownerUser">{{ ownerUser.label }}</strong>
            </v-chip>
            <SocialMediaLinks :influencer-info="influencerInfo" v-if="influencerInfo.influencerType == 1" />
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <div class="d-flex profile-card--notes">
        <div style="width: 70%">
          <Comments v-model="commentsCount" :influencer="influencerInfo.influencerId" />
          <v-switch
            v-model="influencerInfo.special_account"
            :loading="specialAccountLoading"
            :label="`Special Account: ${influencerInfo.special_account ? 'Yes' : 'No'}`"
            @change="changeSpecialAccount"
          ></v-switch>
        </div>
        <div style="width: 30%" class="mb-2">
          <BriefBox :influencer="influencerInfo" />
        </div>
      </div>
      <div class="influencer-extra ma-5 mb-0 pt-5">
        <div v-if="influencerInfo.referredBy" class="d-flex align-items-center mb-2">
          <span class="mr-4">
            <i class="lnr lnr-magic-wand" style="font-size: 1.5rem; color: #666"></i>
          </span>
          <div class="d-flex flex-column text-dark-75">
            <span class="font-weight-bolder font-size-sm">Referred By</span>
            <span class="font-weight-bolder font-size-h5">
              <nuxt-link :to="{ name: 'influencers-profile-id', params: { id: influencerInfo.referredBy } }">
                {{ referredByFullName }}
              </nuxt-link>
            </span>
          </div>
        </div>

        <div v-if="contractValue && influencerInfo.influencerType == 1" class="d-flex align-items-center mb-2">
          <span class="mr-4">
            <i class="lnr lnr-briefcase" style="font-size: 1.5rem; color: #666"></i>
          </span>
          <div class="d-flex flex-column text-dark-75">
            <span class="font-weight-bolder font-size-sm">Contract Value</span>
            <span class="font-weight-bolder font-size-h5">
              <v-chip v-if="contractValue.value" dark small :color="contractValue.color">
                <span>
                  <strong> {{ contractValue.label }}</strong>
                  <small>({{ contractValue.shares }} shares)</small>
                </span>
              </v-chip>
              <v-chip v-if="typeof contractValue != 'object'" small>
                {{ contractValue }}
              </v-chip>
            </span>
          </div>
        </div>

        <div
          v-if="influencerInfo.dayOfPosting && influencerInfo.influencerType == 1"
          class="d-flex align-items-center mb-2"
        >
          <span class="mr-4">
            <i class="lnr lnr-clock" style="font-size: 1.5rem; color: #666"></i>
          </span>
          <div class="d-flex flex-column text-dark-75">
            <span class="font-weight-bolder font-size-sm">Day Of Posting</span>
            <span class="font-weight-bolder font-size-h5">
              {{ dayOfPosting.label }}
            </span>
          </div>
        </div>

        <div v-if="influencerInfo.referralValue" class="d-flex align-items-center mb-2">
          <span class="mr-4">
            <i class="lnr lnr-users" style="font-size: 1.5rem; color: #666"></i>
          </span>
          <div class="d-flex flex-column text-dark-75">
            <span class="font-weight-bolder font-size-sm">Referral Value</span>
            <span class="font-weight-bolder font-size-h5">
              {{ referralValueFormatted }}
            </span>
          </div>
        </div>

        <div
          v-if="influencerInfo.managerName && influencerInfo.influencerType == 1"
          class="d-flex align-items-center mb-2"
        >
          <span class="mr-4">
            <span class="lnr lnr-highlight" style="font-size: 1.5rem; color: #666"></span>
          </span>
          <div class="d-flex flex-column text-dark-75">
            <span class="font-weight-bolder font-size-sm">Manager</span>
            <span class="font-weight-bolder font-size-h5">
              {{ influencerInfo.managerName }} <br />
              {{ influencerInfo.managerEmail }} <br />
              {{ influencerInfo.managerPhone }}
            </span>
          </div>
        </div>

        <div v-if="totalReferredValue" class="d-flex align-items-center mb-2">
          <span class="mr-4">
            <i class="lnr lnr-flag" style="font-size: 1.5rem; color: #666"></i>
          </span>
          <div class="d-flex flex-column text-dark-75">
            <span class="font-weight-bolder font-size-sm"> Total Referral Value </span>
            <span class="font-weight-bolder font-size-h5">
              {{ totalReferredValue }}
            </span>
          </div>
        </div>
        <div class="d-flex align-items-center flex-column mb-2" v-if="false">
          <v-select
            v-model="selectedPayment"
            dense
            outlined
            item-text="label"
            item-value="value"
            :items="paymentItems"
            :label="paymentStatusText(paymentStatus)"
          />
          <v-btn color="primary" dark @click="changePaymentStatus(selectedPayment)" :disabled="paymentStatus == selectedPayment">
            {{ paymentStatusText(paymentStatus) }}
          </v-btn>
        </div>

        <div v-if="influencerTime" class="d-flex align-items-center mb-2" style="grid-column-end: none">
          <div class="influencer-time">
            <span class="influencer-time--time">{{ influencerTime.time }}</span>
            <span class="influencer-time--date">{{ influencerTime.date }}</span>
            <span class="influencer-time--timezone">{{ influencerTime.timezone }}</span>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import AuthHelper from "@/utils/auth-helper";
import UserAvatar from "@/components/influencer/UserAvatar.vue";
import SocialMediaLinks from "@/components/influencer/SocialMediaLinks.vue";
import Comments from "@/components/influencer/Comments.vue";
import BriefBox from "@/components/influencer/BriefBox.vue";
import config from "@/config";
import countries from "@/countries";
import moment from "moment-timezone";
import languages from "../../languages";
import ContractStatusSelect from "@/components/ContractStatusSelect.vue";

export default {
  components: { UserAvatar, SocialMediaLinks, Comments, BriefBox, ContractStatusSelect },
  props: {
    influencerInfo: {
      type: Object,
      required: true
    },
    referredByFullName: {
      type: String,
      default: null
    },
    totalReferredValue: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      verifyDialog: false,
      commentsCount: 0,
      specialAccountLoading: false,
      languages: languages.languagesList,
      paymentStatus: this.influencerInfo.paymentStatus,
      paymentItems: [
        { label: "1 Year (£200)", value: 1 },
        { label: "2 Years (£350)", value: 2 },
        { label: "3 Years (£500)", value: 3 },
        { label: "Reset Status", value: 0 }
      ],
      selectedPayment: this.influencerInfo.paymentStatus
    };
  },
  computed: {
    influencerFullName() {
      if (!this.influencerInfo) {
        return null;
      }
      return `${this.influencerInfo.firstName} ${this.influencerInfo.lastName}`;
    },
    isReadonly() {
      return AuthHelper.isReadonly(this.influencerInfo.assignedto, this.$auth.user);
    },
    avatar() {
      if (!this.influencerInfo) {
        return null;
      }
      return `${this.influencerInfo.firstName[0]}${this.influencerInfo.lastName[0]}`;
    },
    status() {
      const result = config.contractStatuses.find(item => {
        return item.value == this.influencerInfo.contractStatus;
      });
      if (result) {
        return result;
      }
      return {};
    },
    contractValue() {
      const contractValue = config.contractValues.find(f => f.value == this.influencerInfo.contractValue);
      return contractValue ? contractValue : config.formatter.format(this.influencerInfo.contractValue);
    },
    referralValueFormatted() {
      return config.formatter.format(this.influencerInfo.referralValue);
    },
    profileStrength() {
      const all = Object.keys(this.influencerInfo).length;
      const filled = Object.keys(this.influencerInfo).filter(k => this.influencerInfo[k]).length;
      return ((filled / all) * 100).toFixed(0);
    },
    influencerTime() {
      const tz = this.influencerInfo.timezone;
      if (!tz) return null;
      const time = moment().tz(tz);
      const gmt = ` (GMT ${time.format("Z")})`;
      return {
        time: time.format("HH:mm"),
        date: time.format("DD MMMM YYYY, dddd") + gmt,
        timezone: "Time in " + tz
      };
    },
    referenceLink() {
      if (!this.influencerInfo) {
        return null;
      }
      return `https://inf.iamlanistar.com/register?ref=${this.influencerInfo.referralCode}`;
    },
    profileLink() {
      if (!this.influencerInfo) {
        return null;
      }
      return `https://inf.iamlanistar.com/profile/${this.influencerInfo.token}`;
    },
    assignedtoUser() {
      return this.$store.state.usersToBeAssigned.find(i => i.value == this.influencerInfo.assignedto);
    },
    closerUser() {
      return this.$store.state.closersToBeAssigned.find(i => i.value == this.influencerInfo.closer);
    },
    ownerUser() {
      return this.$store.state.ownersToBeAssigned.find(i => i.value == this.influencerInfo.owner);
    },
    country() {
      return countries.countriesList.find(i => i.value == this.influencerInfo.countrycode);
    },
    roleColor() {
      return {
        Opener: config.roles.find(f => f.value == 2).color,
        Closer: config.roles.find(f => f.value == 3).color,
        Owner: config.roles.find(f => f.value == 4).color
      };
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
    dayOfPosting() {
      return config.days.find(f => f.value == this.influencerInfo.dayOfPosting);
    }
  },
  methods: {
    getLanguageName(languageSpoken) {
      let language = this.languages.find(language => language.code === languageSpoken)?.name;
      return language ? language : "English";
    },
    paymentStatusText(value) {
      if (value === 0) {
        return "Request Payment";
      }

      const paymentItem = this.paymentItems.find(item => item.value === value);
      return paymentItem ? paymentItem.label : "Request Payment";
    },
    async changePaymentStatus(value) {
      const result = await this.$influencerService.sendPaymentLinkMail(this.influencerInfo.influencerId, value);
      if (result && result.code === 6000) {
        this.paymentStatus = value;
      }
    },
    async changeSpecialAccount(value) {
      this.specialAccountLoading = true;
      const result = await this.$influencerService.edit({
        influencerId: this.influencerInfo.influencerId,
        special_account: value
      });
      if (result && result.code === 6000) {
        this.specialAccountLoading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.info-link {
  text-decoration: none;
  color: #666;
  font-weight: 600;
}

.card-actions {
  position: absolute;
  right: 2rem;
  width: 250px;
  text-align: right;
  z-index: 1;
}

.progress-info {
  width: 250px;
  text-align: center;
  display: inline-block;
  font-size: 12px;
}

.influencer-time {
  // width: 30%;
  text-align: right;
  padding-right: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;

  & --time {
    font-size: 34px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
  }

  & --timezone {
    line-height: 1;
  }
}

.influencer-extra {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid #e7e7e7;
  grid-gap: 1rem;
}

.pre-info i.mdi {
  font-size: 16px;
}

// .profile-card--notes {
//   // max-height: 200px;
//   // overflow-y: auto;
// }
</style>
