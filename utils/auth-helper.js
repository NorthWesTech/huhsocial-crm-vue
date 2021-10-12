class AuthHelper {
  static isReadonly(assignedto, user) {
    return assignedto !== user.id && user.role === 2;
  }
}

export default AuthHelper;