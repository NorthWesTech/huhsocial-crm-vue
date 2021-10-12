<template>
  <v-container>
    <div id="app">
      <ckeditor v-model="editorData" :editor-url="editorUrl" :config="editorConfig"></ckeditor>
    </div>
    <v-row>
      <v-col cols="12">
        <v-btn
          large
          type="submit"
          color="primary"
          :disabled="templateName.length <= 0"
          :loading="loading"
          @click.stop="createTemplate"
        >
          Save
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from "vue";
import CKEditor from "ckeditor4-vue";

Vue.use(CKEditor);

export default {
  name: "App",
  components: {
    //'vue-ckeditor': VueCkeditor.component
  },
  layout: "blank",
  props: {
    loading: Boolean,
    defaultEditordata: String,
    templateName: String,
    disableEditor: Boolean,
    submitCallback: {
      type: Function,
      default: function(formData) {
        console.log(formData);
      }
    }
  },
  data() {
    return {
      editorData: this.defaultEditordata,
      resize_enabled: false,
      editorUrl: "https://cdn.ckeditor.com/4.14.1/full/ckeditor.js",
      editorConfig: {
        resize_enabled: false,
        height: 600,
        fullPage: true,
        allowedContent: true,
        readOnly: this.disableEditor,
        fontFamily: {
          options: [
            "default",
            "Quicksand, sans-serif",
            "Arial, Helvetica, sans-serif",
            "Courier New, Courier, monospace",
            "Georgia, serif",
            "Lucida Sans Unicode, Lucida Grande, sans-serif",
            "Tahoma, Geneva, sans-serif",
            "Times New Roman, Times, serif",
            "Trebuchet MS, Helvetica, sans-serif",
            "Verdana, Geneva, sans-serif"
          ]
        }
      }
    };
  },
  computed: {},
  created() {
    this.$root.$on("changeType", text => {
      this.editorData = "";
      this.editorData = text;
    });
  },
  async mounted() {},
  methods: {
    createTemplate() {
      this.submitCallback(this.editorData);
    }
  }
};
</script>

<style>
footer .cke_editable img {
  max-width: 200px !important;
}
</style>
