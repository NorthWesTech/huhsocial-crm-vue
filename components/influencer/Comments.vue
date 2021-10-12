<template>
  <v-card class="elevation-0 comments-card">
    <v-card-title>
      <h3>Notes</h3>
      <label class="ml-2">
        <span v-if="comments.length > 0" style="font-size:14px;color:#666;"
          >Showing
          <strong style="color: #1976d2;">{{ comments.length }}</strong>
          records</span
        >
      </label>
    </v-card-title>
    <v-card-text>
      <div ref="comments" class="comments">
        <div v-for="item in comments" :key="item.id" class="comments-item">
          <span class="comments-item--name">{{ item.user ? item.user.fullname : "Anonymous" }}</span>
          <span class="comments-item--comment">{{ item.comment }} </span>
          <span class="comments-item--date">{{ $dayjs(item.createdAt).format("DD/MM/YYYY HH:mm") }}</span>
          <div class="comments-item--actions">
            <button class="comments-item--btn" @click="onDeleteComment(item.id, $event)">
              <i class="mdi mdi-delete-circle-outline"></i>
            </button>
          </div>
        </div>
        <v-form id="commentForm" class="comments-item" @submit.prevent="onSaveComment">
          <div class="text-center pt-3">
            <!-- <i class="mdi mdi-comment"></i> -->
            <v-icon>mdi-comment-outline</v-icon>
          </div>
          <div class="pt-1">
            <v-text-field v-model="comment" outlined dense x-small placeholder="New Note" />
          </div>
          <!-- <input type="text" placeholder="Type your note" /> -->
          <div>
            <v-btn type="submit" :loading="loading" :disabled="loading" color="primary" class="ma-2 white--text">
              Send
              <v-icon rigt small dark class="ml-2">
                mdi-send
              </v-icon>
            </v-btn>
          </div>
        </v-form>
      </div>
    </v-card-text>
  </v-card>
  <!-- <v-card class="mt-3 elevation-2">
    <v-card-title>
      <h3>Comments</h3>
      <label class="ml-2">
        <span style="font-size:14px;color:#666;" v-if="comments.length > 0"
          >Showing
          <strong style="color: #1976d2;">{{ comments.length }}</strong>
          records</span
        >
      </label>
    </v-card-title>
    <v-card-text>
      <v-row class="mb-3">
        <v-col cols="12" md="8">
          <v-textarea
            outlined
            v-model="comment"
            label="Type your comment"
            rows="1"
            prepend-icon="mdi-comment"
          ></v-textarea>
        </v-col>
        <v-col cols="12" md="4">
          <v-btn
            :loading="loading"
            :disabled="loading"
            color="primary"
            large
            class="ma-2 white--text"
            @click="onSaveComment"
          >
            Sent
            <v-icon rigt small dark class="ml-2">
              mdi-send
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <div class="notes" v-if="comments.length">
        <div class="d-flex flex-column mb-5 align-items-start mb-3" v-for="item in comments">
          <div class="d-flex align-items-center">
            <div class="symbol symbol-circle symbol-40 mr-3">
              <user-avatar size="xs" :avatar="`${item.user ? item.user.fullname[0] : 'A'}`" />
            </div>
            <div class="note">
              <p>{{ item.comment }}</p>
              <a href="#" class="note-info--link">{{ item.user ? item.user.fullname : "Anonymous" }}</a>
              <div class="note-info">
                <span class="note-info--date">{{ $dayjs(item.createdAt).format("MM/DD/YYYY HH:mm") }}</span>
                <div class="note-info--remove p-1">
                  <v-btn x-small depressed dark color="red" @click="onDeleteComment(item.id, $event)">
                    Remove
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card> -->
</template>

<script>
import { mapState } from "vuex";

export default {
  components: {},
  props: {
    influencer: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      comments: [],
      loading: false,
      comment: "",
      attrs: {
        class: "mb-6 p-0",
        boilerplate: true,
        elevation: 0
      }
    };
  },
  computed: {
    ...mapState({
      userList: state => state.users
    })
  },
  async created() {
    this.loading = true;
    await this.getComments();
    this.loading = false;
  },
  updated() {
    this.$refs.comments.scrollTop = this.$refs.comments.scrollHeight;
  },
  methods: {
    async getComments() {
      const result = await this.$influencerService.comments(this.influencer);
      if (result) {
        this.comments = result.comments.map(item => {
          item.user = this.userList.find(i => i.id == item.createdBy);
          return item;
        });
        this.$emit("input", result.length);
      }
    },
    async onSaveComment() {
      this.loading = true;
      const data = {
        comment: this.comment
      };
      await this.$influencerService.saveComment(this.influencer, data);
      this.loading = false;
      this.comment = "";
      await this.getComments();
    },
    async onDeleteComment(id, event) {
      await this.$influencerService.deleteComment(id);
      await this.getComments();
    }
  }
};
</script>

<style lang="scss" scoped>
.comments-card {
  background: #e7e7e7;
}
.comments {
  height: 185px;
  overflow: hidden;
  overflow-y: auto;

  &-item {
    position: relative;
    display: grid;
    grid-template-columns: 0.3fr 2fr 0.7fr;
    grid-gap: 0.5rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #ccc;

    &:last-child {
      border-bottom: none;
      position: sticky;
      bottom: 0;
      background: #e7e7e7;
    }

    &--comment {
      color: #333 !important;
    }

    &--actions {
      position: absolute;
      top: calc(50% - 10px);
      right: 10px;
      height: 20px;
      border-radius: 50px;
    }

    &--btn {
      color: #999;
      width: 20px;
      height: 20px;
      border-radius: 50px;
      font-size: 20px;
    }
  }
}
</style>
