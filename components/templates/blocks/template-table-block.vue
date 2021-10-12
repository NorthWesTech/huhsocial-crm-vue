<template>
  <div :class="{ 'preview-mode': !editMode, 'edit-mode': editMode }">
    <v-toolbar v-if="editMode" dense elevation="1">
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" @click="addColumn">
            <v-icon>mdi-table-column-plus-after</v-icon>
          </v-btn>
        </template>
        <span>Add Column</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" @click="addRow">
            <v-icon>mdi-table-row-plus-after</v-icon>
          </v-btn>
        </template>
        <span>Add Row</span>
      </v-tooltip>
      <!-- <v-select v-model="tableClass" dense outlined :items="availableTableClasses" label="Table Style" /> -->

      <v-menu open-on-hover offset-y>
        <template #activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on">
            <v-icon left>mdi-menu-down</v-icon>
            {{ `Table Style: ${tableClass}` }}
          </v-btn>
        </template>
        <v-list :value="tableClass" @change="e => handleChange(rows, headers, e.target.value)">
          <v-list-item v-for="(item, index) in availableTableClasses" :key="`table-class-${index}`">
            <v-list-item-title>{{ item }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
    <table cellpadding="0" cellspacing="0" :class="[tableClass, 'editor-tables']">
      <thead>
        <tr>
          <th class="hidden-cell"></th>
          <th
            v-for="header in headers"
            :key="`th-${header.id}`"
            :style="{ width: header.width }"
            :contenteditable="editMode"
            @pointermove="handleResize"
            @input="handleHeaderChange"
            @paste.prevent="handlePaste"
          >
            {{ header.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="`row-${row.id}`">
          <td class="hidden-cell">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn icon small color="red lighten-3" v-bind="attrs" v-on="on" @click="() => removeRow(row)">
                  <v-icon small>mdi-table-row-remove</v-icon>
                </v-btn>
              </template>
              <span>Remove Row</span>
            </v-tooltip>
          </td>
          <td
            v-for="td in row.tds"
            :key="`td-${row.id}-${td.id}`"
            :contenteditable="editMode"
            @input="handleCellContentChange"
            @paste.prevent="handlePaste"
            v-html="!editMode ? replaceTemplateVariables(td.content) : td.content"
          ></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { nanoid } from "nanoid";
import config from "../../../config";
import globalMixins from "../../../mixins/globals";

export default {
  name: "TemplateTableBlock",
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
      tableClass: "data-table",
      rows: [],
      headers: [],
      availableTableClasses: config.templates.tableClasses
    };
  },
  computed: {
    tableData() {
      return this.$store.state["template-editor"].pages[this.pageIndex].blocks.find(b => b.id === this.blockId).content;
    }
  },
  mounted() {
    this.tableClass = this.content.tableClass;
    this.rows = this.content.rows.map(r => {
      return {
        id: r.id || nanoid(8),
        tds: r.tds.map(td => {
          return {
            id: td.id || nanoid(8),
            content: "" + td.content
          };
        })
      };
    });
    this.headers = this.content.headers.map(h => {
      return {
        id: h.id || nanoid(8),
        width: h.width || "auto",
        title: "" + h.title
      };
    });
  },
  methods: {
    addColumn(title, width) {
      // PS: this.headers/rows.push() causes vuex mutation exception
      this.headers = [
        ...this.tableData.headers,
        {
          id: nanoid(8),
          width: width || "auto",
          title: title || `Column ${this.headers.length + 1}`
        }
      ];
      this.rows = this.tableData.rows.map(row => {
        return {
          id: row.id,
          tds: [
            ...row.tds,
            {
              id: nanoid(8),
              content: `Content ${this.headers.length} here`
            }
          ]
        };
      });
      this.handleChange(this.rows, this.headers, this.tableData.tableClass);
    },
    addRow() {
      this.rows = [
        ...this.tableData.rows,
        {
          id: nanoid(8),
          tds: this.headers.map(() => {
            return {
              id: nanoid(8),
              content: ""
            };
          })
        }
      ];
      this.handleChange(this.rows, this.tableData.headers, this.tableData.tableClass);
    },
    removeRow(row) {
      this.rows = this.tableData.rows.filter(r => {
        return r.id !== row.id;
      });
      this.handleChange(this.rows, this.tableData.headers, this.tableData.tableClass);
    },
    handleResize(e) {
      e.preventDefault();
      const primaryButtonPressed = e.buttons === 1;
      const ths = this.$el.querySelectorAll("th");
      if (!primaryButtonPressed) {
        for (let i = 0; i < ths.length; i++) {
          const el = ths[i];
          el.removeEventListener("pointermove", this.handleResize);
        }
        return;
      }
      const nodes = Array.prototype.slice.call(ths);
      const index = nodes.indexOf(e.target) - 1; // because there's an extra cell on the left for removing row
      const headers = this.tableData.headers.map((h, hi) => {
        return {
          ...h,
          width: hi === index ? `${e.target.offsetWidth}px` : h.width
        };
      });
      this.handleChange(this.tableData.rows, headers, this.tableData.tableClass);
    },
    handleHeaderChange(e) {
      const ths = this.$el.querySelectorAll("th");
      const nodes = Array.prototype.slice.call(ths);
      const index = nodes.indexOf(e.target) - 1;
      const headers = this.tableData.headers.map((h, hi) => {
        return {
          ...h,
          title: hi === index ? e.target.innerText : h.title
        };
      });
      this.handleChange(this.tableData.rows, headers, this.tableData.tableClass);
    },
    handleCellContentChange(e) {
      // console.log(e)
      const rowElems = this.$el.querySelectorAll("tbody tr");
      const rowNodes = Array.prototype.slice.call(rowElems);
      const rowIndex = rowNodes.indexOf(e.target.parentNode);
      const tds = e.target.parentNode.querySelectorAll("td");
      const tdNodes = Array.prototype.slice.call(tds);
      const tdIndex = tdNodes.indexOf(e.target) - 1;
      const rows = this.tableData.rows.map((r, ri) => {
        return {
          ...r,
          tds: r.tds.map((td, tdi) => {
            return {
              ...td,
              content: rowIndex === ri && tdIndex === tdi ? e.target.innerText : td.content
            };
          })
        };
      });
      // this.rows[rowIndex].tds[tdIndex].content = e.target.innerText;
      this.handleChange(rows, this.tableData.headers, this.tableData.tableClass);
    },
    handleChange(rows, headers, tableClass) {
      this.$store.dispatch("template-editor/updateBlock", {
        pageIndex: this.pageIndex,
        block: {
          blockType: "table",
          id: this.blockId,
          content: {
            tableClass,
            rows,
            headers
          }
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
// .edit-mode {
//   margin-top: -30px;

//   .hidden-cell {
//     display: table-cell;
//     width: 50px;
//     background-color: #fff;
//     color: #999;
//     text-align: right;
//     resize: none;
//     padding-right: 5px;
//   }

//   .editor-tables {
//     margin-left: -50px;
//     width: calc(100% + 50px);
//   }
// }
// .preview-mode {
//   .hidden-cell {
//     display: none;
//   }
// }
</style>
