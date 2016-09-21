/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
declare var logger: mendix.logger;

interface IObject extends Object {
    [key: string]: any;
}
const REACT_STATICS: IObject = {
    childContextTypes: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    mixins: true,
    propTypes: true,
    type: true,
};

const KNOWN_STATICS: IObject = {
    arguments: true,
    arity: true,
    caller: true,
    length: true,
    name: true,
    prototype: true,
};

const isGetOwnPropertySymbolsAvailable = typeof Object.getOwnPropertySymbols === "function";

export default function hoistNonReactStatics(targetComponent: __React.Component<{}, {}>, sourceComponent: __React.Component<{}, {}>, customStatics?: IObject) {
    if (typeof sourceComponent !== "string") { // don't hoist over string (html) components
        let keys: Array<string> = Object.getOwnPropertyNames(sourceComponent);

        /* istanbul ignore else */
        if (isGetOwnPropertySymbolsAvailable) {
            keys = keys.concat(Object.getOwnPropertySymbols(sourceComponent));
        }

        for (let i = 0; i < keys.length; ++i) {
            if (!REACT_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]] && (!customStatics || !customStatics[keys[i]])) {
                try {
                    targetComponent[keys[i]] = sourceComponent[keys[i]];
                } catch (error) {
                    logger.debug("hoistNonReactStatics ", error);
                }
            }
        }
    }

    return targetComponent;
};
