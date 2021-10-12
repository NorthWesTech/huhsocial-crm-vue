class RouteHelper {
  static getHashParams(route) {
    let hashParams = {};
    let e,
      a = /\+/g,
      r = /([^&;=]+)=?([^&;]*)/g,
      d = function (s) {
        return decodeURIComponent(s.replace(a, " "));
      },
      q = route.hash.substring(1);

    while ((e = r.exec(q))) {
      hashParams[d(e[1])] = d(e[2]);
    }

    return hashParams;
  }
}

export default RouteHelper;
