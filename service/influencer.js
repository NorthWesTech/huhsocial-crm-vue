export default $axios => resource => ({
  info(id) {
    return $axios.$get(`${resource}/info/${id}`);
  },
  list(payload) {
    return $axios.$post(`${resource}/list`, payload);
  },
  dashboard(payload) {
    return $axios.$post(`${resource}/dashboard`, payload);
  },
  dashboardCloser(payload) {
    return $axios.$post(`${resource}/dashboard-closer`, payload);
  },
  invite(payload) {
    return $axios.$post(`${resource}/invite`, payload);
  },
  create(payload) {
    return $axios.$post(`${resource}/create`, payload);
  },
  edit(payload) {
    return $axios.$post(`${resource}/edit`, payload);
  },
  addReferral(payload) {
    return $axios.$post(`${resource}/add-referral`, payload);
  },
  changeAssignedUser(payload) {
    return $axios.$post(`${resource}/changeAssignedUser`, payload);
  },
  changeContractStatus(payload) {
    return $axios.$post(`${resource}/changeContractStatus`, payload);
  },
  getFiles(id) {
    return $axios.$get(`${resource}/${id}/files`);
  },
  deleteFile(id) {
    return $axios.$delete(`${resource}/file/${id}`);
  },
  getFileById(id) {
    return $axios.$get(`${resource}/file/${id}`);
  },
  sendReferalLinksMail(id) {
    return $axios.$get(`${resource}/sendReferalLinksMail/${id}`);
  },
  sendPaymentLinkMail(id, paymentStatus) {
    return $axios.$get(`${resource}/sendPaymentLinkMail/${id}/${paymentStatus}`);
  },
  socialfollowers() {
    return $axios.$get(`${resource}/socialfollowers`);
  },
  getWaiting(payload) {
    return $axios.post(`${resource}/waiting`, payload);
  },
  getCountByStatus(payload) {
    return $axios.post(`${resource}/getCountByStatus`, payload);
  },
  signedContractCount(id) {
    return $axios.$get(`${resource}/signed-contract-count/${id}`);
  },
  changeCloser(payload) {
    return $axios.$post(`${resource}/changeCloser`, payload);
  },
  changeCloserStatus(payload) {
    return $axios.$post(`${resource}/changeCloserStatus`, payload);
  },
  changeOwner(payload) {
    return $axios.$post(`${resource}/changeOwner`, payload);
  },
  comments(id) {
    return $axios.$get(`${resource}/${id}/comments`);
  },
  saveComment(id, payload) {
    return $axios.$post(`${resource}/${id}/comments`, payload);
  },
  deleteComment(id) {
    return $axios.$delete(`${resource}/comments/${id}`);
  },
  getStatsByUser(userId, fromDate, toDate) {
    return $axios.$get(`${resource}/stats?assignedto=${userId}&fromDate=${fromDate}&toDate=${toDate}`);
  },
  findUser(username) {
    return $axios.$get(`${resource}/instagram/findUser?username=${username}`);
  },
  userFollowersCount(username) {
    return $axios.$get(`${resource}/instagram/userFollowersCount?username=${username}`);
  }
});
