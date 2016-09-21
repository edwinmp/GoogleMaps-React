declare var logger: mendix.logger;
declare var google: Object;
// import dependencies
import scriptLoader from "../../lib/react-async-script-loader/react-async-script-loader";
import * as React from "GoogleMaps/lib/react";

// import components
import Map from "./Map";

interface IWrapperProps {
    isScriptLoading: boolean;
    isScriptLoaded: boolean;
    onScriptLoading(): Function;
    onError(): Function;
}
interface IWrapperState {
}
class Wrapper extends React.Component<IWrapperProps, IWrapperState> {
    public constructor(props: IWrapperProps) {
        logger.debug("Wrapper" + ".constructor");
        super(props);
    }
    public componentWillReceiveProps ({ isScriptLoading, isScriptLoaded, onScriptLoading, onError }) {
        logger.debug("Wrapper" + ".componentWillReceiveProps");
        if (isScriptLoading) {
            if (isScriptLoaded) {
                logger.debug("Scripts Loaded... yay!!");
            } else { onError(); }
        } else {
            onScriptLoading();
        }
    }
    public render() {
        logger.debug("Wrapper" + ".render");
        return (
            <div>
                {this.getContent()}
            </div>
        );
    }
    private getContent() {
        logger.debug("Wrapper" + ".getContent");
        if (this.props.isScriptLoaded) {
            return (
                <div>
                    Component Mounted!
                    <Map
                        google={google}
                    />
                </div>
            );
        }
        return null;
    }
};

export default function GetWrapper(scripts: Array<string>) {
    return scriptLoader(
        scripts
    )(Wrapper);
};
