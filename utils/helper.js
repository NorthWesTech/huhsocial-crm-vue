class Helper {
    static createGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    static truncate(text, n) {
        return text !== null && text.length > n
          ? text.substr(0, n - 1) + "&hellip;"
          : text;
    }
}

export default Helper;