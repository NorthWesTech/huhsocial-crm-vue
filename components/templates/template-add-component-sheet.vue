<template>
  <v-bottom-sheet v-model="sheetVisible" class="add-sheet">
    <v-sheet class="text-center" height="300px">
      <v-btn class="mt-6" text color="red" @click="closeSheet"> close </v-btn>
      <v-container>
        <v-row class="align-stretch">
          <v-col cols="2">
            <v-card
              outlined
              class="add-sheet-button"
              @click="
                addComponentHandler({
                  blockType: 'acceptors',
                  pageIndex: currentPageNo
                })
              "
            >
              <v-card-text>
                <v-icon left>mdi-account-group</v-icon>
                <br />
                Add Acceptors
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="2">
            <v-card
              outlined
              class="add-sheet-button"
              @click="
                addComponentHandler({
                  blockType: 'editor',
                  whereTo: 'after',
                  pageIndex: currentPageNo
                })
              "
            >
              <v-card-text>
                <v-icon left>mdi-format-color-text</v-icon>
                <br />
                Add Text
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="2">
            <v-card
              outlined
              class="add-sheet-button"
              @click="
                addComponentHandler({
                  blockType: 'title',
                  whereTo: 'after',
                  pageIndex: currentPageNo
                })
              "
            >
              <v-card-text>
                <v-icon left>mdi-format-header-pound</v-icon>
                <br />
                Add Title
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="2">
            <v-card
              outlined
              class="add-sheet-button"
              @click="
                addComponentHandler({
                  blockType: 'table',
                  whereTo: 'after',
                  pageIndex: currentPageNo
                })
              "
            >
              <v-card-text>
                <v-icon left>mdi-table</v-icon>
                <br />
                Add Table
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="2">
            <v-card
              outlined
              class="add-sheet-button"
              @click="
                addComponentHandler({
                  blockType: 'section-title',
                  whereTo: 'after',
                  pageIndex: currentPageNo
                })
              "
            >
              <v-card-text>
                <v-icon left>mdi-format-title</v-icon>
                <br />
                Add Section Title
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="2">
            <v-card
              outlined
              class="add-sheet-button"
              @click="
                addComponentHandler({
                  blockType: 'term-section',
                  whereTo: 'after',
                  pageIndex: currentPageNo
                })
              "
            >
              <v-card-text>
                <v-icon left>mdi-card-bulleted</v-icon>
                <br />
                Add Terms Section
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="2">
            <v-card
              outlined
              class="add-sheet-button"
              @click="
                addComponentHandler({
                  blockType: 'sign-pad',
                  whereTo: 'after',
                  pageIndex: currentPageNo
                })
              "
            >
              <v-card-text>
                <v-icon left>mdi-signature-freehand</v-icon>
                <br />
                Add Signature Pad
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="2">
            <v-card
              outlined
              class="add-sheet-button"
              @click="
                addComponentHandler({
                  blockType: 'recipients-overview',
                  whereTo: 'after',
                  pageIndex: currentPageNo
                })
              "
            >
              <v-card-text>
                <v-icon left>mdi-account-supervisor</v-icon>
                <br />
                Add Recipients Overview
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="2">
            <v-card
              outlined
              class="add-sheet-button"
              @click="
                addComponentHandler({
                  blockType: 'campaign-info',
                  whereTo: 'after',
                  pageIndex: currentPageNo
                })
              "
            >
              <v-card-text>
                <v-icon left>mdi-information-outline</v-icon>
                <br />
                Add Campaign Info
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="2">
            <v-card
              outlined
              class="add-sheet-button"
              @click="
                addComponentHandler({
                  blockType: 'divider',
                  whereTo: 'after',
                  pageIndex: currentPageNo
                })
              "
            >
              <v-card-text>
                <v-icon left>mdi-minus</v-icon>
                <br />
                Add Divider
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script>
export default {
  name: "TemplateAddComponentSheet",
  props: {
    addComponentHandler: {
      type: Function,
      required: true
    },
    currentPageNo: {
      type: Number,
      default: 0
    },
    visibilityIndicator: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      sheetVisible: false
    };
  },
  watch: {
    visibilityIndicator(newVal) {
      this.sheetVisible = newVal;
    },
    sheetVisible(newVal) {
      if (!newVal) {
        this.$emit("sheet-closed");
      }
    }
  },
  created() {},
  methods: {
    closeSheet() {
      this.sheetVisible = false;
      this.$emit("sheet-closed");
    }
  }
};
</script>
