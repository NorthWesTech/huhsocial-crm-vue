<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="3">
        <v-card class="elevation-1">
          <div style="text-align:center" class="pt-3 mb-2">
            <v-avatar size="128" class="elevation-6">
              <img :src="avatarPreviewUrl" alt="user-avatar" v-if="userInfo.avatar" />
              <span class="headline" v-else>{{ userInfo.fullname[0] }}</span>
            </v-avatar>
          </div>

          <v-card-title>{{ userInfo.fullname }}</v-card-title>

          <v-card-text>
            <v-chip v-if="role" small text-color="white" :color="role.color">
              {{ role.label }}
            </v-chip>
            <div class="mt-2">{{ userInfo.email }}</div>
          </v-card-text>

          <v-divider class="mx-4"></v-divider>

          <v-list flat>
            <v-list-item-group v-model="selectedItem" color="primary">
              <v-list-item v-for="(item, i) in items" :key="i">
                <v-list-item-icon>
                  <v-icon v-text="item.icon"></v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-text="item.text"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="9">
        <v-card v-if="selectedItem == 0">
          <v-card-title>Personal Info</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  outlined
                  dense
                  v-model="$v.fullname.$model"
                  :error="$v.fullname.$error"
                  :error-messages="fullNameErrors"
                  label="Full Name (*)"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  outlined
                  dense
                  v-model="$v.email.$model"
                  :error="$v.email.$error"
                  :error-messages="emailErrors"
                  label="Email (*)"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <div class="d-flex justify-end">
              <v-btn color="primary" :loading="loading" align="right" @click="updateUser(false)">
                Save
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
        <v-card v-if="selectedItem == 1">
          <v-card-title>Change Password</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="$v.password.$model"
                  :error="$v.password.$error"
                  :error-messages="passwordErrors"
                  label="Enter New Password"
                  type="password"
                  dense
                  outlined
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="$v.repeatPassword.$model"
                  :error="$v.repeatPassword.$error"
                  :error-messages="repeatPasswordErrors"
                  label="Re-Enter New Password"
                  type="password"
                  dense
                  outlined
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <div class="d-flex justify-end">
              <v-btn color="primary" :loading="loading" align="right" @click="changePassword">
                Save
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
        <v-card v-if="selectedItem == 2">
          <v-card-title>Display Picture</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="12">
                <v-file-input
                  :rules="rules"
                  accept="image/png, image/jpeg, image/bmp"
                  placeholder="Pick an avatar"
                  prepend-icon="mdi-camera"
                  label="Avatar"
                  @change="onAvatarSelected"
                  outlined
                  dense
                ></v-file-input>
              </v-col>
              <v-col cols="12" md="6" v-if="avatar">
                <h4 class="mb-3">Preview</h4>
                <v-avatar size="128" class="elevation-4">
                  <img :src="avatarPath" alt="user-avatar" />
                </v-avatar>
              </v-col>
            </v-row>
            <div class="d-flex">
              <v-btn color="primary" :loading="loading" @click="saveAvatar">
                Save
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar color="success" bottom :timeout="5000" v-model="successMessage">
      User info has been updated successfully.
      <v-btn color="pink" text @click="successMessage = false">
        Close
      </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import Vue from "vue";
import UserAvatar from "@/components/influencer/UserAvatar.vue";
import config from "@/config";
import Vuelidate, { validationMixin } from "vuelidate";
import { email, required, sameAs, minLength } from "vuelidate/lib/validators";
Vue.use(Vuelidate);

const dataURItoBlob = dataURI => {
  const bytes =
    dataURI.split(",")[0].indexOf("base64") >= 0 ? atob(dataURI.split(",")[1]) : unescape(dataURI.split(",")[1]);
  const mime = dataURI
    .split(",")[0]
    .split(":")[1]
    .split(";")[0];
  const max = bytes.length;
  const ia = new Uint8Array(max);
  for (let i = 0; i < max; i += 1) ia[i] = bytes.charCodeAt(i);
  return new Blob([ia], { type: mime });
};

const resizeImage = ({ file, maxSize }) => {
  const reader = new FileReader();
  const image = new Image();
  const canvas = document.createElement("canvas");

  const resize = () => {
    let { width, height } = image;

    if (width > height) {
      if (width > maxSize) {
        height *= maxSize / width;
        width = maxSize;
      }
    } else if (height > maxSize) {
      width *= maxSize / height;
      height = maxSize;
    }

    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(image, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg");

    return dataURItoBlob(dataUrl);
  };

  return new Promise((ok, no) => {
    if (!file.type.match(/image.*/)) {
      no(new Error("Not an image"));
      return;
    }

    reader.onload = readerEvent => {
      image.onload = () => ok(resize());
      image.src = readerEvent.target.result;
    };

    reader.readAsDataURL(file);
  });
};
export default {
  mixins: { validationMixin },
  components: {
    UserAvatar
  },
  data() {
    return {
      selectedItem: 0,
      items: [
        { text: "Personal Info", icon: "mdi-account" },
        { text: "Change Password", icon: "mdi-key-variant" },
        { text: "Display Picture", icon: "mdi-camera-image" }
      ],
      password: "",
      repeatPassword: "",
      loading: false,
      successMessage: false,
      avatar: null,
      avatarPath: "",
      rules: [value => !value || value.size < 2000000 || "Avatar size should be less than 2 MB!"]
    };
  },
  validations: {
    fullname: {
      required
    },
    email: {
      required,
      email
    },
    password: {
      required,
      minLength: minLength(6)
    },
    repeatPassword: {
      sameAsPassword: sameAs("password")
    }
  },
  computed: {
    role() {
      return config.roles.find(role => role.value === this.userInfo.role);
    },
    fullNameErrors() {
      const errors = [];
      if (!this.$v.fullname.$dirty) return errors;
      !this.$v.fullname.required && errors.push("Full name is required");
      return errors;
    },
    emailErrors() {
      const errors = [];
      if (!this.$v.email.$dirty) return errors;
      !this.$v.email.required && errors.push("Email is required");
      !this.$v.email.email && errors.push("Email must be valid.");
      return errors;
    },
    passwordErrors() {
      const errors = [];
      if (!this.$v.password.$dirty) return errors;
      !this.$v.password.required && errors.push("Password is required");
      !this.$v.password.minLength && errors.push("Password must have at least 6 letters");
      return errors;
    },
    repeatPasswordErrors() {
      const errors = [];
      if (!this.$v.repeatPassword.$dirty) return errors;
      !this.$v.repeatPassword.sameAsPassword && errors.push("Passwords must be identical.");
      return errors;
    },
    avatarPreviewUrl() {
      return process.env.ASSETS_URL + this.userInfo.avatar;
    }
  },
  methods: {
    async getUser() {
      const res = await this.$userService.info(this.$auth.user.id);
      if (res) {
        this.userInfo = res;
        this.fullname = res.fullname;
        this.email = res.email;
      }
    },
    async updateUser(hasPassword) {
      this.loading = true;
      let data = {
        id: this.userInfo.id,
        email: this.email,
        fullname: this.fullname,
        flag: config.crudUserFlag.Update,
        user: this.$auth.user,
        role: this.userInfo.role,
        ip: sessionStorage.getItem("ip") ? sessionStorage.getItem("ip") : null
      };
      if (hasPassword) {
        data.password = this.password;
      }

      const res = await this.$userService.crudUser(data);
      if (res) {
        await this.getUser();
        this.loading = false;
        this.successMessage = true;
      }
    },
    async changePassword() {
      console.log("changePassword");
      await this.updateUser(true);
      this.selectedItem = 0;
      this.password = "";
      this.repeatPassword = "";
    },
    async saveAvatar() {
      this.loading = true;
      const formData = new FormData();
      formData.append("file", this.avatar);
      const res = await this.$userService.changeAvatar(this.userInfo.id, formData);
      if (res) {
        await this.getUser();
        this.loading = false;
        this.successMessage = true;
        this.selectedItem = 0;
        this.avatar = null;
      }
    },
    onAvatarSelected(file) {
      if (!file.type.match(/image.*/)) {
        no(new Error("Not an image"));
        return;
      }

      const reader = new FileReader();
      reader.onload = e => (this.originalImg = e.target.result);
      reader.readAsDataURL(file);
      resizeImage({ file: file, maxSize: 150 })
        .then(resizedImage => {
          this.avatar = resizedImage;
          this.avatarPath = URL.createObjectURL(resizedImage);
        })
        .catch(err => {
          console.error(err);
        });
    }
  },
  async asyncData({ $auth, $userService }) {
    const res = await $userService.info($auth.user.id);
    if (res) {
      return {
        userInfo: res,
        fullname: res.fullname,
        email: res.email
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.headline {
  font-size: 3rem !important;
  color: #666;
}
</style>
