var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "GoogleMaps/lib/react"], function (require, exports, React) {
    "use strict";
    var Info = (function (_super) {
        __extends(Info, _super);
        function Info() {
            _super.apply(this, arguments);
        }
        Info.prototype.render = function () {
            return (React.createElement("div", null, this.props.children));
        };
        return Info;
    }(React.Component));
    exports.default = Info;
});
//# sourceMappingURL=Info.js.map