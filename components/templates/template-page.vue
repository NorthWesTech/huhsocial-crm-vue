<template>
  <div class="page elevation-8" :class="{ 'edit-mode': editMode }">
    <div v-html="pageHeader"></div>
    <!-- <template-page-header :content="`- ${pageIndex + 1} -`"></template-page-header> -->
    <main v-if="blocks" class="page-main">
      <div v-for="(block, bindex) in blocks" :key="`block-${block.id}`" class="block">
        <component
          :is="`template-${block.blockType}-block`"
          :block-id="block.id"
          :page-index="pageIndex"
          :content="block.content"
          :edit-mode="editMode"
        />
        <div v-if="editMode" class="block-actions">
          <div class="block-actions-inner">
            <v-btn
              v-if="bindex > 0"
              x-small
              :disabled="bindex === 0"
              elevation="0"
              icon
              class="rounded-0 float-right"
              @click="moveBlock({ pageIndex, block, dir: 'up' })"
            >
              <v-icon x-small>mdi-chevron-up</v-icon>
            </v-btn>
            <v-btn
              v-if="bindex < blocks.length - 1"
              x-small
              :disabled="bindex === blocks.length - 1"
              elevation="0"
              icon
              class="rounded-0 float-right"
              @click="moveBlock({ pageIndex, block, dir: 'down' })"
            >
              <v-icon x-small>mdi-chevron-down</v-icon>
            </v-btn>
            <v-menu offset-y>
              <template #activator="{ on, attrs }">
                <v-btn x-small elevation="0" icon v-bind="attrs" class="rounded-0 float-right" v-on="on">
                  <v-icon x-small>mdi-dots-horizontal</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="addBlock({ pageIndex, blockType: 'acceptors', whereTo: 'after', index: bindex })">
                  <v-icon left>mdi-account-group</v-icon>
                  <v-list-item-title>Add Acceptors Declaration After</v-list-item-title>
                </v-list-item>
                <v-list-item @click="addBlock({ pageIndex, blockType: 'editor', whereTo: 'after', index: bindex })">
                  <v-icon left>mdi-format-color-text</v-icon>
                  <v-list-item-title>Add Text After</v-list-item-title>
                </v-list-item>
                <v-list-item @click="addBlock({ pageIndex, blockType: 'title', whereTo: 'after', index: bindex })">
                  <v-icon left>mdi-format-header-pound</v-icon>
                  <v-list-item-title>Add Title After</v-list-item-title>
                </v-list-item>
                <v-list-item @click="addBlock({ pageIndex, blockType: 'table', whereTo: 'after', index: bindex })">
                  <v-icon left>mdi-table</v-icon>
                  <v-list-item-title>Add Table After</v-list-item-title>
                </v-list-item>
                <v-list-item @click="addBlock({ pageIndex, blockType: 'sign-pad', whereTo: 'after', index: bindex })">
                  <v-icon left>mdi-signature-freehand</v-icon>
                  <v-list-item-title>Add Signature Pads After</v-list-item-title>
                </v-list-item>
                <v-list-item
                  @click="addBlock({ pageIndex, blockType: 'section-title', whereTo: 'after', index: bindex })"
                >
                  <v-icon left>mdi-format-title</v-icon>
                  <v-list-item-title>Add Section Title After</v-list-item-title>
                </v-list-item>
                <v-list-item
                  @click="addBlock({ pageIndex, blockType: 'term-section', whereTo: 'after', index: bindex })"
                >
                  <v-icon left>mdi-card-bulleted</v-icon>
                  <v-list-item-title>Add Term Section After</v-list-item-title>
                </v-list-item>
                <v-list-item
                  @click="addBlock({ pageIndex, blockType: 'campaign-info', whereTo: 'after', index: bindex })"
                >
                  <v-icon left>mdi-information-outline</v-icon>
                  <v-list-item-title>Add Campaign Info</v-list-item-title>
                </v-list-item>
                <v-list-item @click="removeBlock({ pageIndex, block })">
                  <v-icon left color="red">mdi-trash-can-outline</v-icon>
                  <v-list-item-title>Remove Block</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>
      </div>
    </main>
    <div v-html="pageFooter"></div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

import TemplatePageHeader from "./template-page-header";
import TemplatePageFooter from "./template-page-footer";
import TemplateEditorBlock from "./blocks/template-editor-block";
import TemplateTitleBlock from "./blocks/template-title-block";
import TemplateTableBlock from "./blocks/template-table-block";
import TemplateSignPadBlock from "./blocks/template-sign-pad-block";
import TemplateCampaignInfoBlock from "./blocks/template-campaign-info-block";
import TemplateSectionTitleBlock from "./blocks/template-section-title-block";
import TemplateAcceptorsBlock from "./blocks/template-acceptors-block";
import TemplateTermSectionBlock from "./blocks/template-term-section-block";
import TemplateRecipientsOverviewBlock from "./blocks/template-recipients-overview-block.vue";
import TemplateDividerBlock from "./blocks/template-divider-block.vue";

export default {
  name: "TemplatePage",
  components: {
    TemplateEditorBlock,
    TemplateTitleBlock,
    TemplatePageHeader,
    TemplatePageFooter,
    TemplateTableBlock,
    TemplateSignPadBlock,
    TemplateCampaignInfoBlock,
    TemplateAcceptorsBlock,
    TemplateSectionTitleBlock,
    TemplateTermSectionBlock,
    TemplateRecipientsOverviewBlock,
    TemplateDividerBlock
  },
  props: {
    editMode: {
      type: Boolean,
      default: true
    },
    pageIndex: {
      type: Number,
      default: 0
    },
    pageHeader: {
      type: String,
      default: "<header></header>"
    },
    pageFooter: {
      type: String,
      default: "<footer></footer>"
    }
  },
  data() {
    return {
      pageBackgroundColor: "#fff",
      pagePadding: "0 0 0 0"
    };
  },
  computed: {
    blocks() {
      return this.$store.state["template-editor"].pages[this.pageIndex].blocks;
    },
    recipients() {
      return this.$store.state["template-editor"].recipients;
    },
    recipientData() {
      return this.$store.state["template-editor"].recipientData;
    },
    language() {
      return this.$store.state["template-editor"].language;
    }
  },
  mounted() {},
  methods: {
    ...mapActions({
      addBlock: "template-editor/addBlock",
      removeBlock: "template-editor/removeBlock",
      moveBlock: "template-editor/moveBlock"
    })
  }
};
</script>

<style lang="scss">
// .template-row {
//   display: flex;
//   margin: 0 -5px;
//   .template-col {
//     flex: 1;
//     padding: 5px;
//   }

//   @media (max-width: 400px) {
//     display: block;
//   }

//   &.template-row-thirds {
//     justify-content: space-between;

//     .template-col {
//       width: 32%;
//     }
//   }
// }

// .page-container {
//   width: 900px;
//   height: 1273px;
//   margin: 0 auto;

//   & + & {
//     margin-top: 1em;
//   }
// }
// .page {
//   overflow: hidden;
//   background-color: #fff;
//   width: 100%;
//   height: 100%;
//   box-shadow: #333;
//   display: flex;
//   justify-content: space-between;
//   flex-direction: column;
//   font-size: 16px;
//   line-height: 22px;

//   &.edit-mode {
//     padding-top: 0;
//     padding-bottom: 0;
//   }

//   input,
//   textarea {
//     padding: 0.2rem;
//     border: 0px;
//     font-family: "Poppins", sans-serif;
//     font-size: 0.9rem;
//     color: #333;
//     width: 100%;

//     // &:disabled {
//     //   background-color: #dbdadae1;
//     //   color: #666;
//     // }
//   }

//   .has-error {
//     border: 1px solid rgb(245, 5, 5) !important;
//     color: rgb(245, 5, 5);
//   }

//   .input-error {
//     color: rgb(245, 5, 5);
//     display: block;
//     font-size: 0.9em;
//   }

//   .current-recipient {
//     background-color: #fff9c4 !important;
//   }

//   .page-header {
//     padding: 20px 60px;
//   }

//   main.page-main {
//     flex-grow: 1;
//     display: flex;
//     flex-direction: column;
//     justify-content: flex-start;
//     padding: 0 60px;
//   }

//   .page-footer {
//     padding: 20px 60px;
//   }
// }

// .page-info {
//   margin: 0 auto;
//   display: flex;
//   flex-direction: row;
//   justify-content: center;
//   margin-bottom: -10px;

//   .page-info-inner {
//     width: 300px;
//     background-color: #efefef;
//     color: #333;
//     font-size: 12px;
//     border-radius: 10px;
//     padding: 5px 10px;
//     text-align: center;
//   }
// }

// .table-container-header {
//   background-color: #00b5e2;
//   color: #fff;
//   display: flex;
//   align-items: center;
//   padding: 0.5rem;
//   font-weight: 600;
//   margin-top: 20px;
//   border-top-left-radius: 4px;
//   border-top-right-radius: 4px;
// }

// .block {
//   position: relative;

//   & + & {
//     margin-top: 30px;
//   }

//   .block-actions {
//     display: block;
//     position: absolute;
//     z-index: 2;
//     top: 0;
//     right: -30px;
//     width: 20px;
//     background-color: #efefef;

//     .block-actions-inner {
//       width: 100%;
//       display: flex;
//       flex-direction: column;
//       justify-content: center;
//     }
//   }
// }
// .data-table {
//   width: 100%;
//   border-collapse: collapse;
//   border-spacing: 0px;

//   tr {
//     background-color: #fff;
//     &:nth-child(even) {
//       background-color: #f5f5f5;
//     }

//     th,
//     td {
//       padding-left: 10px;
//     }
//     th {
//       padding-top: 10px;
//       padding-bottom: 10px;
//       background: #00b2e2;
//       color: #fff;
//       text-align: left;
//       font-family: arial;
//       border-bottom: 0 none;
//       resize: horizontal;
//       overflow: auto;
//     }
//     td {
//       padding-top: 10px;
//       padding-bottom: 5px;
//       border: 0 none;
//     }
//   }
// }

// .section-container {
//   display: flex;
//   flex-direction: row;
//   justify-content: space-between;

//   & + & {
//     margin-top: 25px;
//   }

//   .section-subtitle {
//     width: auto;
//     flex-grow: 1;
//     font-weight: bold;
//     padding-right: 10px;
//   }

//   .section-content {
//     width: 70%;
//   }
// }

// .form-box-wrapper {
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//   grid-gap: 2rem;
// }

// .form-box-wrapper .form-box {
//   display: flex;
//   flex-direction: column;
// }

// .form-box-wrapper .form-box .header {
//   background-color: #00b5e2;
//   color: #fff;
//   display: flex;
//   align-items: center;
//   padding: 0.25rem;
//   border-top-right-radius: 4px;
//   border-top-left-radius: 4px;
// }

// .form-box-wrapper .form-box .content {
//   padding: 0.5rem 0;
// }

// .form-box-wrapper .form-box .content input {
//   width: 100%;
// }

// .g-sign {
//   background-image: url("https://assets.dev.lanistar.app/inf-admin/templateimages/company-signature.png");
//   background-size: contain;
//   background-position: center;
//   background-repeat: no-repeat;
//   width: 100%;
// }

// .table-container {
//   display: grid;
//   grid-template-columns: 1.5fr 1fr 3fr;
//   grid-template-areas:
//     "section-title table-title content"
//     "section-title table-title content"
//     "section-title table-title content";
// }

// .table-container .section-title {
//   grid-area: section-title;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   padding: 0.5rem;
//   background-color: #fff;
//   border-right: 1px solid #d4d4d4;
//   border-bottom: 1px solid #d4d4d4;
// }

// .table-container.dark .section-title,
// .table-container.dark .table-title,
// .table-container.dark .content {
//   background-color: #f5f5f5;
// }

// .table-container .section-title.dark {
//   background-color: #f5f5f5;
// }

// .table-container .table-title {
//   grid-area: table-title;
//   border-right: 1px solid #d4d4d4;
// }

// .table-container .content {
//   grid-area: content;
// }

// .table-container.no-content .section-title {
//   border: 0;
//   font-weight: 600;
// }

// .table-container.no-content .table-title {
//   border-right: 0;
//   grid-column: 2/-1;
//   padding: 0.5rem;
// }

// .table-container .table-row {
//   display: flex;
//   align-items: center;
//   padding: 0.5rem;
//   background-color: #fff;
//   border-bottom: 1px solid #d4d4d4;
// }

// .table-container .table-row.dark {
//   background-color: #f5f5f5;
// }

// .table-container .row-1 {
//   height: 85px;
// }

// .table-container .row-2 {
//   height: 35px;
// }

// .table-container .row-3 {
//   height: 35px;
// }

// .table-container input,
// .table-container label {
//   width: 100%;
// }
</style>
