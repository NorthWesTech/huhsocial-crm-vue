export default $axios => resource => ({
  list(params) {
    return $axios.$get(`${resource}/`, { params });
  },
  findById(id) {
    return $axios.$get(`${resource}/${id}`);
  },
  create(data) {
    return $axios.$post(`${resource}/`, data);
  },
  update(id, data) {
    return $axios.$patch(`${resource}/${id}`, data);
  },
  delete(id) {
    return $axios.$delete(`${resource}/${id}`);
  },
  restore(id) {
    return $axios.$post(`${resource}/restore/${id}`);
  },

  findDocumentById(documentId) {
    return $axios.$get(`${resource}/document/${documentId}`);
  },
  deleteDocumentById(documentId) {
    return $axios.$delete(`${resource}/document/${documentId}`);
  },
  stopProcess(documentId) {
    return $axios.$post(`${resource}/document/${documentId}/stop`);
  },
  sendToRecipients(documentId, postData) {
    return $axios.$post(`${resource}/document/${documentId}/send`, postData);
  },
  saveRecipientData(documentId, postData) {
    return $axios.$post(`${resource}/document/${documentId}/save-recipient-data`, postData);
  },
  saveDocument(documentId, postData) {
    return $axios.$post(`${resource}/document/${documentId}/save`, postData);
  },
  listByInfluencer(influencerId) {
    return $axios.$get(`${resource}/influencer/${influencerId}`);
  },
  saveForInfluencer(influencerId, templateId, postData) {
    return $axios.$post(`${resource}/influencer/${influencerId}/${templateId}`, postData);
  }
});
