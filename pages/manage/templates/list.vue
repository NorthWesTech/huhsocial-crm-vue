<template>
  <v-app>
    <h3>Template Management Page</h3>
    <templatelist
      :templates-data="templatesData"
      :delete-callback="deleteTemplate"
      @refreshTemplateList="getTemplatesList"
    ></templatelist>
  </v-app>
</template>

<script>
import axios from "../../../utils/create-axios";
import config from "../../../config";
import templatelist from "../../../components/templates/templatelist";

export default {
  components: {
    templatelist
  },
  data() {
    return {
      templatesData: []
    };
  },
  computed: {},

  async mounted() {
    this.getTemplatesList();
  },
  methods: {
    async deleteTemplate(templateid) {
      try {
        const url = `${config.msLandingUrl}/templates/deleteTemplateById/${templateid}`;
        const result = await axios.get(url);
        if (result) {
          const deletedItemIndex = this.templatesData.findIndex(item => {
            return item.template_id === templateid;
          });
          this.templatesData.splice(deletedItemIndex, 1);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async getTemplatesList() {
      try {
        const url = `${config.msLandingUrl}/templates/alltemplates`;
        const result = await axios.get(url);
        if (result) {
          console.log(result);
          this.templatesData = result.data;
          console.log("---" + this.templatesData.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
};
</script>
