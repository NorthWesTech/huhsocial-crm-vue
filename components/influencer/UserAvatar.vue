<template>
  <div class="user-avatar">
    <v-avatar :size="avatarSize" v-if="source != ''">
      <img :src="source" alt="user-avatar" />
    </v-avatar>
    <v-avatar color="grey" :size="avatarSize" v-else>
      <span class="white--text headline" :class="`size-${size}`">{{ avatar }}</span>
    </v-avatar>
  </div>
</template>

<script>
export default {
  props: {
    avatar: {
      type: String,
      default: "LS"
    },
    size: {
      type: String,
      defult: "md"
    },
    source: String
  },
  computed: {
    avatarSize() {
      if (this.size === "sm") return 54;
      if (this.size === "xs") return 40;
      if (this.size === "lg") return 128;
      return 72;
    }
  }
};
</script>
<style lang="scss">
.user-avatar {
  .headline.size-xs {
    font-size: 1rem !important;
  }

  .headline.size-sm {
    font-size: 1.25rem !important;
  }
}
</style>
