<i18n>
{
  "en": {
    "DATE": "DATE",
    "commencementDate": "Commencement Date",
    "BETWEEN": "BETWEEN",
    "address": "Address",

    "enterYourName": "Enter your name",
    "enterCompanyName": "Enter company name",
    "addressLine1": "Address line 1",
    "addressLine2": "Address line 2",
    "cityTown": "City - Town",
    "country": "Country",
    "postcode": "Postcode",
    "companyInfo": "Enter a company info text like: XXX a company incorporated in England and Wales with company number XXX whose registered address is at XXX"
  }
}
</i18n>

<template>
  <div>
    <p>
      <strong>{{ $t("DATE") }}: {{ currentDate }} (&quot;{{ $t("commencementDate") }}&quot;)</strong>
    </p>

    <p>
      <strong>{{ $t("BETWEEN") }}:</strong>
    </p>

    <div v-for="(recipient, rindex) in recipientData" :key="`acceptor-${recipient.id}`" class="section-container">
      <div class="section-subtitle">
        ({{ Number(rindex) + 1 }}) <strong>{{ recipient.selectedRecipient.recipientType }}:</strong>
      </div>
      <div class="section-content">
        <template v-if="rindex === 0">
          <p v-html="recipient.selectedRecipient.companyInfo"></p>
        </template>
        <template v-else>
          <p
            v-if="currentRecipientId !== recipient.selectedRecipient.id && recipient.selectedRecipient.isCompany"
            v-html="recipient.selectedRecipient.companyInfo"
          ></p>
          <p v-if="currentRecipientId === recipient.selectedRecipient.id && recipient.selectedRecipient.isCompany">
            <textarea
              cols="60"
              rows="3"
              :class="{
                'form-control': true,
                'current-recipient': true
              }"
              :value="currentRecipientData.companyInfo"
              data-propname="companyInfo"
              :data-recipient="recipient.id"
              :placeholder="$t('companyInfo')"
              @input="handleInputChange"
            ></textarea>
          </p>

          <p v-if="currentRecipientId !== recipient.selectedRecipient.id">
            <strong>{{ recipient.recipientName }}</strong>
            <br />
            {{ recipient.addressLine1 }}<br />
            <span v-if="recipient.addressLine2">{{ recipient.addressLine2 }}<br /></span>
            {{ recipient.addressPostcode }}<br />
            {{ recipient.addressCity }} {{ recipient.addressCountry }}
          </p>
          <div v-else>
            <div class="template-row">
              <div class="template-col">
                <label>
                  <input
                    :value="$v.currentRecipientData.recipientName.$model"
                    :class="{
                      'form-control': true,
                      'has-error': $v.currentRecipientData.addressLine1.$error,
                      'current-recipient': true
                    }"
                    data-propname="recipientName"
                    :data-recipient="recipient.id"
                    :placeholder="$t('recipientName')"
                    type="text"
                    @input="handleInputChange"
                  />
                </label>
              </div>
            </div>
            <div class="template-row">
              <div class="template-col">
                <label>
                  <input
                    :value="$v.currentRecipientData.addressLine1.$model"
                    :class="{
                      'form-control': true,
                      'has-error': $v.currentRecipientData.addressLine1.$error,
                      'current-recipient': true
                    }"
                    data-propname="addressLine1"
                    :data-recipient="recipient.id"
                    :placeholder="$t('addressLine1')"
                    required="required"
                    type="text"
                    @input="handleInputChange"
                  />
                </label>
              </div>
              <div class="template-col">
                <label>
                  <input
                    :value="currentRecipientData.addressLine2"
                    :class="{
                      'form-control': true,
                      'current-recipient': true
                    }"
                    data-propname="addressLine2"
                    :data-recipient="recipient.id"
                    :placeholder="$t('addressLine2')"
                    type="text"
                    @input="handleInputChange"
                  />
                </label>
              </div>
            </div>
            <div class="template-row">
              <div class="template-col">
                <label>
                  <input
                    :value="$v.currentRecipientData.addressCity.$model"
                    :class="{
                      'form-control': true,
                      'has-error': $v.currentRecipientData.addressCity.$error,
                      'current-recipient': true
                    }"
                    data-propname="addressCity"
                    :data-recipient="recipient.id"
                    :placeholder="$t('cityTown')"
                    required="required"
                    type="text"
                    @input="handleInputChange"
                  />
                </label>
              </div>
              <div class="template-col">
                <label>
                  <input
                    :value="$v.currentRecipientData.addressPostcode.$model"
                    :class="{
                      'form-control': true,
                      'has-error': $v.currentRecipientData.addressPostcode.$error,
                      'current-recipient': true
                    }"
                    data-propname="addressPostcode"
                    :data-recipient="recipient.id"
                    :placeholder="$t('postcode')"
                    required="required"
                    type="text"
                    @input="handleInputChange"
                  />
                </label>
              </div>
              <div class="template-col">
                <label>
                  <input
                    :value="$v.currentRecipientData.addressCountry.$model"
                    :class="{
                      'form-control': true,
                      'has-error': $v.currentRecipientData.addressCountry.$error,
                      'current-recipient': true
                    }"
                    data-propname="addressCountry"
                    :data-recipient="recipient.id"
                    :placeholder="$t('country')"
                    required="required"
                    type="text"
                    @input="handleInputChange"
                  />
                </label>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { mapState, mapActions } from "vuex";
import Vuelidate, { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

import { EventBus } from "@/pages/event";

Vue.use(Vuelidate);

export default {
  name: "TemplateAcceptorsBlock",
  mixins: { validationMixin },
  props: {
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
      currentRecipientId: null,
      currentRecipientData: {
        recipientName: null,
        companyInfo: null,
        addressLine1: null,
        addressLine2: null,
        addressPostcode: null,
        addressCity: null,
        addressCountry: null
      },
      currentDate: this.editMode ? "{{ currentDate }}" : new Date()
    };
  },
  computed: {
    ...mapState({
      recipients: state => state["template-editor"].recipients,
      recipientData: state => state["template-editor"].recipientData,
      language: state => state["template-editor"].language
    }),
    currentRecipientIndex() {
      return this.recipients.findIndex(r => r.id === this.currentRecipientId);
    }
  },
  watch: {
    language: {
      deep: false,
      handler(val) {
        this.$i18n.locale = val;
      }
    }
  },
  mounted() {
    this.$i18n.locale = this.language;
    this.currentRecipientId = this.$route.query.r;
    const currentRecipient = this.recipientData[this.currentRecipientIndex];
    if (!currentRecipient) return;
    // for getting rid of vuex props we're creating new variables with String()
    this.currentRecipientData = {
      recipientName: currentRecipient.recipientName ? String(currentRecipient.recipientName) : "",
      companyInfo: currentRecipient.companyInfo ? String(currentRecipient.companyInfo) : "",
      addressLine1: currentRecipient.addressLine1 ? String(currentRecipient.addressLine1) : "",
      addressLine2: currentRecipient.addressLine2 ? String(currentRecipient.addressLine2) : "",
      addressPostcode: currentRecipient.addressPostcode ? String(currentRecipient.addressPostcode) : "",
      addressCity: currentRecipient.addressCity ? String(currentRecipient.addressCity) : "",
      addressCountry: currentRecipient.addressCountry ? String(currentRecipient.addressCountry) : ""
    };

    this.registerValidation(this.blockId);
    EventBus.$on("sign-submit", () => {
      this.$v.$touch();
      this.setValidationStatus({ isValid: !this.$v.$invalid, source: this.blockId });
    });
  },
  validations() {
    return {
      currentRecipientData: {
        recipientName: {
          required
        },
        companyInfo: {},
        addressLine1: {
          required
        },
        addressLine2: {},
        addressPostcode: {
          required
        },
        addressCity: {
          required
        },
        addressCountry: {
          required
        }
      }
    };
  },
  methods: {
    ...mapActions({
      updateRecipientData: "template-editor/updateRecipientData",
      registerValidation: "template-editor/registerValidation",
      setValidationStatus: "template-editor/setValidationStatus"
    }),
    handleInputChange($event) {
      const fieldName = $event.target.getAttribute("data-propname");
      this.currentRecipientData[fieldName] = $event.target.value;
      this.$v.currentRecipientData[fieldName].$touch();
      this.updateRecipientData({
        index: this.currentRecipientIndex,
        propName: fieldName,
        val: $event.target.value
      });
    }
  }
};
</script>

<style lang="scss">
// .terms-list {
//   display: flex;
//   flex-direction: row;
//   justify-content: space-between;

//   & + & {
//     margin-top: 25px;
//   }

//   .col-a {
//     width: auto;
//     flex-grow: 1;
//   }

//   .col-b {
//     width: 75%;
//   }

//   .form-control {
//     background-color: #f5f5f5;
//     width: 100%;
//   }
// }
</style>
