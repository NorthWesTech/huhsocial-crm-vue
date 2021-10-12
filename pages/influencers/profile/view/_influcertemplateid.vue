<template>
  <div id="app" style="padding:10px;">
    <v-sheet v-if="warningMessage">
      <v-alert type="warning">
        {{ warningMessage }}
      </v-alert>
    </v-sheet>

    <div v-if="editorData">
      <v-col cols="12" md="12">
        <div style="pointer-events: none;" v-html="editorData"></div>
      </v-col>
    </div>
  </div>
</template>
<style scoped>
.cke_wysiwyg_frame h2 {
  color: red !important;
}
.cke_wysiwyg_frame p {
  color: red !important;
}
.theme--light.v-btn:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
  background-color: #1976d2 !important;
}
.sigPad {
  border: 1px solid #ccc;
}

.ck.ck-editor__main > .ck-editor__editable:not(.ck-focused) {
  border: 0 !important;
}
</style>

<style>
[data-signature] {
  height: 65px !important;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  margin-top: 5px;
}
</style>

<script>
import Vue from "vue";
import Vuelidate, { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

import config from "@/config";
import axios from "@/utils/create-axios";
import parseApiError from "@/utils/parse-api-error";

Vue.use(Vuelidate);

export default {
  props: {
    source: String
  },
  auth: false,
  //layout: 'blank',

  data() {
    return {
      loading: false,
      warningMessage: null,
      editorData: null
      // inf_template_id: null,
      // fullname: null,
      // isEmptyPad: true,
      // infTemplateId: null,
      // sign: null,
    };
  },
  computed: {},
  async mounted() {
    const { influcertemplateid } = this.$route.params;

    if (!influcertemplateid) {
      this.warningMessage = "Invalid Link !";
      return;
    }

    // this.inf_template_id = influcertemplateid;

    this.getInfTemplateById(influcertemplateid);
  },
  // validations: {
  //   fullname: {
  //     required
  //   }
  // },
  methods: {
    async getInfTemplateById(infTemplateId) {
      this.loading = true;
      try {
        // const url = `${config.msLandingUrl}/templates/getInfluencersTemplateById/${infTemplateId}`;
        const result = await this.$templatesService.getInfluencersTemplateById(infTemplateId); //await axios.get(url);
        if (result) {
          this.editorData = result.influencer_template_content;
          // this.infTemplateId = result.data.influencer_templates_id;
          // this.fullname = result.data.influencer_signature_name;
          // this.sign = result.data.influencer_signature;
        } else {
          this.warningMessage = "Link is not valid anymore !";
        }
      } catch (error) {
        this.warningMessage = parseApiError(error);
      }
      this.loading = false;
    }
  }
};
</script>
