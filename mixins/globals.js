import config from "../config";

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
    // var msg = successful ? "successful" : "unsuccessful";
    // console.log("Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }
  document.body.removeChild(textArea);
}

export default {
  data() {
    return {
      currentDate: this.getCurrentDate()
    };
  },
  methods: {
    handlePaste(e) {
      var text = (e.originalEvent || e).clipboardData.getData("text/plain");
      document.execCommand("insertHTML", false, text);
    },
    copyToClipboard(text) {
      if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
      }
      navigator.clipboard.writeText(text).then(
        function () {
          // console.log("Async: Copying to clipboard was successful!");
        },
        function (err) {
          console.error("Async: Could not copy text: ", err);
        }
      );
    },
    getCurrentDate() {
      const dt = new Date();
      return `${dt.getDate()}-${dt.getMonth() + 1}-${dt.getFullYear()}`;
    },
    formatDateTime(date) {
      let temp = new Date(date);
      return `${temp.getDate()}-${temp.getMonth() + 1}-${temp.getFullYear()} ${temp.getHours()}:${temp.getMinutes()}`;
    },
    replaceTemplateVariables(content, data) {
      return content.replace(/{{\s*([\S]+?)\s*}}/g, (full, property) => {
        if (property.indexOf("." > -1)) {
          const splitted = property.split(".");
          let innerData = data || this;
          for (let i = 0; i < splitted.length; i++) {
            const propName = splitted[i];
            innerData = innerData[propName];
          }
          return escape(innerData);
        }
        return escape((data || this)[property]);
      });

      function escape(str) {
        if (str == null) {
          return "";
        }

        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/>/g, "&gt;")
          .replace(/</g, "&lt;")
          .replace(/"/g, "&#34;")
          .replace(/'/g, "&#39;");
      }
    },
    printTypeName(templateType) {
      const ttype = config.templatesType.find(t => t.value === templateType);
      if (!ttype) {
        return "-";
      }
      return ttype.label;
    },
    printLanguage(lang) {
      const language = config.languages.find(l => l.value === lang);
      if (!language) {
        return "-";
      }
      return language.label;
    }
  }
};
