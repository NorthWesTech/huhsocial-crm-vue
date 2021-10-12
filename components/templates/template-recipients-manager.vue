<template>
  <div>
    <v-card flat>
      <v-card-title> Recipients </v-card-title>
      <v-card-text v-if="mode == 'template'">
        <v-chip
          v-for="(recipient, index) in recipients"
          :key="index"
          class="mr-2 mb-2"
          label
          :close="!recipient.isCompany"
          @click:close="handleRemoveRecipient(recipient.id)"
        >
          {{ recipient.recipientType }}
        </v-chip>
      </v-card-text>
      <v-list v-if="mode == 'contract'" three-line>
        <v-list-item-group v-for="(recipient, rindex) in contractRecipients" :key="`recpt-${rindex}`">
          <v-list-item
            @click.prevent="
              () => {
                if (rindex > 0) editRecipient = recipient;
              }
            "
          >
            <v-list-item-content>
              <v-list-item-title v-text="recipient.person"></v-list-item-title>
              <v-list-item-subtitle class="text-caption" v-text="recipient.recipientType"></v-list-item-subtitle>
              <v-list-item-subtitle
                v-if="recipient.companyInfo"
                class="text--primary"
                v-html="recipient.companyInfo"
              ></v-list-item-subtitle>
              <v-list-item-subtitle>{{ recipient.email }} - {{ recipient.phone }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn v-if="rindex > 1" icon @click.prevent="removeRecipientId = recipient.id">
                <v-icon color="grey">mdi-account-minus</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider v-if="rindex < recipients.length - 1"></v-divider>
        </v-list-item-group>
      </v-list>
      <v-card-actions>
        <v-btn v-if="mode == 'contract'" text color="primary" @click="addRecipientModalVisible = true">
          Add Recipient
        </v-btn>
        <template v-if="mode == 'template'">
          <v-btn
            v-if="!recipients.some(i => i.recipientType == recipientTypes.Ambassador)"
            text
            color="primary"
            @click="addRecipient(recipientTypes.Ambassador)"
          >
            Add Ambassador
          </v-btn>
          <v-btn
            v-if="!recipients.some(i => i.recipientType == recipientTypes.Agency)"
            text
            color="primary"
            @click="addRecipient(recipientTypes.Agency)"
          >
            Add Agency
          </v-btn>
          <v-btn
            v-if="!recipients.some(i => i.recipientType == recipientTypes.Parent)"
            text
            color="primary"
            @click="addRecipient(recipientTypes.Parent)"
          >
            Add Parent
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="addRecipientModalVisible" width="600">
      <v-card>
        <v-card-title class="headline"> Add New Recipient </v-card-title>
        <v-card-text>
          <v-form ref="newRecipientForm" v-model="addRecipientFormValid">
            <v-text-field
              v-model="newRecipient.nickname"
              :rules="recipientFormRules.nickname"
              label="Recipient nickname"
              required
            ></v-text-field>
            <v-checkbox v-model="newRecipient.isCompany" label="Is this recipient is a company?" required></v-checkbox>
            <v-textarea
              v-if="newRecipient.isCompany"
              v-model="newRecipient.companyInfo"
              :rules="recipientFormRules.companyInfo"
              label="Company Info (Optional)"
              rows="3"
            ></v-textarea>
            <v-text-field
              v-model="newRecipient.person"
              :rules="recipientFormRules.person"
              label="Recipient person full name"
              required
            ></v-text-field>
            <v-text-field
              v-model="newRecipient.phone"
              :rules="recipientFormRules.phone"
              label="Recipient phone number"
              required
            ></v-text-field>
            <v-text-field
              v-model="newRecipient.email"
              :rules="recipientFormRules.email"
              label="Recipient email address"
              required
            ></v-text-field>
            <v-checkbox
              v-model="newRecipient.personToBeSigned"
              label="Person to be signed the contract?"
              required
            ></v-checkbox>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="addRecipientModalVisible = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!addRecipientFormValid" text @click="handleNewRecipientSubmit">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :value="!!editRecipient" width="600">
      <v-card v-if="editRecipient">
        <v-card-title class="headline"> Edit Recipient </v-card-title>
        <v-card-text>
          <v-form ref="editRecipientForm" v-model="editRecipientFormValid">
            <v-text-field
              :value="editRecipient.nickname"
              :rules="recipientFormRules.nickname"
              label="Recipient nickname"
              required
              @input="val => handleEditRecipientProp(val, 'nickname')"
            ></v-text-field>
            <v-checkbox
              :input-value="editRecipient.isCompany"
              label="Is this recipient is a company?"
              required
              @change="val => handleEditRecipientProp(val, 'isCompany')"
            ></v-checkbox>
            <v-textarea
              v-if="editRecipient.isCompany"
              :value="editRecipient.companyInfo"
              :rules="recipientFormRules.companyInfo"
              label="Company Info (Optional)"
              rows="3"
              @input="val => handleEditRecipientProp(val, 'companyInfo')"
            ></v-textarea>
            <v-text-field
              :value="editRecipient.person"
              :rules="recipientFormRules.person"
              label="Recipient person full name"
              required
              @input="val => handleEditRecipientProp(val, 'person')"
            ></v-text-field>
            <v-text-field
              :value="editRecipient.phone"
              :rules="recipientFormRules.phone"
              label="Recipient phone number"
              required
              @input="val => handleEditRecipientProp(val, 'phone')"
            ></v-text-field>
            <v-text-field
              :value="editRecipient.email"
              :rules="recipientFormRules.email"
              label="Recipient email address"
              required
              @input="val => handleEditRecipientProp(val, 'email')"
            ></v-text-field>
            <v-checkbox
              :input-value="editRecipient.personToBeSigned"
              label="Person to be signed the contract?"
              required
              @change="val => handleEditRecipientProp(val, 'personToBeSigned')"
            ></v-checkbox>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="editRecipient = null">Cancel</v-btn>
          <v-btn color="primary" :disabled="!editRecipientFormValid" text @click="handleEditRecipientSubmit"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :value="!!removeRecipientId" width="300" transition="dialog-bottom-transition">
      <v-card>
        <v-card-title> Remove Recipient </v-card-title>
        <v-card-text> Are you sure to remove this recipient? </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="removeRecipientId = null">Cancel</v-btn>
          <v-btn color="primary" text @click="() => handleRemoveRecipient(removeRecipientId)">Yes Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import config from "@/config";
import { mapState } from "vuex";

export default {
  name: "TemplateRecipientsManager",
  props: {
    mode: {
      type: String,
      default: "template"
    }
  },
  data() {
    return {
      addRecipientModalVisible: false,
      addRecipientFormValid: false,
      newRecipient: {
        person: null,
        isCompany: false,
        companyInfo: null,
        nickname: null,
        email: null,
        phone: null,
        personToBeSigned: true
      },
      editRecipientFormValid: false,
      editRecipient: null,
      recipientFormRules: {
        person: [v => !!v || "Please enter recipient person name!"],
        companyInfo: [],
        nickname: [v => !!v || "Please enter recipient nickname for identification!"],
        phone: [v => !!v || "Please enter recipient phone number!"],
        email: [v => !!v || "Please enter recipient email address!", v => /.+@.+/.test(v) || "E-mail should be valid!"]
      },
      removeRecipientId: null,
      recipientTypes: config.recipientTypes
    };
  },
  computed: {
    ...mapState({
      recipients: state => state["template-editor"].recipients
    }),
    contractRecipients() {
      return this.recipients;
      // return this.recipients.map(item => {
      //   if (item.isCompany) return item;
      //   if (item.recipientType == this.recipientTypes.Ambassador)
      //     return {
      //       person: this.influencer.firstName,
      //       nickname: "Lanistar",
      //       isCompany: true,
      //       companyInfo:
      //         "<strong>LANISTAR LIMITED</strong>, a company incorporated in England and Wales with company number 12091938 whose registered address is at 361 King Street, London, England, W6 9NA",
      //       email: "gurhan@lanistar.com",
      //       personToBeSigned: false,
      //       phone: "+44 7926476904",
      //       recipientType: config.recipientTypes.Lanistar
      //     };
      // });
    }
  },
  watch: {
    addRecipientModalVisible() {
      this.newRecipient = {
        person: null,
        isCompany: false,
        companyInfo: null,
        nickname: null,
        email: null,
        phone: null,
        personToBeSigned: true
      };
    }
  },
  methods: {
    addRecipient(type) {
      this.$emit("onAddRecipient", type);
    },
    handleNewRecipientSubmit() {
      this.$refs.newRecipientForm.validate();
      if (!this.addRecipientFormValid) {
        return;
      }
      this.$store.dispatch("template-editor/addRecipient", this.newRecipient);
      this.addRecipientModalVisible = false;
    },
    handleEditRecipientProp(val, propName) {
      const updated = {
        ...this.editRecipient,
        [propName]: val
      };
      // console.log(updated)
      this.$store.dispatch("template-editor/updateRecipient", updated);
      this.editRecipient = updated;
    },
    handleEditRecipientSubmit() {
      // this.$refs.editRecipientForm.validate();
      // if (!this.editRecipientFormValid) {
      //   return;
      // }
      // const index = this.recipients.findIndex(r => r.id === this.editRecipient.id);
      // this.$store.dispatch("template-editor/updateRecipientData", {
      //   index,
      //   propName: "person",
      //   val: this.editRecipient.person
      // });
      // this.$store.dispatch("template-editor/updateRecipientData", {
      //   index,
      //   propName: "isCompany",
      //   val: this.editRecipient.isCompany
      // });
      // this.$store.dispatch("template-editor/updateRecipientData", {
      //   index,
      //   propName: "companyInfo",
      //   val: this.editRecipient.companyInfo
      // });
      // this.$store.dispatch("template-editor/updateRecipientData", {
      //   index,
      //   propName: "nickname",
      //   val: this.editRecipient.nickname
      // });
      // this.$store.dispatch("template-editor/updateRecipientData", {
      //   index,
      //   propName: "email",
      //   val: this.editRecipient.email
      // });
      // this.$store.dispatch("template-editor/updateRecipientData", {
      //   index,
      //   propName: "phone",
      //   val: this.editRecipient.phone
      // });
      // this.$store.dispatch("template-editor/updateRecipientData", {
      //   index,
      //   propName: "personToBeSigned",
      //   val: this.editRecipient.personToBeSigned
      // });
      process.nextTick(() => {
        this.editRecipient = null;
      });
    },
    handleRemoveRecipient(id) {
      this.removeRecipientId = null;
      const recipient = this.recipients.find(r => r.id === id);
      this.$store.dispatch("template-editor/removeRecipient", recipient);
    },
    handleChange() {
      this.$emit("on-change", this.recipients);
    }
  }
};
</script>
