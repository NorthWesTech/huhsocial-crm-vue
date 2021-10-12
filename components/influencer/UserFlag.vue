<template>
  <div class="user-flag">
    <country-flag
      :title="countryName(user.countrycode)"
      v-if="user.countrycode"
      :country="user.countrycode"
      size="normal"
    />
    <span class="no-image" v-else></span>
  </div>
</template>

<script>
import countries from "@/countries";
import CountryFlag from "vue-country-flag";

export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  components: {
    CountryFlag
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
    }
  }
};
</script>

<style lang="scss">
.user-flag {
  display: inline-block;
}
</style>
