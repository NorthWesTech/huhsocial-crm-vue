<template>
  <!-- <v-dialog
    v-model="show"
    persistent
    @click:outside="closeRequest"
    scrollable
    max-width="70%">

  </v-dialog> -->
  <v-card>
    <v-card-title>Files</v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <div class="drop-area" v-cloak @drop.prevent="addFile" @dragover.prevent>
        <h2>File to Upload (Drag it over)</h2>
      </div>
      <v-row>
        <v-col sm="10">
          <v-file-input
            outlined
            dense
            chips
            v-model="file"
            @change="fileChanged"
            show-size
            truncate-length="18"
            placeholder="Choose a file"
          ></v-file-input>
        </v-col>
        <v-col sm="2" style="align-self: center;">
          <v-btn color="primary" block :loading="loading" :disabled="!file" @click="uploadFile">
            upload
          </v-btn>
        </v-col>
      </v-row>

      <v-divider></v-divider>
      <v-list subheader two-line>
        <v-list-item-group v-model="selectedItem" disabled>
          <v-list-item v-for="item in files" v-bind:key="item.id">
            <v-list-item-avatar>
              <v-icon class="grey lighten-1" dark>
                mdi-file
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="item.fileName"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn @click="download(item.id, item.fileName)" icon>
                <v-icon color="grey lighten-1">mdi-cloud-download</v-icon>
              </v-btn>
            </v-list-item-action>
            <v-list-item-action>
              <v-btn @click="deleteFile(item.id)" icon>
                <v-icon color="grey lighten-1">mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card-text>
    <v-card-actions class="pr-5" v-if="selectable">
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" text @click="$emit('close')">
        Close
      </v-btn>
      <v-btn color="blue darken-1" dark @click="selectFile">
        Select
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from "@/utils/create-axios";
import config from "@/config";

export default {
  props: {
    influencerId: null,
    selectable: false
  },
  name: "FilesDialog",
  computed: {},
  data() {
    return {
      file: null,
      files: [],
      loading: false,
      selectedItem: null
    };
  },
  created() {
    this.refreshFiles();
  },
  methods: {
    async refreshFiles() {
      const url = `${config.msLandingUrl}/influencer/${this.influencerId}/files`;
      const result = await axios.get(url);
      if (result && result.data) {
        //TODO: put and check response code here!
        this.files = result.data.files;
      }
      this.$emit("input", result.data.files);
    },
    fileChanged(e) {
      console.log(e);
      console.log(this.file);
    },
    addFile(e) {
      this.file = e.dataTransfer.files[0];
    },
    async deleteFile(id) {
      const url = `${config.msLandingUrl}/influencer/files/${id}`;
      await axios.delete(url);
      this.refreshFiles();
    },
    async download(id, fileName) {
      const url = `${config.msLandingUrl}/influencer/files/${id}`;
      axios({
        url: url,
        method: "GET",
        responseType: "blob" // important
      }).then(response => {
        console.log(response);

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
      });
    },

    async uploadFile() {
      if (!this.file) {
        return;
      }
      this.loading = true;
      var formData = new FormData();
      formData.append("file", this.file);
      // formData.append("influencer", this.influencer);
      const url = `${config.msLandingUrl}/influencer/${this.influencerId}/files`;

      const result = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (result.data.errors) {
        console.log(result.data.errors);
      }

      if (result && result.data && result.data.code === 6000) {
        this.loading = false;
        this.refreshFiles();
      }

      this.file = null;
    },
    selectFile() {
      this.$emit("select", this.files[this.selectedItem]);
    }
  }
};
</script>

<style lang="scss" scoped>
.drop-area {
  margin-top: 10px;
  height: 100px;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  background-color: #efefef;
  border: 1px dashed #999;

  h2 {
    color: #666;
  }
}
</style>
