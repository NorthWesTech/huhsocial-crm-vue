<template>
  <div class="section-container" :class="{ 'edit-mode': editMode, 'preview-mode': !editMode }">
    <div
      class="section-subtitle"
      :contenteditable="editMode"
      @input="handleSubTitleChange"
      @paste.prevent="handlePaste"
      v-html="subTitle"
    ></div>
    <div class="section-content">
      <div class="section-content-editor-container">
        <div ref="contentEditor" class="section-content-editor" v-html="initialSectionContent"></div>
      </div>
      <div class="section-content-editor-preview">
        <div v-html="editMode ? sectionContent : replaceTemplateVariables(sectionContent, templateVariablesData)"></div>
      </div>
    </div>
  </div>
</template>

<script>
import Quill from "quill";

import globalMixins from "../../../mixins/globals";

// import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

const timeout = 2000;
let timer;

export default {
  name: "TemplateTermSectionBlock",
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
      type: Object,
      required: true
    },
    editMode: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      subTitle: null,
      sectionContent: null,
      initialSectionContent: null,
      editor: null
    };
  },
  computed: {
    sectionData() {
      return this.$store.state["template-editor"].pages[this.pageIndex].blocks.find(b => b.id === this.blockId).content;
    },
    templateVariablesData() {
      return this.$store.state["template-editor"].templateVariableData;
    }
  },
  created() {
    this.subTitle = this.content.subTitle;
    this.sectionContent = "" + this.content.sectionContent;
    this.initialSectionContent = "" + this.content.sectionContent;
  },
  mounted() {
    process.nextTick(() => {
      this.initEditor();
    });
  },
  methods: {
    initEditor() {
      const editorElem = this.$el.querySelector(".section-content-editor");
      try {
        this.editor = new Quill(editorElem, {
          // debug: "info",
          debug: "none",
          modules: {
            // simpleImageResize: true,
            toolbar: {
              container: [
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                // [{ header: [1, 2, 3, 4, 5, 6, false] }],
                [{ color: [] }, { background: [] }, { align: [] }],
                ["link"],
                ["clean", "code-block"]
              ]
            }
          },
          placeholder: "Please enter the content...",
          readOnly: false,
          theme: "bubble"
        });
        this.editor.on("text-change", () => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            this.sectionContent = editorElem.children[0].innerHTML;
            this.$store.dispatch("template-editor/updateBlock", {
              pageIndex: this.pageIndex,
              block: {
                blockType: "term-section",
                id: this.blockId,
                content: {
                  subTitle: this.subTitle,
                  sectionContent: editorElem.children[0].innerHTML
                }
              }
            });
          }, timeout);
        });
      } catch (error) {
        console.log(error);
      }
    },
    removeEditor() {
      if (!this.editor) {
        return;
      }
      this.editor.disable();
      const editorElem = this.$el.querySelector(".section-content-editor");
      const data = editorElem.children[0].innerHTML;
      editorElem.innerHTML = data;
      this.editor = null;
    },
    handleSubTitleChange(e) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.$store.dispatch("template-editor/updateBlock", {
          pageIndex: this.pageIndex,
          block: {
            blockType: "term-section",
            id: this.blockId,
            content: {
              subTitle: e.target.innerText,
              sectionContent: this.$refs.contentEditor.children[0].innerHTML
            }
          }
        });
      }, timeout);
    }
  }
};
</script>

<style lang="scss">
// .edit-mode {
//   .section-content-editor-preview {
//     display: none;
//   }
// }
// .preview-mode {
//   .section-content-editor-container {
//     display: none;
//   }
// }
</style>
