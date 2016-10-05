var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "GoogleMaps/lib/react"], function (require, exports, React) {
    "use strict";
    var InfoWindow = (function (_super) {
        __extends(InfoWindow, _super);
        function InfoWindow() {
            _super.apply(this, arguments);
        }
        InfoWindow.prototype.componentDidMount = function () {
            this.renderInfoWindow();
        };
        InfoWindow.prototype.componentDidUpdate = function (prevProps) {
            var map = this.props.map;
            if (!google || !map) {
                return;
            }
            if (map !== prevProps.map) {
                this.renderInfoWindow();
            }
            if (this.props.children !== prevProps.children) {
                this.updateContent();
            }
            if ((this.props.visible !== prevProps.visible ||
                this.props.marker !== prevProps.marker)) {
                this.props.visible ?
                    this.openWindow() :
                    this.closeWindow();
            }
        };
        InfoWindow.prototype.render = function () {
            return null;
        };
        InfoWindow.prototype.renderInfoWindow = function () {
            if (!google || !google.maps) {
                return;
            }
            var iw = this.infoWindow = new google.maps.InfoWindow({
                content: "",
            });
            google.maps.event.addListener(iw, "closeclick", this.onClose.bind(this));
            google.maps.event.addListener(iw, "domready", this.onOpen.bind(this));
        };
        InfoWindow.prototype.onOpen = function () {
            if (this.props.onOpen) {
                this.props.onOpen();
            }
        };
        InfoWindow.prototype.onClose = function () {
            if (this.props.onClose) {
                this.props.onClose();
            }
        };
        InfoWindow.prototype.openWindow = function () {
            this.infoWindow.open(this.props.map, this.props.marker);
        };
        InfoWindow.prototype.updateContent = function () {
            var content = this.renderChildren();
            this.infoWindow.setContent(content);
        };
        InfoWindow.prototype.closeWindow = function () {
            this.infoWindow.close();
        };
        InfoWindow.prototype.renderChildren = function () {
            var children = this.props.children;
            return children.toString();
        };
        InfoWindow.defaultProps = {
            visible: false,
        };
        return InfoWindow;
    }(React.Component));
    exports.InfoWindow = InfoWindow;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = InfoWindow;
});
//# sourceMappingURL=InfoWindow.js.map