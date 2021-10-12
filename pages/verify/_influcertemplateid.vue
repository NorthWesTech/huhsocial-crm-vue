<template>
  <div id="app" class="influencer-template-container" :class="{ 'complete-procedure': completeProcedure }">
    <!-- <v-sheet v-if="warningMessage">
      <v-alert type="warning">
        {{ warningMessage }}
      </v-alert>
    </v-sheet> -->
    <div v-if="warningMessage" class="error-container">
      <a href="https://iamlanistar.com" class="logo">
        <img src="/inf-admin/templateimages/logo.png" alt="Lanistar" width="150" />
      </a>
      <img src="/inf-admin/no-contract.svg" alt="no-contract" width="200" />
      <div class="message-content">
        <h1>Something's wrong here.</h1>
        <p>
          This contract is not reachable, which means you've clicked on a bad link or entered an invalid URL. Maybe you
          already signed the contract. Please contact us!
        </p>
      </div>
    </div>

    <v-form id="influencerForm" ref="influencerForm" class="influencer-template-form" @submit.prevent="handleSubmit">
      <div v-if="editorData && status_flag === 1">
        <div id="navbar" ref="navbar">
          <div class="navbar-container">
            <img
              class="lanistar-logo"
              src="https://assets.dev.lanistar.app/inf-admin/templateimages/logo-black.png"
              width="200"
            />
            <div class="navbar-message">
              Please
              {{
                !loading ? stickyHeaderMessage : "wait while we submit your application, this may take up to 10 seconds"
              }}
            </div>
            <v-btn
              class="btn-start"
              type="submit"
              :loading="loading"
              :style="!loading ? 'cursor: pointer' : 'cursor: progress'"
              large
              dark
            >
              {{ submitButtonText }}
            </v-btn>
          </div>
        </div>
        <div id="sticky_header" class="sticky_header" style="display: none !important">
          <div class="sticky_main_cont">
            <div class="sticky_cont">
              <table style="width: 100%">
                <tbody>
                  <tr>
                    <td style="width: 30%">
                      <img src="https://www.justgetvisible.com/static/templateimages/logo-black.png" />
                    </td>
                    <td style="width: 40%">
                      <h2>
                        Please
                        {{
                          !loading
                            ? stickyHeaderMessage
                            : "wait while we submit your application, this may take up to 10 seconds"
                        }}
                      </h2>
                    </td>
                    <td style="width: 30%; text-align: right">
                      <button
                        type="submit"
                        class="next_btn"
                        :disabled="loading"
                        :style="!loading ? 'cursor: pointer' : 'cursor: progress'"
                      >
                        {{ !loading ? submitButtonText : "SUBMITTING" }}
                        <i v-if="loading" class="fa fa-circle-o-notch fa-spin"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <v-col cols="12" md="12">
          <div id="editor" v-html="editorData"></div>
        </v-col>
        <v-col cols="12" md="12" v-if="hasSignOnBehalf">
          <v-checkbox
            class="m-0"
            v-model="confirmSignOnBehalf"
            dense
            label="I confirm that I am the Agent/ Manager of the Ambassador"
          ></v-checkbox>
        </v-col>
        <div id="signPadContainer" class="sign-pad-container">
          <v-row>
            <v-col cols="12" md="12" class="sign-pad-header">
              <div class="draw-your-signature-message">Draw your signature into the box below.</div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="12">
              <div class="sign-pad">
                <VueSignaturePad ref="signaturePad" width="150px" height="75px" />
              </div>
              <div class="sign-pad-btns">
                <button class="clear-sign-btn" @click.prevent="undoSignature">Clear Signature</button>
              </div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="12" class="sign-pad-footer">
              <div>I understand this is a legal representation of my signature</div>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-form>
    <contract-signed v-if="completeProcedure" :type="type" :template-type="templateType" />
  </div>
</template>
<script>
import Vue from "vue";
import Vuelidate from "vuelidate";

import VueSignaturePad from "vue-signature-pad";

import ContractSigned from "@/components/verify/contractSigned.vue";
import intlTelInput from "intl-tel-input";

Vue.use(VueSignaturePad);
Vue.use(Vuelidate);

Vue.use(Vuelidate);

export default {
  components: {
    ContractSigned
  },
  layout: "blank",
  props: {
    source: String
  },
  auth: false,
  data() {
    return {
      warningMessage: null,
      submitButtonText: "START",
      stickyHeaderMessage: "Enter Your Details Below",
      inf_template_id: null,
      stickyBarOffset: 300,
      mobileStickyBarOffset: 50,
      loading: false,
      // fullname: null,
      isEmptyPad: true,
      infTemplateId: null,
      type: null,
      status_flag: null,
      completeProcedure: false,
      editorData: null,
      templateType: null,
      signatureName: null,
      contractGroupID: null,
      hasSignOnBehalf: false,
      confirmSignOnBehalf: false
    };
  },
  async mounted() {
    const { influcertemplateid } = this.$route.params;
    if (!influcertemplateid) {
      this.warningMessage = "Invalid Link !";
      return;
    }

    this.inf_template_id = influcertemplateid;
    this.getInfById();
  },
  methods: {
    async getInfById() {
      const result = await this.$templatesService.getInfluencersTemplateById(this.inf_template_id);
      if (result && result.is_active) {
        this.editorData = result.influencer_template_content;
        this.infTemplateId = result.influencer_templates_id;
        this.type = result.template_type == 1 || result.template_type == 4 ? "Contract" : "NDA";
        this.status_flag = result.status_flag;
        this.templateType = result.template_type;
        this.version = result.version ? result.version : 0;

        if (this.templateType == 4) {
          this.signatureName = result.influencer_signature_name;
          this.contractGroupID = result.contract_group_id;
        }

        if (this.status_flag !== 1) {
          this.warningMessage = "Invalid Link !";
        }
        this.addSignatureMessage();
      } else {
        this.warningMessage = "Invalid Link !";
      }
    },
    async handleSubmit() {
      const self = this;

      const input = document.querySelectorAll("input, textarea");
      await input.forEach(function (item) {
        item.defaultValue = item.value;
        item.classList.remove("error");
        item.parentNode.classList.remove("has-error");
        if (item.parentNode.querySelector(".error-message")) {
          item.parentNode.querySelector(".error-message").remove();
        }
      });

      const validateInput = document.querySelectorAll("input,textarea");
      let firstRequired = true;
      await validateInput.forEach(function (item) {
        if (item.required && item.value.trim() == "") {
          item.classList.add("error");
          item.parentNode.classList.add("has-error");
          let errorMessage = `Please ${item.name === "referrerdate" ? "Referrer Date" : item.placeholder}`;
          const customErrorMessage = item.dataset.errorMessage;
          if (customErrorMessage) {
            errorMessage = customErrorMessage;
          }
          const el = document.createElement("span");
          el.classList.add("error-message");
          el.innerHTML = errorMessage;
          item.parentNode.insertBefore(el, item.nextSibling);

          if (firstRequired) {
            item.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest"
            });
            setTimeout(() => {
              item.focus();
            }, 1000);
            firstRequired = false;
            self.submitButtonText = "NEXT";
            if (item.dataset.errorMessage) {
              self.stickyHeaderMessage = item.dataset.errorMessage;
            } else if (item.placeholder) {
              self.stickyHeaderMessage = "Enter " + item.name === "referrerdate" ? "Referrer Date" : item.placeholder;
            }
          }
        } else {
          if (
            (item.dataset.inputName == "ambassadorContactEmail" ||
              item.dataset.inputName == "agencyContactEmail" ||
              item.dataset.inputName == "companyContactEmail") &&
            !item.disabled
          ) {
            const emailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;
            if (!item.value.match(emailValid)) {
              item.classList.add("error");
              item.parentNode.classList.add("has-error");
              const el = document.createElement("span");
              el.classList.add("error-message");
              el.innerHTML = "Please enter a valid email!";
              item.parentNode.insertBefore(el, item.nextSibling);

              if (firstRequired) {
                item.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "nearest"
                });
                setTimeout(() => {
                  item.focus();
                }, 1000);
                firstRequired = false;
                self.submitButtonText = "NEXT";
                self.stickyHeaderMessage = "enter a valid email!";
              }
            }
          }
          if (item.dataset.dateValid) {
            const dateValid = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i;
            if (!item.value.match(dateValid)) {
              item.classList.add("error");
              item.parentNode.classList.add("has-error");
              const el = document.createElement("span");
              el.classList.add("error-message");
              el.innerHTML = "Please enter a valid date!";
              item.parentNode.insertBefore(el, item.nextSibling);

              if (firstRequired) {
                item.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "nearest"
                });
                setTimeout(() => {
                  item.focus();
                }, 1000);
                firstRequired = false;
                self.submitButtonText = "NEXT";
                self.stickyHeaderMessage = "enter a valid date!";
              }
            }
          }
        }
      });

      if (!firstRequired) {
        return false;
      }

      const { isEmpty, data } = this.$refs.signaturePad.saveSignature();
      if (isEmpty) {
        self.submitButtonText = "FINISH";
        self.stickyHeaderMessage = "draw your signature into the box below";
        document.querySelector(".sign-pad").scrollIntoView({ behavior: "smooth" });
        return;
      }

      if (this.hasSignOnBehalf && !this.confirmSignOnBehalf) {
        self.stickyHeaderMessage = "select 'Signing on behalf of the influencer' to continue!";
        document.querySelector(".sign-pad").scrollIntoView({ behavior: "smooth" });
        return;
      }

      const inputForSign = document.querySelectorAll("input");

      if (self.templateType == 4) {
        const signBoxes = document.querySelectorAll(`[data-signature][data-signature-from="${self.signatureName}"]`);
        if (signBoxes) {
          signBoxes.forEach(signBox => {
            signBox.style.backgroundImage = `url('${data}')`;
            const signMessage = signBox.parentNode.querySelector("#signatureMessage");
            if (signMessage) signMessage.remove();
          });
        }
      } else {
        await inputForSign.forEach(function (item) {
          const signatureMessage = document.getElementById("signatureMessage");
          if (item.name == "lanistarName" && item.value.trim() != "") {
            // document.querySelector("#lanistarSignature").innerHTML = `<img src="${data}" >`;
            document.querySelector("#lanistarSignature").style.backgroundImage = `url('${data}')`;
            if (signatureMessage) signatureMessage.remove();
            return false;
          }
          if (item.name == "agencyName" && item.value.trim() != "") {
            document.querySelector("#agencySignature").style.backgroundImage = `url('${data}')`;
            if (signatureMessage) signatureMessage.remove();
            return false;
          }
          if (item.name == "ambassadorName" && item.value.trim() != "") {
            document.querySelector("#ambassadorSignature").style.backgroundImage = `url('${data}')`;
            if (signatureMessage) signatureMessage.remove();
            return false;
          }
        });
      }
      if (this.type === "NDA") {
        if (document.querySelector("#NDAContractSignature")) {
          document.querySelector("#NDAContractSignature").style.backgroundImage = `url('${data}')`;
        }
      }

      if (self.templateType != 4) {
        const inputs = document.querySelectorAll("input");
        await inputs.forEach(item => {
          if (item.type != "checkbox") {
            const el = document.createElement("span");
            el.innerHTML = item.value;
            item.parentNode.insertBefore(el, item.nextSibling);
            item.style.display = "none";
          } else {
            item.parentElement.style.display = "none";
          }
        });
      }

      const doc = new DOMParser().parseFromString(this.editorData, "text/html");
      const inputs = document.querySelectorAll("[data-input-name]");
      await inputs.forEach(input => {
        const el = doc.querySelector(`[data-input-name="${input.dataset.inputName}"]`);
        if (el) {
          if (self.templateType != 4) {
            if (el.dataset.inputTel) {
              const span = document.createElement("span");
              el.value = input.dataset.value;
              span.innerHTML = input.dataset.value;
              el.parentNode.insertBefore(span, el.nextSibling);
              el.parentNode.insertBefore(el, el.nextSibling);
              el.style.display = "none";
            } else {
              el.value = input.value;
              const span = document.createElement("span");
              span.innerHTML = el.value;
              el.parentNode.insertBefore(span, el.nextSibling);
              el.parentNode.insertBefore(el, el.nextSibling);
              el.style.display = "none";
            }
          } else {
            if (input.dataset.signatureFrom == self.signatureName) {
              if (el.dataset.inputTel) {
                const span = document.createElement("span");
                el.value = input.dataset.value;
                span.innerHTML = input.dataset.value;
                el.parentNode.insertBefore(span, el.nextSibling);
                el.parentNode.insertBefore(el, el.nextSibling);
                el.style.display = "none";
              } else {
                el.value = input.value;
                const span = document.createElement("span");
                span.innerHTML = el.value;
                el.parentNode.insertBefore(span, el.nextSibling);
                el.parentNode.insertBefore(el, el.nextSibling);
                el.style.display = "none";
              }
            }
          }
        }
      });
      const signatures = document.querySelectorAll("[data-signature]");
      signatures.forEach(e => {
        const signBox = doc.getElementById(e.id);
        signBox.style.backgroundImage = e.style.backgroundImage;
      });

      const dateBoxes = doc.querySelectorAll("[data-date]");
      if (dateBoxes) {
        dateBoxes.forEach(box => {
          box.replaceWith(this.$dayjs().format("DD-MM-YYYY"));
        });
      }
      const html = doc.head.innerHTML + doc.body.innerHTML;
      const dataD = `
        <html>
          <body>
            <style>
              input,textarea {
                background:transparent!important;
                border:0px;
                font-family: 'Poppins', sans-serif;
                font-size:16px;
                resize: none;
              }
            </style>
            ${html}
          </body>
        </html>
      `;

      const formData = {
        // status_flag: 2,
        influencer_signature: data,
        // influencer_signature_name: this.fullname,
        influencer_templates_id: this.infTemplateId,
        // influencer_updated_date: new Date(),
        influencer_template_content: dataD,
        contract_group_id: this.contractGroupID
      };

      this.loading = true;
      // this.errorSummary = null;
      // document.innerHTML = dataD;

      let result = {};
      if (this.templateType == 4) {
        const lastVersion = await this.$templatesService.contractVersion(this.contractGroupID);
        if (lastVersion == this.version) {
          result = await this.$templatesService.multipleInfluencerTemplates(formData);
        } else {
          alert("This contract has been signed from another recipient. You should re-sign after page reload.");
          this.getInfById();
          this.loading = false;
          return;
        }
      } else {
        result = await this.$templatesService.influencerTemplates(formData);
      }

      if (result && result.code === 6000) {
        this.completeProcedure = true;
        this.status_flag = 2;
      } else {
        this.warningMessage = "An error occurred while submitting the document please try again later!";
      }

      this.loading = false;
    },
    undoSignature() {
      this.$refs.signaturePad.undoSignature();
    },
    async changeTemplateStatus(status) {
      await this.$templatesService.changeInfluencerTemplateStatus(this.infTemplateId, status);
    },
    addSignatureMessage() {
      const self = this;
      this.$nextTick(() => {
        let signatureMessage = "Your Signature (bottom of Contract) will appear in this box.";
        if (this.templateType == 5) {
          this.changeTemplateStatus(3);
        }

        if (this.templateType == 4) {
          if (!this.signatureName) {
            const inputs = document.querySelectorAll("input, textarea");
            inputs.forEach(e => {
              e.placeholder = "";
              e.classList.add("disabled");
              e.disabled = true;
            });
            const navbar = document.getElementById("navbar");
            navbar.querySelector("button").remove();
            navbar.querySelector("div.navbar-message").remove();
            document.getElementById("signPadContainer").remove();
          }
          document.querySelectorAll("[data-signature]").forEach(e => {
            if (e.dataset.signatureFrom == this.signatureName) {
              const customMessage = e.dataset.customMessage;
              if (customMessage) {
                signatureMessage = customMessage;
              }
              const el = document.createElement("span");
              el.id = "signatureMessage";
              el.classList.add("signature-message");
              el.innerHTML = signatureMessage;
              e.parentNode.insertBefore(el, e.nextSibling);
            }
          });
          document.querySelectorAll("[data-signature-from]").forEach(e => {
            if (e.dataset.signatureFrom == this.signatureName) {
              e.disabled = false;
              e.required = true;
            } else {
              e.disabled = true;
              e.required = false;
            }
          });
          document.querySelectorAll("[data-person]").forEach(e => {
            // e.value = e.dataset.personName;
            // e.disabled = true;
            if (e.hasAttribute("data-person-name")) {
              e.value = e.dataset.signatureFrom;
              e.disabled = true;
            }
          });
        } else {
          const signatureBoxes = document.querySelectorAll("[data-signature]");
          if (signatureBoxes.length > 0) {
            signatureBoxes.forEach(box => {
              const customMessage = box.dataset.customMessage;
              if (customMessage) {
                signatureMessage = customMessage;
              }
              const el = document.createElement("span");
              el.id = "signatureMessage";
              el.classList.add("signature-message");
              el.innerHTML = signatureMessage;
              box.parentNode.insertBefore(el, box.nextSibling);
            });
          } else {
            const navbar = document.getElementById("navbar");
            navbar.querySelector("button").remove();
            navbar.querySelector("div.navbar-message").remove();
            document.getElementById("signPadContainer").remove();
          }
        }

        const dateBoxes = document.querySelectorAll("[data-date]");
        if (dateBoxes) {
          dateBoxes.forEach(box => {
            box.replaceWith(this.$dayjs().format("DD-MM-YYYY"));
          });
        }

        const telInputs = document.querySelectorAll("[data-input-tel]");
        telInputs.forEach(e => {
          if (!e.disabled) {
            const iti = intlTelInput(e, {});
            e.addEventListener("input", function () {
              this.dataset.value = "+" + iti.selectedCountryData.dialCode + " " + iti._getFullNumber();
            });
          }
        });

        const textAreas = document.querySelectorAll("textarea");
        textAreas.forEach(e => {
          e.addEventListener("input", () => {
            e.style.height = "auto";
            e.style.height = e.scrollHeight + 10 + "px";
          });
        });

        var requiredInputs = document.querySelectorAll("[required]");
        requiredInputs.forEach(el =>
          el.addEventListener("input", () => {
            if (el.value) {
              el.classList.remove("error");
              el.parentNode.classList.remove("has-error");
              if (el.parentNode.querySelector(".error-message")) {
                el.parentNode.querySelector(".error-message").remove();
              }
            }
          })
        );

        const signOnBehalfEl = document.querySelector(`[data-sign-on-behalf]`);
        if (signOnBehalfEl) {
          this.hasSignOnBehalf = signOnBehalfEl.dataset.signOnBehalf == this.signatureName;
        }
      });
    }
  }
};
</script>

<style lang="scss">
@import "node_modules/intl-tel-input/build/css/intlTelInput.css";
// node_modules/intl-tel-input/build/css/intlTelInput.css
.iti__flag {
  background-image: url("/inf-admin/flags.png");
}

@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .iti__flag {
    background-image: url("/inf-admin/flags@2x.png");
  }
}

.iti {
  width: 100%;
}

#navbar {
  background-color: #00b2e2;
  position: fixed;
  top: 0;
  width: 100%;
  display: block;
  z-index: 99;
  transition: top 0.3s;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0.5rem 0.75rem;
  height: 80px;
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14),
    0px 1px 10px 0px rgba(0, 0, 0, 0.12);
}

.navbar-container {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
}

.navbar-message {
  width: 100%;
  padding: 1rem;
  text-align: center;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  margin-top: -1px;
}

.lanistar-logo {
  width: 180px;
}

.sign-pad-container {
  padding: 10px;
  max-width: 400px;
  border: 1px solid #efeeee;
}
.sign-pad-btns {
  padding: 4px 14px;
  text-align: center;
}
.clear-sign-btn {
  box-shadow: inset 0px 39px 0px -24px #e67a73;
  background-color: #e4685d;
  border-radius: 4px;
  border: 1px solid #ffffff;
  display: inline-block;
  cursor: pointer;
  color: #ffffff;
  font-family: Arial;
  font-size: 12px;
  padding: 4px 24px;
  text-decoration: none;
  text-shadow: 0px 1px 0px #b23e35;
}
.clear-sign-btn:hover {
  background-color: #eb675e;
}
.clear-sign-btn:active {
  position: relative;
  top: 1px;
}
.sign-pad-header div,
.sign-pad-footer div {
  font-size: 14px;
  font-weight: bold;
  font-family: "Quicksand", sans-serif;
}
.sign-pad-header button {
  border: 1px solid #cccccc;
}
.sign-pad {
  border: 1px solid #cccccc;
  width: 150px;
  height: 75px;
  margin: 0px auto;
}

.btn-start {
  background-color: #ef6c00 !important;
  font-weight: 600;
}

.table-container .row-2,
.table-container .row-3 {
  height: 60px !important;
}

@media screen and (max-width: 768px) {
  .pdf-page {
    padding: 1rem !important;
  }

  .pdf-page h2 {
    font-size: 26px !important;
    line-height: 32px !important;
  }

  .star_img {
    max-width: 90px !important;
  }

  .navbar-message {
    position: absolute;
    top: 100%;
    left: 0;
    background: #a0a0a0;
  }

  .lanistar-logo {
    width: 150px;
  }

  .influencer-template-container {
    padding-top: 122px;
  }

  html {
    font-size: 12px !important;
  }

  .table-container {
    grid-template-areas:
      "header header header"
      "section-title section-title section-title"
      "table-title content content"
      "table-title content content" !important;
    grid-template-rows: 50px 50px 1fr !important;
  }

  .table-container.headless {
    grid-template-areas:
      "section-title section-title section-title"
      "table-title content content"
      "table-title content content" !important;
    grid-template-rows: 1fr !important;
  }

  .table-container .section-title {
    background-color: #d8dada !important;
    border-right: 0 !important;
    border-bottom: 1px solid #d4d4d4 !important;
    font-weight: 600 !important;
  }

  .table-container.no-content .table-title {
    grid-column: 1/-1;
    background-color: #fff !important;
  }

  .justify-md-start {
    justify-content: center !important;
  }
}

label.has-error {
  display: inline-block;
  margin-bottom: 15px;
  max-width: 100%;
}

label.has-error .error-message {
  position: absolute;
}

label.has-error input,
label.has-error textarea {
  border: 1px solid #f44336;
}

input:not([data-signature-name]):not([disabled]),
textarea:not([disabled]) {
  background: #fff9c4 !important;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  display: block;
}

.pdf-page {
  background: #fff;
  margin: 0.75rem 0;
  border-radius: 0.5rem;
  border: 1px solid #eae7e7;
  box-shadow: 0px 3px 3px #d8d6d6;
  min-height: 1024px;
}

.influencer-template-container {
  background: #efefef;
  padding: 10px;
  padding-top: 80px;
  min-height: 100vh;
}

.influencer-template-container.complete-procedure {
  padding: 0;
}

.influencer-template-form {
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.signature-message {
  font-size: 12px;
  font-style: italic;
  color: #666;
}

.error-container {
  display: flex;
  flex-direction: column;
  grid-gap: 2rem;
  align-items: center;
  margin-top: 100px;
}

.error-container .logo {
  position: fixed;
  top: 30px;
}

.error-container .message-content {
  color: #333;
  font-family: "Poppins";
  width: 90%;
  margin: 0 auto;
  padding: 0 22px;
}

@media print {
  body * {
    visibility: hidden;
  }
  #editor,
  #editor * {
    visibility: visible;
  }
  #editor {
    position: absolute;
    left: 0;
    top: 0;
  }

  .pdf-page {
    border: 0 !important;
    box-shadow: none;
  }
}

[data-signature] {
  height: 65px !important;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  margin-top: 5px;
}
</style>
