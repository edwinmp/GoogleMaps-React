define(["require", "exports"], function (require, exports) {
    "use strict";
    var REACT_STATICS = {
        childContextTypes: true,
        contextTypes: true,
        defaultProps: true,
        displayName: true,
        getDefaultProps: true,
        mixins: true,
        propTypes: true,
        type: true,
    };
    var KNOWN_STATICS = {
        arguments: true,
        arity: true,
        caller: true,
        length: true,
        name: true,
        prototype: true,
    };
    var isGetOwnPropertySymbolsAvailable = typeof Object.getOwnPropertySymbols === "function";
    function hoistNonReactStatics(targetComponent, sourceComponent, customStatics) {
        if (typeof sourceComponent !== "string") {
            var keys = Object.getOwnPropertyNames(sourceComponent);
            if (isGetOwnPropertySymbolsAvailable) {
                keys = keys.concat(Object.getOwnPropertySymbols(sourceComponent));
            }
            for (var i = 0; i < keys.length; ++i) {
                if (!REACT_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]] && (!customStatics || !customStatics[keys[i]])) {
                    try {
                        targetComponent[keys[i]] = sourceComponent[keys[i]];
                    }
                    catch (error) {
                        logger.debug("hoistNonReactStatics ", error);
                    }
                }
            }
        }
        return targetComponent;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = hoistNonReactStatics;
    ;
});
