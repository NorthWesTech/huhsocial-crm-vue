export default $axios => resource => ({
  list(query) {
    return $axios.$get(`${resource}`, {
      params: { ...query }
    });
  },
  listByInfluencerId(influencerId, query) {
    return $axios.$get(`${resource}/${influencerId}`, {
      params: { ...query }
    });
  },
  update(payload) {
    return $axios.$post(`${resource}/update`, payload);
  },
  delete(influencerId, year, week) {
    return $axios.$delete(`${resource}/${influencerId}/${year}/${week}`);
  },
  download(query) {
    return $axios.$get(`${resource}/download`, {
      params: { ...query }
    });
  }
});
