<template>
  <v-layout column>
    <v-snackbar color="success" bottom :timeout="5000" v-model="successMessage">
      Influencer has been created successfully
      <v-btn color="pink" text @click="snackbar = false">
        Close
      </v-btn>
    </v-snackbar>
    <h1>{{ title }}</h1>
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
        :create-user="true"
      />
    </v-sheet>
  </v-layout>
</template>

<script>
import axios from "@/utils/create-axios";
import config from "@/config";
import parseApiError from "@/utils/parse-api-error";
import InfluencerForm from "@/components/InfluencerForm";

export default {
  scrollToTop: true,
  components: {
    InfluencerForm
  },
  data() {
    return {
      loading: false,
      influencerInfo: null,
      errorSummary: null,
      successMessage: false
    };
  },
  computed: {
    title() {
      const { type } = this.$route.query;
      if (this.type == 1) return "Add New Influencer";
      if (this.type == 2) return "Add New Agency";
      return "Add New";
    }
  },
  mounted() {
    const { referredBy, type } = this.$route.query;
    this.influencerInfo = {
      referredBy,
      influencerType: type
    };
  },
  methods: {
    async submitCallback(formData) {
      this.loading = true;
      if (this.$auth.user.role >= 2) {
        formData.assignedto = this.$auth.user.id;
      }
      try {
        this.errorSummary = null;
        const url = `${config.msLandingUrl}/influencer/create`;
        const result = await axios.post(url, formData);
        this.$vuetify.goTo(0, {});
        this.successMessage = true;
        this.$nuxt.$router.replace(`/influencers/profile/${result.data.profileInfo.influencerId}`);
      } catch (error) {
        this.errorSummary = parseApiError(error);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      this.loading = false;
    },
    cancelCallback() {
      this.$nuxt.$router.replace("/influencers");
    }
  }
};
</script>
