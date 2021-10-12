<i18n>
{
  "en": {
    "signature": "Signature",
    "name": "Name",
    "email": "Email",
    "tel": "Tel",
    "date": "Date",
    "overview": "OVERVIEW",
    "contactDetails": "contact details",
    "enterYourContactNumber": "Enter your contact number",
    "enterYourEmail": "Enter your email"
  },
  "es": {
    "signature": "Firma",
    "name": "Nombre",
    "email": "Email",
    "tel": "Teléfono",
    "date": "Fecha",
    "overview": "VISIÓN GENERAL"
  }
}
</i18n>
<template>
  <div>
    <div class="table-container-header">
      {{ $t("overview") }}
    </div>
    <div v-for="(overview, oindex) in recipientData" :key="`overview-${oindex}`" class="table-container">
      <div class="section-title dark">{{ overview.selectedRecipient.nickname }} {{ $t("contactDetails") }}</div>

      <div class="table-title">
        <div class="table-row row-1 dark">{{ $t("name") }}</div>
        <div class="table-row row-2">{{ $t("tel") }}</div>
        <div class="table-row row-3 dark">{{ $t("email") }}</div>
      </div>

      <div class="content">
        <div class="table-row row-1 dark">
          <span>{{ overview.recipientName }}</span>
        </div>

        <div class="table-row row-2">
          <vue-tel-input
            v-if="currentRecipientId === overview.selectedRecipient.id"
            v-model="currentRecipientData.phone"
            :valid-characters-only="true"
            :style-classes="{
              'has-error': !phoneNumberIsValid,
              'current-recipient': true
            }"
            :input-options="{
              styleClasses: {
                'form-control': true
              },
              placeholder: $t('enterYourContactNumber')
            }"
            :required="true"
            :preferred-countries="['gb', 'br', 'es', 'fr', 'de', 'it', 'pt', 'nl']"
            @input="onPhoneNumberInput"
          ></vue-tel-input>
          <span v-if="oindex === 0">{{ overview.phone }}</span>
          <span v-else-if="currentRecipientId !== overview.selectedRecipient.id">{{ overview.phone }}</span>
        </div>

        <div class="table-row row-3 dark">
          <label v-if="currentRecipientId === overview.selectedRecipient.id">
            <input
              :value="$v.currentRecipientData.email.$model"
              :class="{
                'form-control': true,
                'has-error': $v.currentRecipientData.email.$error,
                'current-recipient': true
              }"
              data-propname="email"
              :data-recipient="overview.selectedRecipient.id"
              :placeholder="$t('enterYourEmail')"
              required="required"
              :disabled="currentRecipientId !== overview.selectedRecipient.id"
              type="text"
              @input="handleInputChange"
            />
          </label>
          <span v-if="oindex === 0">{{ overview.email }}</span>
          <span v-else-if="currentRecipientId !== overview.selectedRecipient.id">{{ overview.email }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { mapState, mapActions } from "vuex";
import Vuelidate, { validationMixin } from "vuelidate";
import { email, required } from "vuelidate/lib/validators";
import VueTelInput from "vue-tel-input";
import "vue-tel-input/dist/vue-tel-input.css";

import { EventBus } from "@/pages/event";

Vue.use(VueTelInput);
Vue.use(Vuelidate);

export default {
  name: "TemplateRecipientsOverviewBlock",
  mixins: { validationMixin },
  props: {
    content: {
      type: Object,
      default: null
    },
    blockId: {
      type: String,
      required: true
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
        phone: null,
        email: null
      },
      phoneNumberIsValid: false,
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
    },
    phoneNumberIsValid: {
      handler(val) {
        this.setValidationStatus({ isValid: val, source: this.blockId });
      }
    }
  },
  async mounted() {
    this.$i18n.locale = this.language;
    this.currentRecipientId = this.$route.query.r;
    const currentRecipient = this.recipientData[this.currentRecipientIndex];
    if (!currentRecipient) return;

    // for getting rid of vuex props we're creating new variables with String()
    this.currentRecipientData = {
      phone: currentRecipient.phone ? String(currentRecipient.phone) : "",
      email: currentRecipient.email ? String(currentRecipient.email) : ""
    };
    this.registerValidation(this.blockId);
    EventBus.$on("sign-submit", () => {
      this.$v.$touch();
      this.setValidationStatus({ isValid: !this.$v.$invalid && this.phoneNumberIsValid, source: this.blockId });
    });
  },
  validations() {
    return {
      currentRecipientData: {
        // phone: {
        //   required
        // },
        email: {
          required,
          email
        }
      }
    };
  },
  methods: {
    ...mapActions({
      updateRecipientData: "template-editor/updateRecipientData",
      setValidationStatus: "template-editor/setValidationStatus",
      registerValidation: "template-editor/registerValidation"
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
    },
    onPhoneNumberInput(formattedNumber, { valid, number /*, country */ }) {
      this.phoneNumberIsValid = Boolean(valid);
      this.updateRecipientData({
        index: this.currentRecipientIndex,
        propName: "phone",
        val: number
      });
    }
  }
};
</script>

<style lang="scss">
.vue-tel-input {
  border: 0 none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  &:focus,
  &:focus-within {
    border-color: #1976d2 !important;
  }
}
.vti__dropdown {
  padding: 0;
}
</style>
