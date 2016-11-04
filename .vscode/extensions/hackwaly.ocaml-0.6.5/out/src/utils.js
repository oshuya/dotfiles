"use strict";
exports.log = (msg) => {
    if (process.env.DEBUG_VSCODE_OCAML) {
        console.log(msg);
    }
};
//# sourceMappingURL=utils.js.map