export default $axios => resource => ({
  login(payload) {
    return $axios.$post(`${resource}/login`, payload);
  },
  logout(payload) {
    return $axios.$post(`${resource}/logout`, payload);
  },
  info(id) {
    return $axios.$get(`${resource}/info/${id}`);
  },
  crudUser(payload) {
    return $axios.$post(`${resource}/crudUser`, payload);
  },
  list(params) {
    return $axios.$get(`${resource}/list`, { params });
  },
  contractCounts(params) {
    return $axios.$get(`${resource}/contract-counts`, { params });
  },
  getAllUsersStats(fromDate, toDate) {
    return $axios.$get(`${resource}/stats/all?fromDate=${fromDate}&toDate=${toDate}`);
  },
  changeAvatar(userId, formData) {
    return $axios.$post(`${resource}/changeAvatar/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  }
});
