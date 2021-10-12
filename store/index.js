export const state = () => ({
  selectedSocialMediaCard: null,
  usersToBeAssigned: [],
  closersToBeAssigned: [],
  ownersToBeAssigned: [],
  users: []
});

export const mutations = {
  setSelectedSocialMediaCard(state, card) {
    state.selectedSocialMediaCard = card;
  },
  setUsersToBeAssigned(state, users) {
    state.usersToBeAssigned = users.map(user => {
      return {
        role: user.role,
        label: user.fullname,
        value: user.id
      };
    });
  },
  setClosersToBeAssigned(state, closers) {
    state.closersToBeAssigned = closers.map(closer => {
      return {
        role: closer.role,
        label: closer.fullname,
        value: closer.id
      };
    });
  },
  setOwnersToBeAssigned(state, owners) {
    state.ownersToBeAssigned = owners.map(owner => {
      return {
        role: owner.role,
        label: owner.fullname,
        value: owner.id
      };
    });
  },
  setUsers(state, data) {
    state.users = data;
  }
};

export const actions = {
  async nuxtClientInit(context) {
    // console.log(context);
    // const {dispatch} = context;
    // dispatch("getUsersToBeAssigned");
  },
  setUsersToBeAssigned(context, data) {
    context.commit("setUsersToBeAssigned", data);
  },
  setClosersToBeAssigned(context, data) {
    context.commit("setClosersToBeAssigned", data);
  },
  setOwnersToBeAssigned(context, data) {
    context.commit("setOwnersToBeAssigned", data);
  },
  setUsers(context, data) {
    context.commit("setUsers", data);
  },
  // async getUsersToBeAssigned(context) {
  //   // const users = await UserService.getUsersToBeAssigned();
  //   // context.commit('setUsersToBeAssigned', users);
  // },
  setSelectedSocialMediaCard(context, data) {
    context.commit("setSelectedSocialMediaCard", data);
  }
};
