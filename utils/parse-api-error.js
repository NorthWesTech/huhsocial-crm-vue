export default error => {
  let returnMsg = error.toString();
  let e = error;
  // console.log(error)
  if (error?.data?.errors?.length > 0) {
    e = error.data.errors[0];
  } else if (error?.response?.data?.errors?.length > 0) {
    e = error.response.data.errors[0];
  }
  if (e.description) {
    return e.description;
  }
  switch (e.code) {
    case 10000:
    case 10001:
      returnMsg = "Your session data is invalid, please reload the page and try again";
      break;
    case 5000: // firstName
    case 5002: // lastName
    case 4000: // email is empty
    case 4001: // email is not valid
    case 3000: // phone is empty
    case 3001: // phone is not valid
      returnMsg = "Please fill all the required fields";
      break;
    case 4002: // email is already in use
      returnMsg = "Email address is already in use";
      break;
    case 3002: // email is already in use
      returnMsg = "Phone number is already in use";
      break;
    case 7008: // user instagram already exists
      returnMsg = "User instagram already exists";
      break;

    default:
      returnMsg = "An unknown error occurred please try again later";
      break;
  }
  return returnMsg;
};
