// declare var window: IMapsWindow;
// import dependencies
import * as React from "GoogleMaps/lib/react";

import scriptLoader from "../../lib/react-async-script-loader/react-async-script-loader";
import { IMapBehaviour } from "./wrapper";

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
    behaviour?: IMapBehaviour;
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
        this.loggerNode = this.props.widget.id + ".GoogleApi";
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
    public shouldComponentUpdate(nextProps: IGoogleApiProps, nextState: {}) {
        logger.debug(this.loggerNode + ".shouldComponentUpdate");
        return nextProps.isScriptLoaded !== this.props.isScriptLoaded;
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
        const behaviour = this.props.behaviour;
        const mapProps = {
            centerAroundCurrentLocation: false,
            widget: this.props.widget,
        };
        if (this.props.isScriptLoaded) {
            const initialCenter = new google.maps.LatLng(Number(behaviour.defaultLat), Number(behaviour.defaultLng));
            return (
                <Map
                    {...mapProps}
                    google={google}
                    initialCenter={initialCenter}
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
