<template>
  <v-layout column>
    <v-snackbar color="success" bottom :timeout="5000" v-model="successMessage">
      Influencer has updated successfully
      <v-btn color="pink" text @click="snackbar = false">
        Close
      </v-btn>
    </v-snackbar>
    <h1>Edit Influencer info</h1>
    <v-sheet>
      <v-alert type="error" v-if="errorSummary">
        {{ errorSummary }}
      </v-alert>
    </v-sheet>
    <v-sheet v-if="influencerInfo">
      <influencer-form
        :submit-callback="submitCallback"
        :cancel-callback="cancelCallback"
        :loading="loading"
        :influencer-info="influencerInfo"
      />
    </v-sheet>
  </v-layout>
</template>

<script>
import axios from "@/utils/create-axios";
import parseApiError from "@/utils/parse-api-error";
import InfluencerForm from "@/components/InfluencerForm";
import config from "@/config";

export default {
  components: {
    InfluencerForm
  },
  data() {
    return {
      loading: false,
      id: null,
      influencerInfo: null,
      errorSummary: null,
      successMessage: false
    };
  },
  async mounted() {
    const { id } = this.$route.params;
    if (!id) {
      return;
    }
    this.id = id;
    await this.getInfluencerInfo();
  },
  methods: {
    async getInfluencerInfo() {
      this.loading = true;
      try {
        const url = `${config.msLandingUrl}/influencer/info/${this.id}`;
        const info = await axios.get(url);
        if (info && info.data) {
          this.influencerInfo = info.data.profileInfo;
        } else {
          this.errorSummary = "influencer couldn't not be found";
        }
      } catch (error) {
        this.errorSummary = parseApiError(error);
      }
      this.loading = false;
    },
    async submitCallback(formData) {
      this.loading = true;
      try {
        this.errorSummary = null;
        const url = `${config.msLandingUrl}/influencer/edit`;
        const result = await axios.post(url, {
          ...formData
        });
        if (result && result.data) {
          this.$vuetify.goTo(0, {});
          if (result.data.errors) {
            this.errorSummary = parseApiError(result);
            this.loading = false;
            return;
          }
          this.successMessage = true;
          console.log("result-data", result.data);
          setTimeout(() => {
            // :to="{ name: 'influencers-profile-id', params: { id: item.id }}
            const id = result.data.profileInfo.influencerId;
            this.$router.push({
              name: "influencers-profile-id",
              params: { id }
            });
            // this.$nuxt.$router.replace('/influencers');
            this.$bus.$emit("refresh");
          }, 1000);
        }
      } catch (error) {
        this.errorSummary = parseApiError(error);
      }
      this.loading = false;
    },
    cancelCallback() {
      this.$nuxt.$router.replace("/influencers");
    }
  }
};
</script>
