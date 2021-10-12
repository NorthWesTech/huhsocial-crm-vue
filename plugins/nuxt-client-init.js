import config from "@/config";

// async function fetchUsersToBeAssigned(context) {
//   const response = await context.$axios.get(`${config.msLandingUrl}/user/list?role=2`);
//   if (response && response.data) {
//     return response.data;
//   }
// }

// async function fetchClosersToBeAssigned(context) {
//   const response = await context.$axios.get(`${config.msLandingUrl}/user/list?role=3`);
//   if (response && response.data) {
//     return response.data;
//   }
// }

export default async context => {
  // const usersToBeAssigned = await fetchUsersToBeAssigned(context);
  // const closersToBeAssigned = await fetchClosersToBeAssigned(context);

  // await context.store.dispatch('nuxtClientInit', context)
};
