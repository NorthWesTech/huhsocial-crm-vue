export default $axios => resource => ({
  alltemplates(params) {
    return $axios.$get(`${resource}/alltemplates`, { params });
  },
  getInfluencersTemplateById(id) {
    return $axios.$get(`${resource}/getInfluencersTemplateById/${id}`);
  },
  templatebyid(id) {
    return $axios.$get(`${resource}/templatebyid/${id}`);
  },
  getTemplatesByType(type) {
    return $axios.$get(`${resource}/getTemplatesByType/${type}`);
  },
  findInfluencerTemplates(params) {
    return $axios.$get(`${resource}/findInfluencerTemplates`, { params });
  },
  influencerTemplateStatusReviewMail(id) {
    return $axios.$get(`${resource}/influencerTemplateStatusReviewMail/${id}`);
  },
  influencerVoidContractReviewMail(id) {
    return $axios.$get(`${resource}/influencerVoidContractReviewMail/${id}`);
  },
  changeInfluencerTemplateStatus(id, status) {
    return $axios.$post(`${resource}/changeInfluencerTemplateStatus/${id}`, { status });
  },
  sendMultipleSignatureContract(contractGroupId) {
    return $axios.$get(`${resource}/sendMultipleSignatureContract/${contractGroupId}`);
  },
  sendTermSheetPdfToInfluencer(id) {
    return $axios.$get(`${resource}/sendTermSheetPdfToInfluencer/${id}`);
  },
  influencerstemplateByTypeAndId(type, id) {
    return $axios.$get(`${resource}/influencerstemplateByTypeAndId/${type}/${id}`);
  },
  deactivateInfluencerTemplate(id) {
    return $axios.$get(`${resource}/deactivateInfluencerTemplate/${id}`);
  },
  deleteInfluencerstemplate(id) {
    return $axios.$get(`${resource}/deleteInfluencerstemplate/${id}`);
  },
  createTemplate(payload) {
    return $axios.$post(`${resource}/createtemplate`, payload);
  },
  editTemplate(payload) {
    return $axios.$post(`${resource}/edittemplate`, payload);
  },
  saveInfluencerTemplate(payload) {
    return $axios.$post(`${resource}/saveInfluencerTemplate`, payload);
  },
  updateInfluencerTemplate(payload) {
    return $axios.$post(`${resource}/updateInfluencerTemplate`, payload);
  },
  influencerTemplates(payload) {
    return $axios.$post(`${resource}/influencer-templates`, payload);
  },
  multipleInfluencerTemplates(payload) {
    return $axios.$post(`${resource}/multiple-influencer-templates`, payload);
  },
  contractVersion(contractGroupId) {
    return $axios.$get(`${resource}/contractVersion/${contractGroupId}`);
  }
});
