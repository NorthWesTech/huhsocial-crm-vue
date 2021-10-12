<i18n>
{
  "en": {
    "campaign": "Campaign",
    "campaignStartDate": "Campaign Start Date",
    "campaignEndDate": "Campaign End Date",
    "midCampaignDate": "Mid-Campaign Date",
    "enterCampaignName": "Enter the Campaign Name",
    "enterCampaignStartDate": "Enter the Campaign Start Date",
    "enterCampaignEndDate": "Enter the Campaign End Date",
    "enterMidCampaignDate": "Enter the Mid-Campaign Date"
  }
}
</i18n>

<template>
  <div>
    <div class="table-container no-content dark" style="margin-top: 2rem">
      <div class="section-title">{{ $t("campaign") }}</div>
      <div class="table-title">
        <label v-if="editMode">
          <textarea
            v-model="campaign"
            class="form-control"
            :placeholder="$t('enterCampaignName')"
            required="required"
            name="campaign"
            cols="45"
            rows="2"
          ></textarea>
        </label>
        <span v-if="!editMode">{{ campaign }}</span>
      </div>
    </div>

    <div class="table-container no-content">
      <div class="section-title">{{ $t("campaignStartDate") }}</div>
      <div class="table-title">
        <label v-if="editMode">
          <textarea
            v-model="campaignStartDate"
            class="form-control"
            :placeholder="$t('enterCampaignStartDate')"
            required="required"
            name="campaignStartDate"
            cols="45"
            rows="2"
          ></textarea>
        </label>
        <span v-if="!editMode">{{ campaignStartDate }}</span>
      </div>
    </div>

    <div class="table-container no-content dark">
      <div class="section-title">{{ $t("campaignEndDate") }}</div>
      <div class="table-title">
        <label v-if="editMode">
          <textarea
            v-model="campaignEndDate"
            class="form-control"
            name="campaignEndDate"
            :placeholder="$t('enterCampaignEndDate')"
            required="required"
            cols="45"
            rows="2"
          />
        </label>
        <span v-if="!editMode">{{ campaignEndDate }}</span>
      </div>
    </div>

    <div class="table-container no-content">
      <div class="section-title">{{ $t("midCampaignDate") }}</div>
      <div class="table-title">
        <label v-if="editMode">
          <textarea
            v-model="midCampaignDate"
            class="form-control"
            name="midCampaignDate"
            :placeholder="$t('enterMidCampaignDate')"
            required="required"
            cols="45"
            rows="2"
          />
        </label>
        <span v-if="!editMode">{{ midCampaignDate }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TemplateCampaignInfoBlock",
  props: {
    blockId: {
      type: String,
      required: true
    },
    pageIndex: {
      type: Number,
      required: true
    },
    content: {
      type: Object,
      default: null
    },
    editMode: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      campaign: null,
      campaignStartDate: null,
      campaignEndDate: null,
      midCampaignDate: null
    };
  },
  watch: {
    campaign() {
      this.handleChange();
    },
    campaignStartDate() {
      this.handleChange();
    },
    campaignEndDate() {
      this.handleChange();
    },
    midCampaignDate() {
      this.handleChange();
    }
  },
  async mounted() {
    this.campaign = "" + this.content.campaign;
    this.campaignStartDate = "" + this.content.campaignStartDate;
    this.campaignEndDate = "" + this.content.campaignEndDate;
    this.midCampaignDate = "" + this.content.midCampaignDate;
  },
  methods: {
    handleChange() {
      // this.$emit("content-changed", {
      //   campaign: this.campaign,
      //   campaignStartDate: this.campaignStartDate,
      //   campaignEndDate: this.campaignEndDate,
      //   midCampaignDate: this.midCampaignDate
      // });
      this.$store.dispatch("template-editor/updateBlock", {
        pageIndex: this.pageIndex,
        block: {
          blockType: "campaign-info",
          id: this.blockId,
          content: {
            campaign: this.campaign,
            campaignStartDate: this.campaignStartDate,
            campaignEndDate: this.campaignEndDate,
            midCampaignDate: this.midCampaignDate
          }
        }
      });
    }
  }
};
</script>
