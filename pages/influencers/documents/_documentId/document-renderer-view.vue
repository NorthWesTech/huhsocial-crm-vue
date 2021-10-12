<template>
  <v-app>
    <v-main>
      <document-renderer :documentId="$route.params.documentId" @load="onDocumentRendererLoad" @error="onError"></document-renderer>
      <v-snackbar :value="error" :timeout="5000" bottom color="red">
        <span v-html="error"></span>
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script>
import DocumentRenderer from "@/components/templates/document-renderer";

export default {
  auth: false,
  name: "DocumentRendererView",
  layout: "blank",
  components: {
    DocumentRenderer
  },
  data() {
    return {
      error: null
    };
  },
  methods: {
    onDocumentRendererLoad(documentId) {
      console.log("Document Renderer Loaded", documentId);
    },
    onError(error) {
      if (error.response?.data?.errors) {
        this.error = error.response.data.errors[0].message;
      } else if (error.response?.data?.description) {
        this.error = error.response.data.description;
      }
    }
  }
};
</script>
