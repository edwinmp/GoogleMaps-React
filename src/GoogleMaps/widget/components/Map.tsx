
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

interface ILatLng {
    lat: number;
    lng: number;
  }
interface IMapProps extends React.Props<Map> {
  google: {};
  zoom?: number;
  centerAroundCurrentLocation?: boolean;
  center?: google.maps.LatLng;
  initialCenter?: google.maps.LatLng;
  className?: string;
  style?: Object;
  containerStyle?: Object;
  visible?: boolean;
  [key: string]: any;
}

interface IMapState {
  currentLocation: google.maps.LatLng;
}

interface IGoogle {
  maps: {
      event: google.maps.event;
      LatLng: google.maps.LatLng;
      Map: google.maps.Map;
    };
}

interface IMapArray extends Array<google.maps.MapsEventListener> {
  [key: string]: any;
};

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
  public static defaultProps: IMapProps = {
    centerAroundCurrentLocation: false,
    className: "",
    containerStyle: {},
    google: null,
    initialCenter: typeof google !== "undefined" ? new google.maps.LatLng(37.774929, -122.419416) : null,
    style: {},
    visible: true,
    zoom: 14,
  };
  private listeners: IMapArray; // used to manage the map event listeners
  private geoPromise: dojo.Deferred;
  private mapRef: HTMLElement;
  private map: google.maps.Map;
  private loggerNode: string;

  constructor(props: IMapProps) {
    super(props);
    this.loggerNode = "Map";
    logger.debug(this.loggerNode + ".constructor");

    if (!props.hasOwnProperty("google") || props.google === null) {
      logger.debug(this.loggerNode + ".You must include a 'google' prop & it must not be null");
    }

    this.listeners = [];
    this.state = {
      currentLocation: new google.maps.LatLng(props.initialCenter.lat(), props.initialCenter.lng()),
    };
  }
  public componentDidMount() {
    logger.debug(this.loggerNode + ".componentDidMount");
    // If user wants to see his location, fetch and set it as map's current location
    if (this.props.centerAroundCurrentLocation) {
      if (navigator && navigator.geolocation) {
        // TODO: Check if dojoDeferred works as an alternative to es6 Promise
        this.geoPromise = new dojoDeferred((resolve: PositionCallback, reject: PositionErrorCallback) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        this.geoPromise.promise.then(pos => {
          const coords = pos.coords;
          this.setState({
            currentLocation: new google.maps.LatLng(coords.latitude, coords.longitude),
          });
        }, error => error);
      }
    }
    this.loadMap();
  }

  public componentDidUpdate(prevProps: IMapProps, prevState: IMapState) {
    logger.debug(this.loggerNode + ".componentDidUpdate");
    if (prevProps.google !== this.props.google) {
      this.loadMap();
    }
    if (this.props.visible !== prevProps.visible) {
      this.restyleMap();
    }
    // if the location coordinates have changed, update state
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
    logger.debug(this.loggerNode + ".componentWillUnmount");
    if (this.geoPromise) {
      this.geoPromise.cancel("Component is unmounting!", false);
    }
    Object.keys(this.listeners).forEach((e: string) => {
      google.maps.event.removeListener(this.listeners[e]);
    });
  }
  public render() {
    logger.debug(this.loggerNode + ".render");
    const style = Object.assign({}, mapStyles.map, this.props.style, {
      display: this.props.visible ? "inherit" : "none",
    });

    const containerStyles = Object.assign({}, mapStyles.container, this.props.containerStyle);

    return (
      <div style={containerStyles} className={this.props.className}>
        <div style={style} ref={ (c) => this.mapRef = c }>
          Loading map...
        </div>
        {this.renderChildren()}
      </div>
    );
  }
  private loadMap() {
    logger.debug(this.loggerNode + ".loadMap");
    if (this.props && this.props.google) {
      const maps = google.maps;

      const mapRef = this.mapRef;
      const node = ReactDOM.findDOMNode(mapRef);
      const curr = this.state.currentLocation;
      let center = new google.maps.LatLng(curr.lat(), curr.lng());

      let mapConfig = Object.assign({}, {
        center,
        zoom: this.props.zoom,
      }) as google.maps.MapOptions;

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

  private handleEvent(evtName: string) {
    logger.debug(this.loggerNode + ".handleEvent");
    let timeout: number;
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
    logger.debug(this.loggerNode + ".recenterMap");
    const map = this.map;
    if (!this.props.google) { return; };
    const maps = google.maps;

    if (map) {
      let center = this.state.currentLocation;
      if (!(center instanceof google.maps.LatLng)) {
        center = new google.maps.LatLng(center.lat(), center.lng());
      }
      // map.panTo(center)
      map.setCenter(center);
      maps.event.trigger(map, "recenter");
    }
  }
  /**
   * Resizes the map
   * 
   * @private
   * 
   * @memberOf Map
   */
  private restyleMap() {
    logger.debug(this.loggerNode + ".restyleMap");
    if (this.map) {
      google.maps.event.trigger(this.map, "resize");
    }
  }

  private renderChildren() {
    logger.debug(this.loggerNode + ".renderChildren");
    const {children} = this.props;

    if (!children) { return; };

    return React.Children.map(children, (c) => {
      return React.cloneElement(c, {
        google: this.props.google,
        map: this.map,
        mapCenter: this.state.currentLocation,
      });
    });
  }
};
