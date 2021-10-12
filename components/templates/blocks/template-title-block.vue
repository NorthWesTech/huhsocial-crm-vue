<template>
  <div class="title-block">
    <h2 :contenteditable="editMode" @input="onInput" @paste.prevent="handlePaste">{{ title }}</h2>
    <img src="https://www.justgetvisible.com/static/templateimages/lanistar-star.png" />
  </div>
</template>

<script>
import globalMixins from "../../../mixins/globals";

export default {
  name: "TemplateTitleBlock",
  mixins: [globalMixins],
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
      type: String,
      default: "Title Here..."
    },
    editMode: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      title: "",
      initialTitle: ""
    };
  },
  mounted() {
    this.title = this.content;
  },
  methods: {
    onInput(e) {
      this.$store.dispatch("template-editor/updateBlock", {
        pageIndex: this.pageIndex,
        block: {
          blockType: "title",
          id: this.blockId,
          content: e.target.innerText || ""
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
// .title-block {
//   display: flex;
//   flex-direction: row;
//   justify-content: space-between;
//   align-items: center;
//   padding: 0;

//   h2 {
//     color: #00b2e2;
//     font-size: 40px;
//     font-weight: bold;
//     line-height: 1.2em;
//     margin-top: 0;
//     width: 70%;
//   }
//   img {
//     width: 30%;
//     height: auto;
//     max-width: 150px;
//   }
// }
</style>
