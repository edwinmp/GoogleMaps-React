
declare var logger: mendix.logger;

import * as React from "GoogleMaps/lib/react";
import ReactDOM = require("GoogleMaps/lib/react-dom");

import * as dojoDeferred from "dojo/Deferred";

const mapStyles = {
  container: {
    height: "100%",
    position: "absolute",
    width: "100%",
  },
  map: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
};

interface IMapProps {
  google: IGoogleMaps;
  zoom: number;
  centerAroundCurrentLocation: boolean;
  center: Object;
  initialCenter: {
    lat: number;
    lng: number;
  };
  className: string;
  style: Object;
  containerStyle: Object;
  visible: boolean;
}

interface IMapState {
  currentLocation: {
        lat?: number;
        lng?: number;
      };
}

interface IGoogleMaps {
  maps: {
    Map: google.maps.Map;
    event: google.maps.event;
  };
}

const evtNames = ["ready", "click", "dragend", "recenter"];

// export {wrapper as GoogleApiWrapper} from './GoogleApiComponent';
// export {Marker} from './components/Marker'
// export {InfoWindow} from './components/InfoWindow'

export default class Map extends React.Component<IMapProps, IMapState> {
  /**
   * declare default props
   * 
   * @private
   * @static
   * @type {IMapProps}
   * @memberOf Map
   */
  private static defaultProps: IMapProps = {
    center: {},
    centerAroundCurrentLocation: false,
    className: "",
    containerStyle: {},
    google: null,
    initialCenter: {
      lat: 37.774929,
      lng: -122.419416,
    },
    style: {},
    visible: true,
    zoom: 14,
  };
  private listeners: google.maps.MapsEventListener[];
  private geoPromise: dojo.Deferred;

  constructor(props: IMapProps) {
    super(props);
    logger.debug("Map" + ".constructor");

    if (!props.hasOwnProperty("google") || props.google == null) {
      logger.debug("Map" + ".You must include a 'googpe' prop");
      throw new Error("You must include a `google` prop.");
    }

    this.listeners = [];
    this.state = {
      currentLocation: {
        lat: this.props.initialCenter.lat,
        lng: this.props.initialCenter.lng,
      },
    };
  }

  public componentDidMount() {
    if (this.props.centerAroundCurrentLocation) {
      if (navigator && navigator.geolocation) {
        this.geoPromise = new dojoDeferred((resolve: PositionCallback, reject: PositionErrorCallback) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        this.geoPromise.promise.then(pos => {
          const coords = pos.coords;
          this.setState({
            currentLocation: {
              lat: coords.latitude,
              lng: coords.longitude,
            },
          });
        }, error => error);
      }
    }
    this.loadMap();
  }

  public componentDidUpdate(prevProps: IMapProps, prevState: IMapState) {
    if (prevProps.google !== this.props.google) {
      this.loadMap();
    }
    if (this.props.visible !== prevProps.visible) {
      this.restyleMap();
    }
    if (this.props.center !== prevProps.center) {
      this.setState({
        currentLocation: this.props.center,
      });
    }
    if (prevState.currentLocation !== this.state.currentLocation) {
      this.recenterMap();
    }
  }

  public componentWillUnmount() {
    const {google} = this.props;
    if (this.geoPromise) {
      this.geoPromise.cancel("Component is unmounting!", false);
    }
    Object.keys(this.listeners).forEach(e => {
      google.maps.event.removeListener(this.listeners[e]);
    });
  }
  public render() {
    const style = Object.assign({}, mapStyles.map, this.props.style, {
      display: this.props.visible ? "inherit" : "none",
    });

    const containerStyles = Object.assign({},
      mapStyles.container, this.props.containerStyle);

    return (
      <div style={containerStyles} className={this.props.className}>
        <div style={style} ref="map">
          Loading map...
        </div>
        {this.renderChildren() }
      </div>
    );
  }
  private loadMap() {
    if (this.props && this.props.google) {
      const {google} = this.props;
      const maps = google.maps;

      const mapRef = this.refs.map;
      const node = ReactDOM.findDOMNode(mapRef);
      const curr = this.state.currentLocation;
      let center = new maps.LatLng(curr.lat, curr.lng);

      let mapConfig = Object.assign({}, {
        center,
        zoom: this.props.zoom,
      });

      this.map = new maps.Map(node, mapConfig);

      evtNames.forEach(e => {
        this.listeners[e] = this.map.addListener(e, this.handleEvent(e));
      });
      maps.event.trigger(this.map, "ready");
      this.forceUpdate();
    }
  }
  /**
   * Convert a string to camel case
   * 
   * @private
   * @param {string} str
   * @returns
   * 
   * @memberOf Map
   */
  private camelize(str: string) {
    str = str.replace(/\W+(.)/g, (match, chr) => {
            return chr.toUpperCase();
        });
    return str.replace (/(?:^|[-_])(\w)/g, (_, c) => {
        return c ? c.toUpperCase () : "";
      });
  }

  private handleEvent(evtName) {
    let timeout;
    const handlerName = `on${this.camelize(evtName)}`;

    return (e) => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      timeout = setTimeout(() => {
        if (this.props[handlerName]) {
          this.props[handlerName](this.props, this.map, e);
        }
      }, 0);
    };
  }

  private recenterMap() {
    const map = this.map;

    const {google} = this.props;
    const maps = google.maps;

    if (!google) { return; };

    if (map) {
      let center = this.state.currentLocation;
      if (!(center instanceof google.maps.LatLng)) {
        center = new google.maps.LatLng(center.lat, center.lng);
      }
      // map.panTo(center)
      map.setCenter(center);
      maps.event.trigger(map, "recenter");
    }
  }

  private restyleMap() {
    if (this.map) {
      const {google} = this.props;
      google.maps.event.trigger(this.map, "resize");
    }
  }

  private renderChildren() {
    const {children} = this.props;

    if (!children) { return; };

    return React.Children.map(children, c => {
      return React.cloneElement(c, {
        google: this.props.google,
        map: this.map,
        mapCenter: this.state.currentLocation,
      });
    });
  }
};
