declare var logger: mendix.logger;
declare var google: Object;
declare var mx: mx.mx;
// declare var window: IMapsWindow;
// import dependencies
import * as React from "GoogleMaps/lib/react";

import scriptLoader from "../../lib/react-async-script-loader/react-async-script-loader";

// import components
import Map from "./Map";

// interface IMapsWindow extends Window {
//     isScriptLoaded: boolean;
//     isScriptLoading: boolean;
// }
interface IGoogleApiProps {
    widget: mxui.widget._WidgetBase;
    isScriptLoading: boolean;
    isScriptLoaded: boolean;
    onScriptLoading?: Function;
    onScriptLoadingError?: Function;
}
class GoogleApi extends React.Component<IGoogleApiProps, {}> {
    public static defaultProps: IGoogleApiProps = {
        isScriptLoaded: false,
        isScriptLoading: true,
        widget: null,
    };
    private loggerNode: string;

    public constructor(props: IGoogleApiProps) {
        super(props);
        this.loggerNode = "GoogleApi";
        logger.debug(this.loggerNode + ".constructor");
    }
    public componentWillReceiveProps ({ isScriptLoading, isScriptLoaded, onScriptLoading, onScriptLoadingError }) {
            logger.debug(this.loggerNode + ".componentWillReceiveProps");
            if (isScriptLoading) {
                if (!isScriptLoaded) {
                    onScriptLoadingError();
                }
            } else {
                onScriptLoading();
            }
    }
    public render() {
        logger.debug(this.loggerNode + ".render");
        return (
            <div>
                {this.getContent()}
            </div>
        );
    }
    private getContent() {
        logger.debug(this.loggerNode + ".getContent");
        const mapProps = {
            centerAroundCurrentLocation: false,
        };
        if (this.props.isScriptLoaded) {
            return (
                <Map
                    {...mapProps}
                    google={google}
                />
            );
        } else {
            return (
                <div>
                    Loading ...
                </div>
            );
        }
    }
};

export default function GetMap(scripts: Array<string>) {
    return scriptLoader(
        scripts
    )(GoogleApi);
};
