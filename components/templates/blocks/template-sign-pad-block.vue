<i18n>
{
  "en": {
    "forOrBehalftof": "For and on behalf of",
    "signature": "Signature",
    "name": "Name",
    "date": "Date",
    "signed": "SIGNED",
    "enterYourName": "Enter your name",
    "pleaseSelectARecipient": "Please select an recipient..."
  },
  "es": {
    "forOrBehalftof": "Por y en nombre de",
    "signature": "Firma",
    "name": "Nombre",
    "date": "Fecha",
    "signed": "FIRMADO"
  }
}
</i18n>

<template>
  <div>
    <div class="table-container-header">
      {{ $t("signed") }}
    </div>
    <div
      v-for="(recipient, rindex) in recipientData.filter(rd => rd.selectedRecipient.personToBeSigned)"
      :key="`recipient-${rindex}`"
      class="table-container"
    >
      <div class="section-title dark">
        {{ $t("forOrBehalftof") }}
        <v-select
          v-if="rindex > 0 && editMode"
          :value="recipient.selectedRecipient"
          :items="recipients.filter(f => !f.isCompany)"
          item-text="recipientType"
          item-value="recipientType"
          return-object
          single-line
          label="Recipient"
          @change="
            e =>
              updateRecipientData({
                index: rindex,
                propName: 'selectedRecipient',
                val: e.recipientType
              })
          "
        >
          <template #selection="{ item }">
            <!-- <span v-if="item.nickname">{{ item.nickname }}</span>
            <span v-else>{{ item.person }}</span> -->
            <span>{{ item.recipientType }}</span>
          </template>
        </v-select>
        <strong v-if="rindex === 0 || !editMode">{{ recipient.selectedRecipient.recipientType }}:</strong>
      </div>

      <div class="table-title">
        <div class="table-row row-1">{{ $t("signature") }}</div>
        <div class="table-row row-2 dark">{{ $t("name") }}</div>
        <div class="table-row row-3">{{ $t("date") }}</div>
      </div>

      <div class="content">
        <div class="table-row row-1">
          <div
            v-if="recipient.selectedRecipient && recipient.selectedRecipient.companyInfo"
            :style="{ backgroundImage: `url(${recipient.signature})` }"
            class="static-signature"
          ></div>
          <div
            v-else-if="recipient.signature && currentRecipientId !== recipient.selectedRecipient.id"
            :style="{ backgroundImage: `url(${recipient.signature})` }"
            class="static-signature"
          ></div>
          <div
            v-show="!editMode && recipient.selectedRecipient && !recipient.selectedRecipient.companyInfo"
            :data-person="recipient.selectedRecipient.id"
            class="align-end d-flex"
          >
            <vue-signature-pad
              v-if="currentRecipientId === recipient.selectedRecipient.id"
              ref="signaturePad"
              :class="{
                'has-error': $v.currentRecipientData.signature.$error,
                'current-recipient': currentRecipientId === recipient.selectedRecipient.id
              }"
              :options="{ onEnd: onSignEnd }"
              :data-recipient="recipient.selectedRecipient.id"
              width="150px"
              height="75px"
            />
            <v-btn
              v-if="currentRecipientId === recipient.selectedRecipient.id && currentRecipientData.signature"
              text
              x-small
              color="error"
              @click="clearSignature"
              >Clear Signature</v-btn
            >
          </div>
        </div>
        <div class="table-row row-2 dark">
          <label v-if="currentRecipientId === recipient.selectedRecipient.id"
            ><input
              :value="$v.currentRecipientData.recipientName.$model"
              :class="{
                'form-control': true,
                'has-error': $v.currentRecipientData.recipientName.$error,
                'current-recipient': true
              }"
              data-propname="recipientName"
              :data-recipient="recipient.selectedRecipient.id"
              :placeholder="$t('enterYourName')"
              required="required"
              :disabled="currentRecipientId !== recipient.selectedRecipient.id"
              type="text"
              @input="handleInputChange"
            />
          </label>
          <!-- <span
            v-if="
              currentRecipientId === recipient.selectedRecipient.id && !$v.currentRecipientData.recipientName.reqiured
            "
            class="input-error"
            >Please enter your name</span
          > -->
          <span v-if="rindex === 0">{{ recipient.recipientName }}</span>
          <span v-else-if="currentRecipientId !== recipient.selectedRecipient.id">{{ recipient.recipientName }}</span>
        </div>
        <div class="table-row row-3">
          <label>{{ $dayjs(recipient.signDate || currentDate).format("DD/MM/YYYY") }}</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { mapState, mapActions } from "vuex";
import Vuelidate, { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import VueSignaturePad from "vue-signature-pad";

import { EventBus } from "@/pages/event";

Vue.use(VueSignaturePad);
Vue.use(Vuelidate);

export default {
  name: "TemplateSignPadBlock",
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
        recipientName: null,
        signature: null
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
  async mounted() {
    this.$i18n.locale = this.language;
    this.currentRecipientId = this.$route.query.r;
    const currentRecipient = this.recipientData[this.currentRecipientIndex];
    if (!currentRecipient) return;

    // for getting rid of vuex props we're creating new variables with String()
    this.currentRecipientData = {
      recipientName: currentRecipient.recipientName ? String(currentRecipient.recipientName) : "",
      signature: null
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
        signature: {
          required
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
    onSignEnd() {
      process.nextTick(() => {
        const { isEmpty, data } = this.$refs.signaturePad[0].saveSignature();
        this.currentRecipientData.signature = data;
        this.$v.currentRecipientData.signature.$touch();
        if (!isEmpty) {
          this.updateRecipientData({
            index: this.currentRecipientIndex,
            propName: "signature",
            val: data
          });
        }
      });
    },
    clearSignature() {
      const currentSignPad = this.$refs.signaturePad.find(f => f.$attrs["data-recipient"] == this.currentRecipientId);
      if (currentSignPad) {
        this.currentRecipientData.signature = null;
        currentSignPad.clearSignature();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
// .static-signature {
//   background-repeat: no-repeat;
//   background-position: left center;
//   background-size: contain;
//   width: 100%;
//   height: 75px;
// }
</style>
