<template>
  <div :class="{ 'edit-mode': editMode, 'preview-mode': !editMode }">
    <div class="template-editor-container">
      <div class="editor-toolbar">
        <div class="ql-formats">
          <select class="ql-header">
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
            <option value="h4">H4</option>
            <option value="h5">H5</option>
            <option value="false">Paragraph</option>
          </select>
        </div>
        <div class="ql-formats">
          <button class="ql-bold"></button>
          <button class="ql-italic"></button>
          <button class="ql-underline"></button>
          <button class="ql-strike"></button>
          <button class="ql-color"></button>
          <button class="ql-background"></button>
          <select class="ql-align"></select>
        </div>
        <div class="ql-formats">
          <button class="ql-list" value="ordered"></button>
          <button class="ql-list" value="bullet"></button>
          <button class="ql-indent" value="-1"></button>
          <button class="ql-indent" value="+1"></button>
        </div>
        <div class="ql-formats">
          <button class="ql-image"></button>
          <v-btn icon small class="extra-buttons" @click="insertImage">
            <v-icon small>mdi-image</v-icon>
          </v-btn>
        </div>
        <div class="ql-formats">
          <button class="ql-clean"></button>
          <button class="ql-code-block"></button>
        </div>
      </div>
      <div class="template-editor" v-html="initialHtml"></div>
    </div>
    <div class="template-editor-preview" v-html="html"></div>
  </div>
</template>

<script>
import Quill from "quill";
import QuillBetterTable from "quill-better-table";

import "quill/dist/quill.snow.css";
// import "quill/dist/quill.bubble.css";
import "quill-better-table/dist/quill-better-table.css";

Quill.register({ "modules/better-table": QuillBetterTable }, true);

const timeout = 500;
let timer;

export default {
  name: "TemplateEditorBlock",
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
      default: null
    },
    editMode: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      initialHtml: null,
      html: null,
      editor: null
    };
  },
  async mounted() {
    this.html = this.content;
    this.initialHtml = this.content;
    process.nextTick(() => {
      this.initEditor();
    });
  },
  unmount() {
    if (this.editor) {
      this.editor.enable(false);
    }
  },
  methods: {
    initEditor() {
      const editorElem = this.$el.querySelector(".template-editor");
      try {
        this.editor = new Quill(editorElem, {
          // debug: "info",
          debug: "none",
          modules: {
            toolbar: this.$el.querySelector(".editor-toolbar"),
            // simpleImageResize: true,
            "better-table": {
              operationMenu: {
                items: {
                  unmergeCells: {
                    text: "Another unmerge cells name"
                  }
                }
              }
            },
            // toolbar: {
            //   container: [
            //     ["bold", "italic", "underline", "strike"],
            //     [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
            //     [{ header: [1, 2, 3, 4, 5, 6, false] }],
            //     [{ color: [] }, { background: [] }, { align: [] }],
            //     ["link", "image"],
            //     ["clean", "code-block"]
            //   ]
            //   // handlers: {
            //   //   simpleImage: imageHandler
            //   // }
            // },
            keyboard: {
              bindings: QuillBetterTable.keyboardBindings
            }
          },
          placeholder: "Please enter the content...",
          readOnly: false,
          theme: "snow"
        });
        this.editor.on("text-change", () => {
          // console.log(editorElem.children[0].innerHTML)
          // this.$emit("content-changed", editorElem.children[0].innerHTML);
          clearTimeout(timer);
          timer = setTimeout(() => {
            this.html = editorElem.children[0].innerHTML;
            this.$store.dispatch("template-editor/updateBlock", {
              pageIndex: this.pageIndex,
              block: {
                blockType: "editor",
                id: this.blockId,
                content: editorElem.children[0].innerHTML
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
      const editorElem = this.$el.querySelector(".template-editor");
      const data = editorElem.children[0].innerHTML;
      editorElem.innerHTML = data;
      this.editor = null;
    },
    insertTable() {
      const tableModule = this.editor.getModule("better-table");
      tableModule.insertTable(1, 3);
    },
    insertImage() {
      var range = this.editor.getSelection();
      var value = prompt("What is the image URL");
      if (value) {
        this.editor.insertEmbed(range.index, "image", value, Quill.sources.USER);
      }
    }
  }
};
</script>

<style lang="scss">
// .edit-mode {
//   .template-editor-preview {
//     display: none;
//   }
// }
// .preview-mode {
//   .template-editor-container {
//     display: none;
//   }
// }

// .ql-container {
//   &.ql-snow,
//   &.ql-bubble {
//     font-size: inherit;
//     line-height: inherit;
//     border: 0 none;
//   }
// }
// .ql-editor {
//   padding: 0;
//   font-size: inherit;
//   line-height: inherit;

//   .ql-bubble & {
//     padding: 0;
//   }

//   .ql-snow &,
//   .ql-bubble & {
//     font-size: inherit;
//     line-height: inherit;

//     h1 {
//       font-size: 2.6em;
//       line-height: normal;
//       margin-bottom: 0.4em;
//       margin-top: 0.6em;
//     }
//     h2 {
//       font-size: 2.2em;
//       line-height: normal;
//       margin-bottom: 0.3em;
//       margin-top: 0.5em;
//     }
//     h3 {
//       font-size: 1.17em;
//       line-height: normal;
//       margin-top: 10px;
//       margin-bottom: 10px;
//     }
//     h4 {
//       margin-top: 10px;
//       margin-bottom: 10px;
//       line-height: normal;
//     }
//     p {
//       font-size: 16px;
//       font-family: "Poppins", sans-serif;
//       margin-top: 0;
//       margin-bottom: 0.6em;
//     }
//     p + p {
//       margin-top: 0.6em;
//     }
//     ul,
//     ol {
//       margin-bottom: 0.6em;
//     }
//   }
// }

// .ql-bubble.ql-tooltip {
//   z-index: 99;
// }
// .ql-snow.ql-toolbar button.ql-simpleImage {
//   background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='none' d='M0 0h24v24H0z'/%3E%3Cpath d='M20 5H4v14l9.292-9.294a1 1 0 0 1 1.414 0L20 15.01V5zM2 3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H2.992A.993.993 0 0 1 2 20.007V3.993zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z'/%3E%3C/svg%3E");
//   background-size: 18px;
//   background-position: center center;
//   background-repeat: no-repeat;
// }
// .ql-snow.ql-toolbar button.ql-table {
//   background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='none' d='M0 0h24v24H0z'/%3E%3Cpath d='M13 10v4h6v-4h-6zm-2 0H5v4h6v-4zm2 9h6v-3h-6v3zm-2 0v-3H5v3h6zm2-14v3h6V5h-6zm-2 0H5v3h6V5zM4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z'/%3E%3C/svg%3E");
//   background-size: 18px;
//   background-position: center center;
//   background-repeat: no-repeat;
// }
// .extra-buttons {
//   margin-top: -3px;
// }
</style>
