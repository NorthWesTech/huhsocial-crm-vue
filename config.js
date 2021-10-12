export default {
  msLandingUrl: process.env.API_URL,
  assetsUrl: `${process.env.ASSETS_URL}influencers`,
  xlsDateFormat: "DD/MM/YYYY HH:mm:ss",
  socialMediaAddressSeperator: ",",
  influencerTypes: [
    { label: "Influencer", value: 1 },
    { label: "Agency", value: 2 }
  ],
  roles: [
    { label: "Manager", value: 1, color: "red" },
    { label: "Opener", value: 2, color: "green" },
    { label: "Closer", value: 3, color: "blue" },
    { label: "Owner", value: 4, color: "#fca311" }
  ],
  contractStatuses: [
    { label: "Waiting to be contacted", value: 0, roles: [1, 2, 3, 4], color: "blue" },
    { label: "Contacted / Awaiting response", value: 9, roles: [1, 2, 3, 4], color: "#009688" },
    { label: "Contacted / Pitch booked", value: 7, roles: [1, 2, 3, 4], color: "brown" },
    { label: "Didn't attend pitch / To be re-booked", value: 2, roles: [1, 2, 3, 4], color: "red" },
    { label: "Non contactable / Disappeared", value: 3, roles: [1, 2, 3, 4], color: "grey" },
    { label: "Contract Signed", value: 4, roles: [1, 3], color: "green" },
    { label: "Contract Not Signed", value: 5, roles: [1, 3], color: "black" },
    { label: "Rejected", value: 6, roles: [1, 2, 3, 4], color: "orange" },
    { label: "Dead", value: 11, roles: [1, 2, 3, 4], color: "#555b6e" },
    { label: "Cancelled Contract", value: 12, roles: [1], color: "#9a031e" },
    { label: "New Lead", value: 10, roles: [1, 2], color: "#01579B" }
  ],
  closerStatuses: [
    { label: "Waiting to close", value: 0, role: 3 },
    { label: "More time needed", value: 1, role: 3 },
    { label: "Contract Amendments", value: 2, role: 3 },
    { label: "Non Contactable", value: 3, role: 3 },
    { label: "Contract Signed", value: 4, role: 3 },
    { label: "Rejected", value: 6, role: 3 },
    { label: "With Lawyer", value: 7, role: 3 },
    { label: "America", value: 8, role: 3 },
    { label: "N/A", value: 9, role: 3 },
    { label: "Signing Today", value: 10, role: 3 },
    { label: "Dead", value: 11, role: 1 },
    { label: "Cancelled Contract", value: 12, role: 1 }
  ],
  defaultSocialMedia: [
    { label: "Facebook", value: 1 },
    { label: "Instagram", value: 2 },
    { label: "Twitter", value: 3 },
    { label: "Youtube", value: 4 },
    { label: "Tiktok", value: 5 }
  ],
  companySignature: "https://assets.dev.lanistar.app/inf-admin/templateimages/company-signature.png",
  templatesType: [
    { label: "Contract", value: 1 },
    { label: "NDA", value: 2 },
    { label: "Term Sheet", value: 3 },
    { label: "Multiple Signed Contract", value: 4 },
    { label: "Void Contracts", value: 5 }
  ],
  assignedToCases: [{ label: "Not assigned yet", value: null }],
  assignFilterCases: [{ label: "All Openers", value: -1 }],
  closerFilterCases: [{ label: "All Closers", value: -1 }],
  ownerFilterCases: [{ label: "All Owners", value: -1 }],
  cardReceivedCases: [
    {
      value: 0,
      label: "No card received",
      color: "red"
    },
    {
      value: 1,
      label: "Chrome card",
      color: "black"
    },
    {
      value: 2,
      label: "Volt card",
      color: "black"
    },
    {
      value: 3,
      label: "Both cards",
      color: "green"
    }
  ],
  cardReceivedFilterCases: [{ label: "All (Card Received?)", value: -1, color: "black" }],
  reasonCases: [
    { label: "Select reason", value: null },
    { label: "Personal reason", value: 1 },
    { label: "MIA", value: 2 },
    { label: "Cancelled contract", value: 3 },
    { label: "Delayed", value: 4 },
    { label: "Other", value: 5 }
  ],
  socialMediaCases: [
    { label: "Select social media", value: null, icon: "" },
    { label: "Insta story", value: "IG_story", icon: "mdi mdi-instagram" },
    { label: "Insta feed", value: "IG_feed", icon: "mdi mdi-instagram" },
    { label: "Insta reels", value: "IG_reels", icon: "mdi mdi-instagram" },
    { label: "Twitter story", value: "TW_story", icon: "mdi mdi-twitter" },
    { label: "Twitter feed", value: "TW_feed", icon: "mdi mdi-twitter" },
    { label: "Facebook story", value: "FB_story", icon: "mdi mdi-facebook" },
    { label: "Facebook feed", value: "FB_feed", icon: "mdi mdi-facebook" },
    { label: "Youtube video", value: "YT_video", icon: "mdi mdi-youtube" },
    { label: "TikTok", value: "TT", icon: "icon-tiktok" },
    { label: "Snapchat", value: "SNAP", icon: "mdi mdi-snapchat" }
  ],
  contractValues: [
    { value: "18750", label: "£18,750", shares: "1500", color: "#FFB74D" },
    { value: "31250", label: "£31,250", shares: "2500", color: "#FF5722" },
    { value: "62500", label: "£62,500", shares: "5000", color: "green" },
    { value: "125000", label: "£125,000", shares: "10.000", color: "red" },
    { value: "250000", label: "£250,000", shares: "20.000", color: "blue" },
    { value: "", label: "Other", shares: "", color: "grey" }
  ],
  languages: [
    { label: "English", value: "en" },
    { label: "German", value: "de" },
    { label: "French", value: "fr" },
    { label: "Italian", value: "it" },
    { label: "Spanish", value: "es" },
    { label: "Portuguese", value: "pt" }
  ],
  days: [
    { value: -1, label: "None" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
    { value: 7, label: "Sunday" }
  ],
  formatter: new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    notation: "standard",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }),
  templates: {
    tableClasses: ["data-table"]
  },
  recipientTypes: {
    Lanistar: "Lanistar",
    Ambassador: "Ambassador",
    Agency: "Agency",
    Parent: "Parent",
    CC: "CC"
  },
  crudUserFlag: {
    Create: 1,
    Update: 2,
    Delete: 3
  }
};
