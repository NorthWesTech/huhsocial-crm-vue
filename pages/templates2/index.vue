<template>
  <div class="pb-10">
    <v-row>
      <v-col md="9">
        <h1 class="mb-2">Document Templates</h1>
      </v-col>
      <v-col md="3" class="d-flex justify-end">
        <v-btn class="green" large dark elevation="0" :to="{ name: 'templates2-create' }" nuxt>
          Add New Template
        </v-btn>
      </v-col>
    </v-row>
    <v-form @submit.prevent="debouncedQuery">
      <v-card class="elevation-2 mb-2">
        <v-card-text>
          <v-row class="filter">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="searchQuery"
                small
                hide-details
                placeholder="Search by template name"
                append-icon="mdi-magnify"
                :error-messages="null"
                class="pt-0"
                outlined
                @input="debouncedQuery"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                ref="templateType"
                v-model="selectedTemplateTypes"
                small
                hide-details
                multiple
                :items="templateTypes"
                item-text="label"
                item-value="value"
                label="Document Type"
                outlined
                @change="navigate"
              >
                <template #selection="{ item, index }">
                  <span v-if="index === 0">{{
                    item.label.length > 12 && selectedTemplateTypes.length > 1
                      ? item.label.substr(0, 12) + "..."
                      : item.label
                  }}</span>
                  <span v-if="index === 1" class="grey--text caption ml-1">
                    (and +{{ selectedTemplateTypes.length - 1 }} others)
                  </span>
                </template>
              </v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                ref="language"
                v-model="selectedLanguages"
                small
                multiple
                hide-details
                item-text="label"
                item-value="value"
                :items="languages"
                label="Language"
                outlined
                @change="navigate"
              >
                <template #selection="{ item, index }">
                  <span v-if="index === 0">{{ item.label }}</span>
                  <span v-if="index === 1">, {{ item.label }}</span>
                  <span v-if="index === 2" class="grey--text caption ml-1">
                    (and +{{ selectedLanguages.length - 2 }} others)
                  </span>
                </template>
              </v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-form>

    <v-sheet class="pa-5">
      <v-data-table
        str
        :options.sync="tableOptions"
        :loading="loading"
        :headers="tableHeaders"
        :items="templates"
        :items-per-page="limit"
        hide-default-footer
        class="elevation-0 mb-3"
        data-cy="templates-table"
        @update:sort-by="handleSortChange"
        @update:sort-desc="handleSortChange"
      >
        <template #[`item.name`]="{ item }">
          <nuxt-link :to="{ name: 'templates2-edit', params: { edit: item.id } }" data-cy="table-name">
            {{ item.name }}
          </nuxt-link>
        </template>
        <template #[`item.created_at`]="{ item }">
          {{ item.createdAt }}
        </template>
        <template #[`item.templateType`]="{ item }">
          {{ printTypeName(item.templateType) }}
        </template>
        <template #[`item.language`]="{ item }">
          {{ printLanguage(item.language) }}
        </template>
        <template #[`item.action`]="{ item }">
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn
                icon
                link
                :to="{
                  name: 'templates2-edit',
                  params: { edit: item.id }
                }"
                v-on="on"
              >
                <v-icon>mdi-notebook-edit-outline</v-icon>
              </v-btn>
            </template>
            <span>Edit</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn v-if="$auth.user.role === 1" color="red" icon v-on="on" @click.stop="openDeleteDialog(item.id)">
                <v-icon>mdi-delete-outline</v-icon>
              </v-btn>
            </template>
            <span>Delete</span>
          </v-tooltip>
        </template>
      </v-data-table>

      <v-pagination v-model="currentPage" :length="totalPageNum" :total-visible="7" @input="navigate"></v-pagination>
    </v-sheet>

    <v-dialog :value="idToDelete" max-width="290">
      <v-card>
        <v-card-title class="headline">Delete Template</v-card-title>
        <v-card-text>Are you sure to delete this template?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray" text @click="dismissDeleteDialog">Dismiss</v-btn>
          <v-btn color="red darken-1" text @click.stop="deleteInfluencer">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { debounce } from "lodash";
import config from "../../config";
import RouteHelper from "@/utils/route-helper";
import globalMixins from "../../mixins/globals";

export default {
  name: "Templates2Index",
  mixins: [globalMixins],
  data() {
    return {
      templates: [],
      currentPage: 1,
      limit: 30,
      totalCount: 0,
      searchQuery: null,
      selectedTemplateTypes: null,
      selectedLanguages: ["en"],
      templateTypes: config.templatesType,
      languages: config.languages,
      loading: false,
      idToDelete: null,
      tableOptions: {
        sortBy: ["created_at"],
        sortDesc: ["DESC"]
      },
      tableHeaders: [
        {
          text: "Template Name",
          value: "name",
          sortable: true
        },
        {
          text: "Created Date",
          value: "created_at",
          align: "center",
          sortable: true
        },
        {
          text: "Lang",
          value: "language",
          sortable: false,
          align: "center",
          width: 150
        },
        {
          text: "Type",
          value: "templateType",
          sortable: false,
          align: "center",
          width: 250
        },
        {
          text: "Actions",
          value: "action",
          align: "center",
          sortable: false
        }
      ]
    };
  },
  computed: {
    filteringParams() {
      return {
        skip: this.limit * (this.currentPage - 1),
        take: this.limit,
        searchQuery: this.searchQuery,
        templateTypes: this.selectedTemplateTypes,
        languages: this.selectedLanguages,
        sort: this.tableOptions.sortBy[0],
        order: this.tableOptions.sortDesc[0] ? "DESC" : "ASC"
      };
    },
    totalPageNum() {
      return Math.ceil(this.totalCount / this.limit);
    }
  },
  watch: {},
  async created() {
    const params = RouteHelper.getHashParams(this.$route);
    this.currentPage = Object.prototype.hasOwnProperty.call(params, "currentPage") ? Number(params.currentPage) : 1;
    const sort = Object.prototype.hasOwnProperty.call(params, "sort") ? params.sort : "created_at";
    const order = Object.prototype.hasOwnProperty.call(params, "order") ? params.order : "DESC";
    this.searchQuery = Object.prototype.hasOwnProperty.call(params, "searchQuery") ? params.searchQuery : null;
    this.selectedTemplateTypes = Object.prototype.hasOwnProperty.call(params, "templateTypes")
      ? params.templateTypes.split(",").map(Number)
      : null;
    this.selectedLanguages = Object.prototype.hasOwnProperty.call(params, "languages")
      ? params.languages.split(",")
      : ["en"];
    this.tableOptions = {
      sortBy: [sort],
      sortDesc: [order === "DESC"]
    };
    await this.getTemplates();
  },
  methods: {
    handleSortChange() {
      this.sort = this.tableOptions.sortBy;
      this.order = this.tableOptions.sortDesc ? "DESC" : "ASC";
      this.currentPage = 1;
      this.navigate();
    },
    async getTemplates() {
      try {
        const templatesResult = await this.$templates2Service.list(this.filteringParams);
        this.templates = templatesResult.list;
        this.totalCount = templatesResult.count;
      } catch (error) {
        console.log(error);
      }
    },
    debouncedQuery: debounce(function () {
      if (this.currentPage === 1) {
        this.navigate();
        return;
      }
      this.currentPage = 1;
    }, 500),
    async navigate() {
      const parts = [];
      parts.push(`currentPage=${this.currentPage}`);
      parts.push(`limit=${this.limit}`);

      if (this.searchQuery) {
        parts.push(`searchQuery=${this.searchQuery}`);
      }
      if (this.selectedTemplateTypes) {
        parts.push(`templateTypes=${this.selectedTemplateTypes.join(",")}`);
      }
      if (this.selectedLanguages) {
        parts.push(`languages=${this.selectedLanguages.join(",")}`);
      }
      if (this.sort) {
        parts.push(`sort=${this.sort}`);
      }
      if (this.order) {
        parts.push(`order=${this.order}`);
      }

      this.$router.push({
        path: `/templates2#${parts.join("&")}`
      });
      await this.getTemplates();
    },
    openDeleteDialog(id) {
      this.idToDelete = id;
    },
    dismissDeleteDialog() {
      this.idToDelete = null;
    },
    async deleteInfluencer() {
      await this.templates2Service.delete(this.idToDelete);
      this.idToDelete = null;
      this.$emit("refreshData");
    }
  }
};
</script>
