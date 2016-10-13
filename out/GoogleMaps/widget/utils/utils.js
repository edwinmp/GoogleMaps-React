define(["require", "exports"], function (require, exports) {
    "use strict";
    function toCamelCase(str) {
        str = str.replace(/\W+(.)/g, function (match, chr) {
            return chr.toUpperCase();
        });
        return str.replace(/(?:^|[-_])(\w)/g, function (_, c) {
            return c ? c.toUpperCase() : "";
        });
    }
    exports.toCamelCase = toCamelCase;
});
//# sourceMappingURL=utils.js.map