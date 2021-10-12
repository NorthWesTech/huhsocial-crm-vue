<template>
    <v-container>
        <v-form ref="form" lazt-validation>
            <v-row>
                <v-col cols="12" md="6">
                    <v-text-field v-model="name" :rules="nameRules" label="Recipient Name" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model="email" :rules="emailRules" label="E-mail" required></v-text-field>
                </v-col>
            </v-row>
            <v-row justify="end">
                <v-col cols="12" md="2">
                    <v-btn small bottom @click="addRecipient()">
                        <v-icon left dark>mdi-account-plus</v-icon>
                        Add Recipient</v-btn>
                </v-col>
            </v-row>
        </v-form>
        <v-list v-if="recipients.length">
            <v-subheader>Recipients</v-subheader>
            <v-list-item v-for="(recipient,index) in recipients" :key="index">
                <v-list-item-avatar>
                    <v-icon class="grey lighten-1 white--text" v-text="'mdi-account'"></v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                    <v-list-item-title v-text="recipient.name" />
                    <v-list-item-subtitle v-text="recipient.email" />
                </v-list-item-content>

                <v-list-item-action>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn icon @click="removeItem(index)">
                                <v-icon color="grey lighten-1" v-bind="attrs" v-on="on">mdi-close-circle</v-icon>
                            </v-btn>
                        </template>
                        <span>Remove {{recipient.name}} from list</span>
                    </v-tooltip>
                </v-list-item-action>
            </v-list-item>
        </v-list>
    </v-container>
</template>
<script>
export default {
  name: "Recipients",
  data() {
    return {
      name: "",
      nameRules: [v => !!v || "Recipient Name is required"],
      email: "",
      emailRules: [
        v => !!v || "E-mail is required",
        v => /.+@.+/.test(v) || "E-mail must be valid"
      ],
      recipients: []
    };
  },
  methods: {
    addRecipient() {
      const isValid = this.$refs.form.validate();
      if (isValid) {
        this.recipients.push({
          name: this.name,
          email: this.email
        });
        this.$emit("input", this.recipients);
        this.$refs.form.reset();
      }
    },
    removeItem(index) {
      this.recipients.splice(index, 1);
      this.$emit("input", this.recipients);
    }
  }
};
</script>
