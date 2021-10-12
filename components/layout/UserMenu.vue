<template>
  <div>
    <v-menu offset-y :close-on-content-click="false">
      <template v-slot:activator="{ on, attrs }">
        <div v-bind="attrs" v-on="on" @click="resetMessage">
          <v-avatar size="34" v-if="$auth.user.avatar">
            <img :src="avatarPreviewUrl" />
          </v-avatar>
          <span class="header-user--avatar" v-else>{{ $auth.user ? $auth.user.fullname[0] : "" }}</span>
          <span style="font-size: 14px;color: #333;">Hi, {{ $auth.user.fullname }}</span>
          <v-icon>mdi-chevron-down</v-icon>
        </div>
      </template>
      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-avatar>
              <img :src="avatarPreviewUrl" v-if="$auth.user.avatar" />
              <span class="header-user--avatar" v-else>{{ $auth.user ? $auth.user.fullname[0] : "" }}</span>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>{{ $auth.user.fullname }}</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip v-if="role" small text-color="white" :color="role.color">
                  {{ role.label }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list>
          <v-list-item :to="'/profile'">
            <v-list-item-title>Profile Settings</v-list-item-title>
            <v-list-item-icon>
              <v-icon>mdi-account-cog</v-icon>
            </v-list-item-icon>
          </v-list-item>
          <v-tooltip bottom v-if="permittedRoles.includes($auth.user.role)">
            <template v-slot:activator="{ on, attrs }">
              <v-list-item v-bind="attrs" v-on="on" @click="copyLink">
                <v-list-item-title>Copy Collabration Link</v-list-item-title>
                <v-list-item-icon>
                  <v-icon>mdi-content-copy</v-icon>
                </v-list-item-icon>
              </v-list-item>
            </template>
            <span>{{ message }}</span>
          </v-tooltip>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import config from "@/config";
import { copyToClipboard } from "@/utils/copy-text-clipboard";

export default {
  data() {
    return {
      message: "Click to copy the link!",
      permittedRoles: [0, 1, 2]
    };
  },
  computed: {
    role() {
      return config.roles.find(role => role.value === this.$auth.user.role);
    },
    avatarPreviewUrl() {
      return process.env.ASSETS_URL + this.$auth.user.avatar;
    }
  },
  methods: {
    copyLink() {
      copyToClipboard(`https://inf.iamlanistar.com/collaborate/${this.$auth.user.id}`);
      this.message = "Copied!";
    },
    resetMessage() {
      this.message = "Click to copy the link!";
    }
  }
};
</script>

<style lang="scss" scoped></style>
