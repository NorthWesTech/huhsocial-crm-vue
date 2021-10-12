<template>
  <v-speed-dial
    v-model="fab"
    v-if="isShow"
    class="quick-menu"
    :open-on-hover="false"
    transition="slide-y-reverse-transition"
  >
    <template v-slot:activator>
      <v-btn v-model="fab" color="blue darken-2" dark fab>
        <v-icon v-if="fab">
          mdi-close
        </v-icon>
        <v-icon v-else>
          mdi-account-circle
        </v-icon>
      </v-btn>
    </template>
    <v-btn dark small color="green" to="/influencers/new?type=2"> <v-icon>mdi-plus</v-icon> Add Agency </v-btn>
    <v-btn dark small color="indigo" to="/influencers/new?type=1"> <v-icon>mdi-plus</v-icon> Add Influencer </v-btn>
  </v-speed-dial>
</template>

<script>
export default {
  data() {
    return {
      fab: false
    };
  },
  computed: {
    isShow() {
      const routes = [
        "influencers-new",
        "influencers-new-type",
        "influencers-edit-id",
        "multiple-signature-contract-id"
      ];
      return !routes.includes(this.$route.name);
    }
  },
  watch: {
    "$route.path": function() {
      this.fab = false;
    }
  }
};
</script>

<style lang="scss">
.quick-menu {
  right: 1rem;
  bottom: 3rem;
  position: fixed !important;

  .v-speed-dial__list {
    align-items: flex-end !important;
  }
}
</style>
