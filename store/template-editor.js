import { nanoid } from "nanoid";

import config from "../config";

const defaultVariableData = {
  currentDate: null,
  company: {
    name: "Lanistar Limited",
    person: "Gurhan Kiziloz",
    nickname: "Lanistar",
    address: {
      line1: "361 King Street",
      line2: null,
      city: "London",
      country: "England",
      postcode: "W6 9NA"
    }
  },
  influencer: {
    firstName: "John",
    lastName: "doe",
    fullName: "John Doe",
    email: "john.doe@lanistar.com",
    phone: "+00 7771111222",
    contractValue: 100000,
    contractShares: 100
  }
};

export const state = () => ({
  templateId: null,
  templateName: null,
  hasCoverPage: true,
  coverPageHtml: `
  <style>
    #cover-page {
      background-color: #000;
      background-size: cover;
      color: #fff;
      font-size: 16pt;
      padding: 2em;
    }

    #cover-page header {
    }

    #cover-page h1,
    #cover-page h2 {
      color: #fff;
      line-height: 1.2em;
    }

    #cover-page h1 {
      font-size: 2.6em;
    }

    #cover-page h2 {
      font-size: 2.2em;
      max-width: 40%;
    }
  </style>
  <header>
    <h2>COMPANY NAME EXAMPLE CONTRACT TITLE</h2>
  </header>
  `,
  pageHeaderHtml: null,
  pageFooterHtml: null,
  pages: [],
  recipients: [],
  recipientData: [],
  languages: config.languages,
  language: "en",
  templateType: 0,
  templateTypes: config.templatesType,
  templateVariablesData: { ...defaultVariableData },
  formValidations: []
});

export const getters = {
  pageSize: stt => pageIndex => {
    if (stt.pages[pageIndex].blocks.length === 0) {
      return 0;
    }
    return stt.pages[pageIndex].blocks.reduce((acc, curr) => acc + curr.blockSize, 0);
  },
  blockById: stt => (pageIndex, blockId) => {
    return stt.pages[pageIndex].blocks.find(b => b.id === blockId);
  },
  validForSubmission: stt => () => {
    if (stt.formValidations.length === 0) {
      return true;
    }
    return stt.formValidations.every(v => v.isValid);
  }
};

export const mutations = {
  clearState(stt) {
    stt.templateId = null;
    stt.templateName = null;
    stt.recipients = [];
    stt.recipientData = [];
    stt.pages = [];
    stt.language = "en";
    stt.templateType = null;
    stt.templateVariablesData = { ...defaultVariableData };
    stt.formValidations = [];
  },
  setDocumentOption(stt, { propName, val }) {
    switch (propName) {
      case "language":
        stt.language = val;
        break;
      case "templateType":
        stt.templateType = val;
        break;
      case "templateName":
        stt.templateName = val;
        break;
      case "templateId":
        stt.templateId = val;
        break;
      case "hasCoverPage":
        stt.hasCoverPage = val;
        break;
      case "coverPageHtml":
        stt.coverPageHtml = val;
        break;
      case "pageHeaderHtml":
        stt.pageHeaderHtml = val;
        break;
      case "pageFooterHtml":
        stt.pageFooterHtml = val;
        break;

      default:
        break;
    }
  },
  setTemplateVariables(stt, partial) {
    stt.templateVariablesData = {
      ...stt.templateVariablesData,
      ...partial
    };
  },

  addPage(stt, page) {
    stt.pages.push({
      ...page
    });
  },
  removePage(stt, page) {
    if (page.blocks.length > 0) {
      throw new Error("Page should not contain any block for deleting!");
    }
    stt.pages.splice(stt.pages.indexOf(page), 1);
  },

  addRecipient(stt, newRecipient) {
    stt.recipients.push({
      ...newRecipient
    });
  },
  updateRecipient(stt, updatedRecipient) {
    const ri = stt.recipients.findIndex(r => r.id === updatedRecipient.id);
    stt.recipients[ri] = { ...updatedRecipient };
  },
  removeRecipient(stt, recipient) {
    stt.recipients.splice(stt.recipients.indexOf(recipient), 1);
  },

  setRecipientData(stt, recipientData) {
    stt.recipientData = { ...recipientData };
  },
  initRecipientData(stt, initialRecipientData) {
    stt.recipientData = stt.recipients.map((r, i) => {
      const initDataIsExists = typeof initialRecipientData !== "undefined" && initialRecipientData[i];
      const rdata = {
        id: initDataIsExists ? initialRecipientData[i].id || nanoid(8) : nanoid(8),
        selectedRecipient: initDataIsExists ? initialRecipientData[i].selectedRecipient || r : r,
        recipientName: initDataIsExists ? initialRecipientData[i].recipientName : null,
        companyInfo: initDataIsExists ? initialRecipientData[i].companyInfo : null,
        phone: initDataIsExists ? initialRecipientData[i].phone : null,
        email: initDataIsExists ? initialRecipientData[i].email : null,
        signature: initDataIsExists ? initialRecipientData[i].signature : null,
        signDate: initDataIsExists ? initialRecipientData[i].signDate : null,
        addressLine1: initDataIsExists ? initialRecipientData[i].addressLine1 : null,
        addressLine2: initDataIsExists ? initialRecipientData[i].addressLine2 : null,
        addressCity: initDataIsExists ? initialRecipientData[i].addressCity : null,
        addressCountry: initDataIsExists ? initialRecipientData[i].addressCountry : null,
        addressPostcode: initDataIsExists ? initialRecipientData[i].addressPostcode : null
      };
      return {
        id: rdata.id,
        selectedRecipient: rdata.selectedRecipient,
        recipientName: i === 0 ? r.person : rdata.recipientName,
        companyInfo: i === 0 ? r.companyInfo : rdata.companyInfo,
        phone: i === 0 ? r.phone : rdata.phone,
        email: i === 0 ? r.email : rdata.email,
        signature:
          i === 0 ? "https://assets.dev.lanistar.app/inf-admin/templateimages/company-signature.png" : rdata.signature,
        signDate: rdata.signDate,
        addressLine1: rdata.addressLine1,
        addressLine2: rdata.addressLine2,
        addressCity: rdata.addressCity,
        addressCountry: rdata.addressCountry,
        addressPostcode: rdata.addressPostcode
      };
    });
  },
  addRecipientData(stt, newRecipientData) {
    stt.recipientData.push({
      ...newRecipientData
    });
  },
  updateRecipientData(stt, { index, propName, val }) {
    stt.recipientData[index][propName] = val;
  },
  removeRecipientData(stt, recipient) {
    const ri = stt.recipientData.findIndex(r => r.selectedRecipient?.id === recipient.id);
    stt.recipients.splice(ri, 1);
  },

  addBlock(stt, { pageIndex, blockType, whereTo, index }) {
    let initContent;
    let position = index || stt.pages[pageIndex].blocks.length - 1;
    let blockSize;
    if (index < 0 && index > stt.pages[pageIndex].blocks.length) {
      position = stt.pages[pageIndex].blocks.length - 1;
    }
    switch (blockType) {
      case "title":
        initContent = "Enter title here...";
        blockSize = 4;
        break;
      case "editor":
        initContent = null;
        blockSize = 2;
        break;
      case "table":
        initContent = {
          tableClass: "data-table",
          headers: [
            {
              id: nanoid(8),
              title: "Column 1"
            },
            {
              id: nanoid(8),
              title: "Column 2"
            }
          ],
          rows: [
            {
              tds: [
                {
                  id: nanoid(8),
                  content: "Content 1 Here"
                },
                {
                  id: nanoid(8),
                  content: "Content 2 Here"
                }
              ]
            }
          ]
        };
        blockSize = 5;
        break;
      case "sign-pad":
      case "recipients-overview":
        initContent = {}; // comes from recipientData
        blockSize = 3 * stt.recipients.length;
        break;
      case "acceptors":
        initContent = {}; // comes from recipientData
        blockSize = 15;
        break;
      case "campaign-info":
        initContent = {
          campaign: "",
          campaignStartDate: "",
          campaignEndDate: "",
          midCampaignDate: ""
        };
        blockSize = 6;
        break;
      case "section-title":
        initContent = "Section title here...";
        blockSize = 2;
        break;
      case "term-section":
        initContent = {
          subTitle: "Sub-title here...",
          sectionContent: ""
        };
        blockSize = 2;
        break;

      default:
        initContent = "Emter content here...";
        blockSize = 2;
        break;
    }

    let sortOrderNo = 0;
    let prev = stt.pages[pageIndex].blocks[whereTo === "after" ? position : position - 1];;
    if (prev) {
      sortOrderNo = prev.sortOrderNo;
    }

    const blockData = {
      id: nanoid(8),
      content: initContent,
      blockSize,
      blockType: blockType || "editor",
      sortOrderNo
    };

    if (whereTo === "after") {
      stt.pages[pageIndex].blocks.splice(position + 1, 0, blockData);
    } else {
      stt.pages[pageIndex].blocks.splice(position, 0, blockData);
    }
  },
  updateBlock(stt, { pageIndex, block }) {
    const blockIndex = stt.pages[pageIndex].blocks.findIndex(b => b.id === block.id);
    let blockSize = block.blockSize || 2;
    switch (block.blockType) {
      case "editor":
        blockSize = block.content.length > 90 ? Math.ceil(block.content.length * 0.01) : 2;
        break;
      case "table":
        blockSize = block.content.rows.length + 1;
        break;
      case "term-section":
        blockSize =
          block.content.sectionContent.length > 65 ? Math.ceil(block.content.sectionContent.length * 0.015) : 2;
        break;

      default:
        break;
    }
    stt.pages[pageIndex].blocks[blockIndex].content = block.content;
    stt.pages[pageIndex].blocks[blockIndex].blockSize = blockSize;
  },
  removeBlock: function (stt, { pageIndex, block }) {
    stt.pages[pageIndex].blocks.splice(stt.pages[pageIndex].blocks.indexOf(block), 1);
  },
  moveBlock: function (stt, { pageIndex, block, dir }) {
    const blockIndex = stt.pages[pageIndex].blocks.indexOf(block);
    const newIndex = dir === "down" ? blockIndex + 1 : blockIndex - 1;
    if (newIndex >= stt.pages[pageIndex].blocks.length) {
      var k = newIndex - stt.pages[pageIndex].blocks.length + 1;
      while (k--) {
        stt.pages[pageIndex].blocks.push(undefined);
      }
    }
    stt.pages[pageIndex].blocks.splice(newIndex, 0, stt.pages[pageIndex].blocks.splice(blockIndex, 1)[0]);
  },

  registerValidation: function (stt, source) {
    const targetIndex = stt.formValidations.findIndex(v => v.source === source)
    if (targetIndex < 0) {
      stt.formValidations.push({
        source,
        isValid: false
      });
    }
  },
  setValidationStatus: function (stt, { isValid, source }) {
    const targetIndex = stt.formValidations.findIndex(v => v.source === source)
    if (targetIndex < 0) {
      return;
    }
    stt.formValidations[targetIndex].isValid = isValid;
  }
};

export const actions = {
  clearState({ commit }) {
    commit("clearState");
  },

  setDocumentOption({ commit }, { propName, val }) {
    commit("setDocumentOption", { propName, val });
  },
  setTemplateVariables({ commit }, partialVariableData) {
    commit("setTemplateVariables", partialVariableData);
  },

  addRecipient({ commit }, newRecipient) {
    const nr = {
      ...newRecipient,
      person: newRecipient.person || null,
      isCompany: newRecipient.isCompany || false,
      companyInfo: newRecipient.companyInfo || null,
      nickname: newRecipient.nickname || null,
      email: newRecipient.email || null,
      phone: newRecipient.phone || null,
      personToBeSigned: newRecipient.personToBeSigned || true,
      id: newRecipient.id || nanoid(8)
    };

    commit("addRecipient", nr);
    commit("addRecipientData", {
      id: nanoid(8),
      selectedRecipient: nr,
      recipientName: null,
      phone: null,
      email: null,
      signature: null,
      signDate: null,
      addressLine1: null,
      addressLine2: null,
      addressCity: null,
      addressCountry: null,
      addressPostcode: null
    });
  },
  updateRecipient({ commit }, updatedRecipient) {
    commit("updateRecipient", updatedRecipient);
  },
  removeRecipient({ commit }, recipient) {
    commit("removeRecipient", recipient);
    commit("removeRecipientData", recipient);
  },
  setRecipientData({ commit }, recipientData) {
    commit("setRecipientData", recipientData);
  },
  updateRecipientData({ commit }, recipientData) {
    commit("updateRecipientData", recipientData);
  },
  initRecipientData({ commit }, initialRecipientData) {
    commit("initRecipientData", initialRecipientData);
  },

  addPage({ commit }, page) {
    commit("addPage", {
      id: page?.id || nanoid(8),
      blocks: page?.blocks || []
    });
  },
  removePage({ commit }, page) {
    commit("removePage", page);
  },

  addBlock({ commit }, blockProps) {
    commit("addBlock", blockProps);
  },
  updateBlock({ commit }, blockData) {
    commit("updateBlock", blockData);
  },
  removeBlock({ commit }, { pageIndex, block }) {
    commit("removeBlock", { pageIndex, block });
  },
  moveBlock({ commit }, { pageIndex, block, dir }) {
    commit("moveBlock", { pageIndex, block, dir });
  },
  async loadTemplateForInfluencer({ commit, dispatch }, { template, influencer, recipientData }) {
    dispatch("clearState");
    commit("setDocumentOption", { propName: "templateId", val: template.id });
    commit("setDocumentOption", { propName: "templateType", val: template.templateType });
    commit("setDocumentOption", { propName: "language", val: template.language });
    commit("setDocumentOption", { propName: "hasCoverPage", val: template.hasCoverPage });
    commit("setDocumentOption", { propName: "coverPageHtml", val: template.coverPageHtml });
    commit("setDocumentOption", { propName: "pageFooterHtml", val: template.pageFooterHtml });
    commit("setDocumentOption", { propName: "pageHeaderHtml", val: template.pageHeaderHtml });
    // console.log(influencer);
    commit("setTemplateVariables", {
      influencer: {
        firstName: influencer.firstName,
        lastName: influencer.lastName,
        fullName: `${influencer.firstName} ${influencer.lastName}`,
        email: influencer.email,
        phone: influencer.phoneNumber,
        contractValue: influencer.contractValue,
        contractShares: 100
      }
    });
    template.recipients.forEach(r => {
      const rdata = {
        ...r
      };
      if (r.recipientType === config.recipientTypes.Ambassador) {
        rdata.email = influencer.email;
        rdata.person = influencer.firstName + " " + influencer.lastName;
        rdata.phone = influencer.phoneNumber;
      }

      if (r.recipientType === config.recipientTypes.Agency && influencer.managerEmail) {
        rdata.email = influencer.managerEmail;
        rdata.person = influencer.managerName;
        rdata.phone = influencer.managerPhone;
      }
      dispatch("addRecipient", rdata);
    });
    template.pages.forEach(p => {
      dispatch("addPage", p);
    });
    dispatch("initRecipientData", recipientData);
  },
  registerValidation({ commit }, source) {
    commit("registerValidation", source);
  },
  setValidationStatus({ commit }, { isValid, source }) {
    commit("setValidationStatus", { isValid, source });
  }
};
