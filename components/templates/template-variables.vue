<template>
  <div class="variable-container">
    <v-row>
      <v-col cols="4">
        <v-btn icon small @click="copyToClipboard('{{currentDate}})')">
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        {{ "\{\{currentDate\}\}" }}
      </v-col>
      <v-col cols="8">
        {{ currentDate }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-btn icon small @click="copyToClipboard('{{influencer.firstName}}')">
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        {{ "\{\{influencer.firstName\}\}" }}
      </v-col>
      <v-col cols="7">
        {{ templateData.influencer.firstName }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-btn icon small @click="copyToClipboard('{{influencer.lastName}}')">
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        {{ "\{\{influencer.lastName\}\}" }}
      </v-col>
      <v-col cols="8">
        {{ templateData.influencer.lastName }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-btn icon small @click="copyToClipboard('{{influencer.fullName}}')">
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        {{ "\{\{influencer.fullName\}\}" }}
      </v-col>
      <v-col cols="7"> {{ templateData.influencer.firstName }} {{ templateData.influencer.lastName }} </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-btn icon small @click="copyToClipboard('{{influencer.email}}')">
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        {{ "\{\{influencer.email\}\}" }}
      </v-col>
      <v-col cols="8">
        {{ templateData.influencer.email }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-btn icon small @click="copyToClipboard('{{influencer.phone}}')">
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        {{ "\{\{influencer.phone\}\}" }}
      </v-col>
      <v-col cols="8">
        {{ templateData.influencer.phone }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-btn icon small @click="copyToClipboard('{{influencer.contractValue}}')">
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        {{ "\{\{influencer.contractValue\}\}" }}
      </v-col>
      <v-col cols="8">
        {{ templateData.influencer.contractValue }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-btn icon small @click="copyToClipboard('{{influencer.contractShares}}')">
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        {{ "\{\{influencer.contractShares\}\}" }}
      </v-col>
      <v-col cols="8">
        {{ templateData.influencer.contractShares }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-btn icon small @click="copyToClipboard('{{company.name}}')">
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        {{ "\{\{company.name\}\}" }}
      </v-col>
      <v-col cols="8">
        {{ templateData.company.name }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-btn icon small @click="copyToClipboard('{{company.person}}')">
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        {{ "\{\{company.person\}\}" }}
      </v-col>
      <v-col cols="8">
        {{ templateData.company.person }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-btn icon small @click="copyToClipboard('{{company.address.line1}}')">
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        {{ "\{\{company.address.line1\}\}" }}
      </v-col>
      <v-col cols="8">
        {{ templateData.company.address.line1 }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-btn icon small @click="copyToClipboard('{{company.address.line2}}')">
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        {{ "\{\{company.address.line2\}\}" }}
      </v-col>
      <v-col cols="8">
        {{ templateData.company.address.line2 }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-btn icon small @click="copyToClipboard('{{company.address.postcode}}')">
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        {{ "\{\{company.address.postcode\}\}" }}
      </v-col>
      <v-col cols="8">
        {{ templateData.company.address.postcode }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-btn icon small @click="copyToClipboard('{{company.address.city}}')">
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        {{ "\{\{company.address.city\}\}" }}
      </v-col>
      <v-col cols="8">
        {{ templateData.company.address.city }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-btn icon small @click="copyToClipboard('{{company.address.country}}')">
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        {{ "\{\{company.address.country\}\}" }}
      </v-col>
      <v-col cols="8">
        {{ templateData.company.address.country }}
      </v-col>
    </v-row>
  </div>
</template>

<script>
import globalMixins from "../../mixins/globals";

export default {
  name: "TemplateVariables",
  mixins: [globalMixins],
  props: {
    templateData: {
      type: Object,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
.variable-container {
  overflow-y: auto;
  max-height: 400px;
}
</style>
