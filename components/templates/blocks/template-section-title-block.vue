<template>
  <div class="table-container-header" :contenteditable="editMode" @input="onInput" @paste.prevent="handlePaste">
    {{ title }}
  </div>
</template>

<script>
export default {
  name: "TemplateSectionTitle",
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
    return {};
  },
  computed: {
    title() {
      const titleVal = this.$store.state["template-editor"].pages[this.pageIndex].blocks.find(
        b => b.id === this.blockId
      ).content;
      return titleVal;
    }
  },
  mounted() {},
  methods: {
    handlePaste(e) {
      var text = (e.originalEvent || e).clipboardData.getData("text/plain");
      document.execCommand("insertHTML", false, text);
    },
    onInput(e) {
      this.$store.dispatch("template-editor/updateBlock", {
        pageIndex: this.pageIndex,
        block: {
          blockType: "section-title",
          id: this.blockId,
          content: e.target.innerText
        }
      });
    }
  }
};
</script>
