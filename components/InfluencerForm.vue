<template>
  <v-form id="influencerForm" ref="influencerForm" @submit.prevent="handleSubmit">
    <v-container>
      <v-card class="elevation-2 mb-3" color="#E1F5FE">
        <v-card-title> <i class="mdi mdi-account mr-1"></i> Personal Info </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                outlined
                dense
                v-model="$v.firstName.$model"
                :error="$v.firstName.$error"
                :error-messages="firstNameErrors"
                label="First name (*)"
                data-cy="first-name"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                outlined
                dense
                v-model="$v.lastName.$model"
                :error="$v.lastName.$error"
                :error-messages="lastNameErrors"
                label="Last name (*)"
                data-cy="last-name"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field outlined dense v-model="email" label="E-mail" required></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <div :class="{ 'has-error': !phone.valid }">
                <vue-tel-input
                  :preferred-countries="['gb', 'us', 'br', 'in']"
                  :valid-characters-only="true"
                  v-model="phoneNumber"
                  @input="onPhoneNumberInput"
                ></vue-tel-input>
                <span class="error-message" v-if="!phone.valid">Please enter valid phone number</span>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-row>
                <!-- <v-col cols="12" md="6" v-if="!createUser">
                  <v-datetime-picker
                    label="Select Datetime"
                    v-model="createdAt"
                    dateFormat="dd-MM-yyyy"
                  ></v-datetime-picker>
                </v-col> -->

                <v-col v-if="$auth.user.role === 1" cols="12" md="6">
                  <v-select
                    v-model="assignedto"
                    outlined
                    dense
                    :items="assignedToCases"
                    item-text="label"
                    item-value="value"
                    auto-select-first
                    label="Assigned To"
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="languageSpoken"
                    outlined
                    dense
                    item-text="name"
                    label="Language Spoken"
                    item-value="code"
                    :items="languages"
                  >
                  </v-autocomplete>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" md="6">
              <!-- <ckeditor v-model="brief"></ckeditor> -->
              <v-textarea v-model="brief" outlined dense label="Brief" required counter="500"></v-textarea>
            </v-col>
          </v-row>
          <v-row v-if="influencerType == 1">
            <v-col cols="12" md="6">
              <v-text-field outlined dense v-model="managerName" label="Manager Name"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field outlined dense v-model="managerEmail" label="Manager Email"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <div :class="{ 'has-error': !managerPhone.valid }">
                <vue-tel-input
                  :preferred-countries="['gb', 'us', 'br', 'in']"
                  :valid-characters-only="true"
                  :placeholder="'Enter manager phone number'"
                  v-model="managerPhoneNumber"
                  @input="onManagerPhoneNumberInput"
                ></vue-tel-input>
                <span class="error-message" v-if="!managerPhone.valid">Please enter valid phone number</span>
              </div>
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col cols="12" md="6">
              <v-text-field outlined dense v-model="companyTitle" label="Company Title"></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card class="elevation-2 mb-3" color="#E0F2F1">
        <v-card-title> <i class="mdi mdi-map-marker mr-1"></i> Address </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field outlined dense v-model="address1" label="Address - 1"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field outlined dense v-model="address2" label="Address - 2"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field outlined dense v-model="address3" label="Address - 3"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field outlined dense v-model="postcode" label="Postcode"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                outlined
                dense
                v-model="defaultCountryName"
                :items="countries"
                item-text="label"
                item-value="value"
                auto-select-first
                label="Country"
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                outlined
                dense
                v-model="timezone"
                :items="timezones"
                item-text="label"
                item-value="value"
                auto-select-first
                label="Time Zone"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card class="elevation-2 mb-3" color="#FFF3E0">
        <v-card-title> <i class="mdi mdi-list-status"></i> Status </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6" v-if="!createUser">
              <v-select
                outlined
                dense
                v-model="contractStatus"
                :items="contractStatuses"
                item-text="label"
                item-value="value"
                label="Contract status"
                @change="
                  selectedValue =>
                    changeContractStatus(
                      this.$props.influencerInfo.influencerId,
                      this.$props.influencerInfo.closer,
                      selectedValue
                    )
                "
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                outlined
                dense
                v-model="influencerType"
                :items="influencerTypes"
                item-text="label"
                item-value="value"
                auto-select-first
                label="Type"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card class="elevation-2 mb-3" color="#EDE7F6" v-if="influencerType == 1">
        <v-card-title> <i class="mdi mdi-comment-account-outline mr-1"></i> Social Media </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field outlined dense v-model="twitter" label="Twitter username"></v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                outlined
                dense
                v-model="twitter_followers"
                label="Twitter Followers"
                required
                type="number"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field outlined dense v-model="instagram" prefix="@" label="Instagram username"> </v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                outlined
                dense
                v-model="instagram_followers"
                label="Instagram Followers"
                required
                type="number"
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field outlined dense v-model="facebook" label="Facebook profile address"></v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                outlined
                dense
                v-model="fb_followers"
                label="Facebook Followers"
                required
                type="number"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field outlined dense v-model="youtube" label="Youtube channel URL"></v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                outlined
                dense
                v-model="youtube_followers"
                label="Youtube Followers"
                required
                type="number"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field outlined dense v-model="tiktok" prefix="@" label="TikTok username"></v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                outlined
                dense
                v-model="tiktok_followers"
                label="Tiktok Followers"
                required
                type="number"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                outlined
                dense
                v-model="defaultSocialMediaValue"
                :items="default_social_media"
                item-text="label"
                item-value="value"
                auto-select-first
                label="Default Social Media"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card class="elevation-2 mb-3" color="#EFEBE9" v-if="influencerType == 1">
        <v-card-title> <i class="mdi mdi-card-bulleted-settings-outline mr-1"></i> Other </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-autocomplete
                outlined
                dense
                label="Referred By"
                v-model="referredByInfo"
                :items="foundItems"
                :loading="isSearching"
                :search-input.sync="searchQuery"
                hide-no-data
                hide-selected
                clearable
                item-text="label"
                item-value="influencerId"
                placeholder="Influencer name, email or phone number"
                prepend-icon="mdi-database-search"
                return-object
                @change="onChangeReferredBy"
              >
              </v-autocomplete>
            </v-col>
            <v-col cols="12" md="6" v-if="referredByInfo">
              <v-card color="#385F73" dark>
                <v-btn text class="float-right">
                  <v-icon @click.stop="referredByInfo = null" @click="onReferredByDelete">mdi-window-close</v-icon>
                </v-btn>
                <v-card-title class="headline"
                  >{{ referredByInfo.firstName }} {{ referredByInfo.lastName }}</v-card-title
                >
                <v-card-subtitle>{{ referredByInfo.email }} - {{ referredByInfo.phoneNumber }}</v-card-subtitle>
                <v-card-actions>
                  <v-btn @click.stop="referredByInfo = null" small color="primary">un-refer</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                outlined
                dense
                label="Contract Value"
                item-value="value"
                item-text="label"
                prepend-icon="£"
                :items="contractValues"
                v-model="selectedContractValue"
              >
                <template slot="item" slot-scope="data">
                  <span :style="`color: ${data.item.color}`">
                    {{ data.item.label }}
                    <small class="ml-1" style="color:#999;" v-if="data.item.shares"
                      >({{ data.item.shares }} shares)</small
                    >
                  </span>
                </template>
              </v-select>
              <v-text-field
                outlined
                dense
                auto-select-first
                v-if="!selectedContractValue"
                v-model="contractValue"
                :error="$v.contractValue.$error"
                :error-messages="contractValueErrors"
                label="Contract Value"
                required
                prepend-icon="£"
                type="number"
                data-cy="contract-value"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                outlined
                dense
                v-model="referralValue"
                label="Referral Value"
                required
                prepend-icon="£"
                type="number"
                :disabled="!referredBy"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                outlined
                dense
                v-model="dayOfPosting"
                :items="days"
                item-text="label"
                item-value="value"
                auto-select-first
                prepend-icon="mdi-clock-outline"
                label="Day of Posting"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card class="elevation-2" style="position:sticky; bottom:36px;">
        <v-row>
          <v-col cols="12" class="d-flex justify-end pr-7">
            <v-btn text type="button" class="mr-2" @click="$refs.influencerForm.reset()">
              Clear
            </v-btn>
            <v-btn type="submit" color="primary" :disabled="loading" :loading="loading">
              Save
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </v-form>
</template>

<script>
import Vue from "vue";
import Vuelidate, { validationMixin } from "vuelidate";
import { email, required, url } from "vuelidate/lib/validators";
import { helpers } from "vuelidate/lib/validators";
import DatetimePicker from "vuetify-datetime-picker";
import CountryFlag from "vue-country-flag";
import moment from "moment-timezone";
import { VueTelInput } from "vue-tel-input";

const phoneNumberValidator = helpers.regex("phone", /^\+?[- ]?([0-9- ]{10,})$/);
import countries from "../countries";
import languages from "../languages";

Vue.use(Vuelidate);
Vue.use(DatetimePicker);

import axios from "../utils/create-axios";
import config from "../config";

let timer = null;
export default {
  components: {
    CountryFlag,
    VueTelInput
  },
  mixins: { validationMixin },
  props: {
    submitCallback: {
      type: Function,
      default: function(formData) {
        console.log(formData);
      }
    },
    cancelCallback: {
      type: Function,
      default: function() {
        console.log("cancel clicked");
      }
    },
    loading: Boolean,
    influencerInfo: Object,
    createUser: Boolean
  },
  data() {
    return {
      datetime: new Date(),
      isSearching: false,
      searchResults: [],
      searchQuery: null,
      influencerTypes: config.influencerTypes,
      contractStatuses: config.contractStatuses,
      default_social_media: config.defaultSocialMedia,
      contractValues: config.contractValues,
      days: config.days,
      selectedContractValue: "",
      defaultSocialMediaValue: 2,
      referredByInfo: null,
      influencerId: null,
      firstName: null,
      lastName: null,
      email: null,
      phoneNumber: null,
      languageSpoken: null,
      brief: null,
      address1: null,
      address2: null,
      address3: null,
      languages: languages.languagesList,
      countries: countries.countriesList,
      defaultCountryName: null,
      timezone: null,
      timezones: moment.tz.names(),
      postcode: null,
      facebook: null,
      twitter: null,
      instagram: null,
      tiktok: null,
      youtube: null,
      referredBy: null,
      influencerType: 1,
      contractStatus: 0,
      contractValue: "0",
      referralValue: 0,
      updateAt: null,
      fb_followers: 0,
      instagram_followers: 0,
      twitter_followers: 0,
      youtube_followers: 0,
      tiktok_followers: 0,
      assignedto: null,
      // email: "",
      // phoneNumber: "",
      // youtube: "",
      // facebook: "",
      managerName: "",
      managerEmail: "",
      companyTitle: "",
      dayOfPosting: -1,
      phone: {
        number: "",
        valid: true,
        country: undefined
      },
      managerPhone: {
        number: "",
        valid: true,
        country: undefined
      },
      managerPhoneNumber: null
    };
  },
  validations: {
    firstName: {
      required
    },
    lastName: {
      required
    },
    contractValue: {
      required
    }
  },
  async mounted() {
    if (this.$props.influencerInfo && this.$props.influencerInfo.influencerId) {
      const contractVal = selectedContractValue ? 0 : Number(this.$props.influencerInfo.contractValue);

      const selectedContractValue = this.contractValues.find(f => f.value == contractVal);
      const referralVal = Number(this.$props.influencerInfo.referralValue);

      this.influencerId = this.$props.influencerInfo.influencerId;
      this.firstName = this.$props.influencerInfo.firstName;
      this.lastName = this.$props.influencerInfo.lastName;
      this.email = this.$props.influencerInfo.email;
      this.phoneNumber = this.$props.influencerInfo.phoneNumber;
      this.brief = this.$props.influencerInfo.brief;
      this.influencerType = this.$props.influencerInfo.influencerType;
      this.languageSpoken = this.$props.influencerInfo.languageSpoken;
      this.address1 = this.$props.influencerInfo.address1;
      this.address2 = this.$props.influencerInfo.address2;
      this.address3 = this.$props.influencerInfo.address3;
      this.postcode = this.$props.influencerInfo.postcode;
      this.defaultCountryName = this.$props.influencerInfo.countrycode;

      this.facebook = this.$props.influencerInfo.facebook;
      this.twitter = this.$props.influencerInfo.twitter;
      this.instagram = this.$props.influencerInfo.instagram;
      this.youtube = this.$props.influencerInfo.youtube;
      this.tiktok = this.$props.influencerInfo.tiktok;
      this.referredBy = this.$props.influencerInfo.referredBy;
      this.contractStatus = this.$props.influencerInfo.contractStatus;
      this.referralValue = Number.isNaN(referralVal) ? 0 : referralVal;
      this.contractValue = Number.isNaN(contractVal) ? 0 : contractVal;
      this.selectedContractValue = selectedContractValue ? selectedContractValue.value : 0;
      // this.createdAt = new Date(this.$props.influencerInfo.createdAt);
      this.updateAt = this.$props.influencerInfo.updateAt;
      this.fb_followers = this.$props.influencerInfo.fb_followers;
      this.instagram_followers = this.$props.influencerInfo.instagram_followers;
      this.twitter_followers = this.$props.influencerInfo.twitter_followers;
      this.youtube_followers = this.$props.influencerInfo.youtube_followers;
      this.tiktok_followers = this.$props.influencerInfo.tiktok_followers;
      this.assignedto = this.$props.influencerInfo.assignedto;
      this.defaultSocialMediaValue = this.$props.influencerInfo.default_social_media;
      this.managerName = this.$props.influencerInfo.managerName;
      this.managerEmail = this.$props.influencerInfo.managerEmail;
      this.managerPhoneNumber = this.$props.influencerInfo.managerPhone;
      this.dayOfPosting = this.$props.influencerInfo.dayOfPosting;
      this.companyTitle = this.$props.influencerInfo.companyTitle;
      setTimeout(() => (this.timezone = this.$props.influencerInfo.timezone), 100);

      this.getReferredBy();
    } else {
      this.influencerType = Number(this.$props.influencerInfo.influencerType);
    }
  },
  methods: {
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      if (this.referredByInfo) {
        this.referredBy = this.referredByInfo.id;
      } else {
        this.referredBy = null;
      }
      const contractValue = this.selectedContractValue
        ? Number(this.selectedContractValue)
        : Number(this.contractValue);

      this.submitCallback({
        influencerId: this.$props.influencerInfo.influencerId,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phoneNumber: this.phoneNumber,
        brief: this.brief, // ? this.brief.replace(/\r\n|\r|\n/g, "<br />") : "",
        influencerType: this.influencerType,
        languageSpoken: this.languageSpoken,
        address1: this.address1,
        address2: this.address2,
        address3: this.address3,
        postcode: this.postcode,
        facebook: this.facebook,
        twitter: this.twitter,
        instagram: this.instagram,
        youtube: this.youtube,
        tiktok: this.tiktok,
        status: this.status,
        timezone: this.timezone,
        contractValue: contractValue,
        referralValue: Number(this.referralValue),
        referredBy: this.referredBy,
        fb_followers: Number(this.fb_followers),
        instagram_followers: Number(this.instagram_followers),
        twitter_followers: Number(this.twitter_followers),
        youtube_followers: Number(this.youtube_followers),
        tiktok_followers: Number(this.tiktok_followers),
        assignedto: this.assignedto,
        default_social_media: this.defaultSocialMediaValue,
        countrycode: this.defaultCountryName,
        managerName: this.managerName,
        managerEmail: this.managerEmail,
        managerPhone: this.managerPhoneNumber,
        dayOfPosting: this.dayOfPosting,
        companyTitle: this.companyTitle
      });
    },
    handleCancel() {
      this.cancelCallback();
    },
    async getReferredBy() {
      if (!this.referredBy) {
        return null;
      }
      this.isSearching = true;
      try {
        const url = `${config.msLandingUrl}/influencer/info/${this.referredBy}`;
        const result = await axios.get(url);
        if (result && result.data) {
          this.referredByInfo = result.data.profileInfo;
        }
      } catch (error) {
        console.log(error);
      }
      this.isSearching = false;
    },
    async changeContractStatus(id, closer, contractStatus) {
      const url = `${config.msLandingUrl}/influencer/changeContractStatus`;
      await axios.post(url, {
        id,
        closer,
        contractStatus,
        updatedBy: this.$auth.user.id
      });
    },

    onChangeReferredBy() {
      this.referredBy = this.referredByInfo.id;
      this.referralValue = 31250;
    },
    onReferredByDelete() {
      this.referredBy = null;
      this.referralValue = 0;
    },
    onPhoneNumberInput(formattedNumber, { number, valid, country }) {
      this.phoneNumber = number.international;
      this.phone.valid = valid;
      // this.phone.country = country && country.name;
    },
    onManagerPhoneNumberInput(formattedNumber, { number, valid, country }) {
      this.managerPhoneNumber = number.international;
      this.managerPhone.valid = valid;
      // this.phone.country = country && country.name;
    }
  },
  watch: {
    searchQuery(val) {
      // Items have already been loaded
      clearTimeout(timer);
      timer = setTimeout(async () => {
        // Items have already been requested
        if (this.isSearching) return;
        this.isSearching = true;
        try {
          const url = `${config.msLandingUrl}/influencer/list`;
          const result = await axios.post(url, {
            searchClue: val.toLowerCase(),
            autoComplete: true,
            role: this.$auth.user.role,
            user_id: this.$auth.user.id
          });
          if (result && result.data) {
            this.searchResults = result.data.list;
          }
        } catch (error) {
          console.log(error);
        }
        this.isSearching = false;
      }, 500);
    },
    defaultCountryName(val) {
      const timeZones = moment.tz.zonesForCountry(val);
      this.timezone = timeZones.length === 1 ? timeZones[0] : null;
      this.timezones = timeZones;
    }
  },
  computed: {
    assignedToCases() {
      return config.assignedToCases.concat(this.$store.state.usersToBeAssigned);
    },
    firstNameErrors() {
      const errors = [];
      if (!this.$v.firstName.$dirty) return errors;
      !this.$v.firstName.required && errors.push("First name is required");
      return errors;
    },
    lastNameErrors() {
      const errors = [];
      if (!this.$v.lastName.$dirty) return errors;
      !this.$v.lastName.required && errors.push("Last name is required");
      return errors;
    },

    contractValueErrors() {
      const errors = [];
      if (!this.$v.contractValue.$dirty) return errors;
      !this.$v.contractValue.required && errors.push("Contract Value is required");
      return errors;
    },
    foundItems() {
      return this.searchResults.map(item => {
        return {
          label: `${item.firstName} ${item.lastName} < ${item.email} > <
          ${item.phoneNumber} >`,
          ...item
        };
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.has-error {
  border-color: #ff5252;
  .error-message {
    font-size: 12px;
    padding-left: 1rem;
    color: #ff5252;
  }
}
</style>

<style lang="scss">
.vue-tel-input {
  border-color: #8b989d !important;
  border-radius: 4px !important;
  box-shadow: none !important;
  &:focus,
  &:focus-within {
    border-color: #1976d2 !important;
  }
}

.vti__dropdown {
  padding: 9px;

  &:hover {
    background-color: transparent;
  }
}

.vti__input {
  font-size: 16px;
}
</style>
