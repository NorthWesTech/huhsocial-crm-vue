<template>
  <v-dialog v-model="modalIsVisible" :loading="loading" max-width="600">
    <template #activator="{ on, attrs }">
      <v-btn outlined color="green" v-bind="attrs" v-on="on"> {{ buttonLabel }} </v-btn>
    </template>
    <v-card>
      <v-card-title class="headline">{{ title }}</v-card-title>
      <v-card-text>{{ infoText }}</v-card-text>
      <v-alert v-if="templates.length === 0" text color="warning"> No templates found with this type! </v-alert>
      <template v-if="templates.length > 0">
        <v-divider />
        <v-list-item-group v-for="t in templates" :key="`template-sel-${t.id}`">
          <v-list-item two-line @click.prevent="() => handleSelect(t.id)">
            <v-list-item-content>
              <v-list-item-title>{{ t.name }}</v-list-item-title>
              <v-list-item-subtitle
                >Language: {{ printLanguage(t.language) }} Created:
                {{ $dayjs(t.createdAt).format("DD.MM.YYYY HH:mm") }}</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
          <v-divider />
        </v-list-item-group>
      </template>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" text @click="handleDismiss">Dismiss</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import globalMixins from "../../mixins/globals";

export default {
  name: "SelectTemplateModal",
  mixins: [globalMixins],
  props: {
    influencerId: {
      type: String,
      required: true
    },
    templateType: {
      type: Number,
      required: true
    },
    infoText: {
      type: String,
      default: "Please select a template"
    },
    title: {
      type: String,
      default: "Select A Template"
    },
    buttonLabel: {
      type: String,
      default: "Select A Template"
    }
  },
  data() {
    return {
      modalIsVisible: false,
      templates: [],
      loading: false
    };
  },
  async mounted() {
    this.loadTemplates();
  },
  methods: {
    handleSelect(templateId) {
      this.$emit("onSelect", templateId);
    },
    handleDismiss() {
      this.modalIsVisible = false;
      this.$emit("onDismiss");
    },
    async loadTemplates() {
      this.loading = true;
      try {
        const result = await this.$templates2Service.list({ templateTypes: [this.templateType] });
        if (result.list) {
          this.templates = result.list;
        }
      } catch (error) {
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors;
        } else if (error.response?.data?.description) {
          this.errors = [
            {
              message: error.response.data.description,
              code: error.response.data.code,
              prop: null
            }
          ];
        }
      }
      this.loading = false;
    }
  }
};
</script>
