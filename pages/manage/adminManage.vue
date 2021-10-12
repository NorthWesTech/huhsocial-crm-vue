<template>
  <v-app>
    <h3><i class="fa fa-user"></i> User Management Page</h3>
    <v-card class="elevation-2 mb-2">
      <v-card-text>
        <v-row class="filter">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchClue"
              small
              placeholder="Search by name, email or phone number"
              append-icon="mdi-magnify"
              class="pt-0"
              outlined
              dense
              @input="debouncedQuery"
              @change="navigate"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="role"
              :items="roles"
              item-text="label"
              item-value="value"
              auto-select-first
              outlined
              dense
              class="no-padding"
              @change="navigate"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <adminslist :admins="data" @refreshAdminList="getAdminList"></adminslist>
  </v-app>
</template>

<script>
import adminslist from "../../components/adminslist";
import config from "../../config";
import { debounce } from "lodash";
export default {
  components: {
    adminslist
  },
  data() {
    return {
      data: [],
      role: -1,
      roles: [{ label: "All Roles", value: -1 }, ...config.roles],
      searchClue: ""
    };
  },
  watch: {
    $route() {
      this.getAdminList();
    }
  },
  async mounted() {
    return this.getAdminList();
  },
  methods: {
    async getAdminList() {
      this.loading = true;

      try {
        const data = {
          searchClue: this.searchClue?.toLowerCase(),
          role: this.role !== -1 ? this.role : undefined
        };

        this.data = await this.$userService.list(data);
        this.loading = false;
      } catch (error) {
        console.log(error.response);
      }
    },
    debouncedQuery: debounce(function() {
      this.navigate();
    }, 500),
    navigate() {
      const search = this.searchClue;
      const role = this.role;

      let query = "#";
      if (search != "") {
        query += `search=${search}&`;
      }
      if (role && role != -1) {
        query += `role=${role}&`;
      }
      if (query != "") {
        query = query.slice(0, -1);
      }
      this.$router.push({
        path: `/manage/adminManage${query}`
      });
    }
  }
};
</script>

<style lang="scss">
h3 {
  margin: 30px;
}
</style>
