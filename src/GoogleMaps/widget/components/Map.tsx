
declare var logger: mendix.logger;

import * as React from "GoogleMaps/lib/react";
import ReactDOM = require("GoogleMaps/lib/react-dom");

// import Utilities
import {ObjectAssign} from "../../lib/Polyfills";
import {toCamelCase} from "../utils/utils";

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
export interface MapProps extends React.Props<Map> {
  google: {};
  zoom?: number;
  centerAroundCurrentLocation?: boolean;
  center?: google.maps.LatLng;
  initialCenter?: google.maps.LatLng;
  mapTypeId?: google.maps.MapTypeId | string;
  className?: string;
  style?: Object;
  containerStyle?: Object;
  widgetID: string;
  onReady?: Function;
  onClick?: Function;
  OnDragend?: Function;
  onCenterChanged?: Function;
  [key: string]: any;
}

interface MapState {
  currentLocation: google.maps.LatLng;
}

interface MapArray extends Array<google.maps.MapsEventListener> {
  [key: string]: any;
}

const evtNames = ["ready", "click", "dragend", "center_changed"];

// export {Marker} from './components/Marker'
// export {InfoWindow} from './components/InfoWindow'

export default class Map extends React.Component<MapProps, MapState> {
  /**
   * declare default props
   * 
   */
  public static defaultProps: MapProps = {
    centerAroundCurrentLocation: false,
    className: "",
    containerStyle: {},
    google: null,
    mapTypeId: typeof google !== "undefined" ? google.maps.MapTypeId.ROADMAP : undefined,
    style: {},
    widgetID: "GoogleMaps",
    zoom: 14,
  };
  private listeners: MapArray; // used to manage the map event listeners
  private geoPromise: dojo.Deferred;
  private mapRef: HTMLElement;
  private map: google.maps.Map;
  private loggerNode: string;

  constructor(props: MapProps) {
    super(props);
    this.loggerNode = this.props.widgetID + ".Map";
    logger.debug(this.loggerNode + ".constructor");

    if (!props.hasOwnProperty("google") || props.google === null) {
      throw new Error(this.loggerNode + ".You must include a 'google' prop & it must not be null");
    }

    this.listeners = [];
    this.state = {
      currentLocation: new google.maps.LatLng(props.initialCenter.lat(), props.initialCenter.lng()),
    };
  }
  /**
   * Life cycle: Called after component has been mounted.
   * 
   */
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
  /**
   * Life cycle: Called after component has been updated.
   * 
   * @param {IMapProps} prevProps
   * @param {IMapState} prevState
   * 
   * @memberOf Map
   */
  public componentDidUpdate(prevProps: MapProps, prevState: MapState) {
    logger.debug(this.loggerNode + ".componentDidUpdate");
    if (prevProps.google !== this.props.google) {
      this.loadMap();
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
  /**
   * Life cycle: Called before component is destroyed
   * 
   * 
   * @memberOf Map
   */
  public componentWillUnmount() {
    logger.debug(this.loggerNode + ".componentWillUnmount");
    if (this.geoPromise) {
      this.geoPromise.cancel("Component is unmounting!", false);
    }
    Object.keys(this.listeners).forEach((e: string) => {
      google.maps.event.removeListener(this.listeners[e]);
    });
  }
  /**
   * Life cycle: Called to render the component
   * 
   * @returns
   * 
   * @memberOf Map
   */
  public render() {
    logger.debug(this.loggerNode + ".render");
    const style = ObjectAssign({}, mapStyles.map, this.props.style);

    const containerStyles = ObjectAssign({}, mapStyles.container, this.props.containerStyle);

    return (
      <div style={containerStyles} className={this.props.className}>
        <div style={style} ref={ (c) => this.mapRef = c }>
          Loading map...
        </div>
        {this.renderChildren()}
      </div>
    );
  }
  /**
   * Initialize map with specific configs and render it to the dom
   * Also register map events after initialization 
   * 
   * @private
   * 
   * @memberOf Map
   */
  private loadMap() {
    logger.debug(this.loggerNode + ".loadMap");
    const props = this.props;
    if (props && props.google) {
      const maps = google.maps;

      const mapRef = this.mapRef;
      const node = ReactDOM.findDOMNode(mapRef);
      const curr = this.state.currentLocation;
      let center = new google.maps.LatLng(curr.lat(), curr.lng());

      let mapConfig = ObjectAssign({}, {
        center,
        mapTypeControlOption: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        },
        mapTypeId: props.mapTypeId,
        zoom: props.zoom,
      }) as google.maps.MapOptions;
      // Initialize map with configs above and render it to dom
      this.map = new maps.Map(node, mapConfig);
      // add event listeners
      evtNames.forEach(e => {
        this.listeners[e] = this.map.addListener(e, this.handleEvent(e));
      });
      maps.event.trigger(this.map, "ready");
      this.forceUpdate();
    }
  }
  /**
   * Returns a reference to the function to execute for each registered event
   * Makes sure each function is run asynchronously
   * 
   * @private
   * @param {string} evtName
   * @returns
   * 
   * @memberOf Map
   */
  private handleEvent(evtName: string) {
    logger.debug(this.loggerNode + ".handleEvent");
    let timeout: number;
    // get camelized version of event name... event props are represented this way
    const handlerName = `on${toCamelCase(evtName)}`;

    return (e: Event) => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      // Used to execute the event callback asynchronously
      timeout = setTimeout(() => {
        if (this.props[handlerName]) {
          this.props[handlerName](this.props, this.map, e);
        }
      }, 0);
    };
  }
  /**
   * Sets the current location based on the specified coordinates
   * 
   * @private
   * @returns
   * 
   * @memberOf Map
   */
  private recenterMap() {
    logger.debug(this.loggerNode + ".recenterMap");
    const map = this.map;
    if (!this.props.google) { return; }
    const maps = google.maps;

    if (map) {
      let center = this.state.currentLocation;
      // map.panTo(center)
      map.setCenter(center);
      maps.event.trigger(map, "center_changed");
    }
  }
  /**
   * Used to render Markers and InfoWindows
   * Children are cloned with the relevant props passed in
   * 
   * @private
   * @returns
   * 
   * @memberOf Map
   */
  private renderChildren() {
    logger.debug(this.loggerNode + ".renderChildren");
    const {children} = this.props;

    if (!children) { return; }

    return React.Children.map(children, (c: React.ReactElement<any>) => {
      const child = c;
      if (React.isValidElement(c)) {
        return React.cloneElement(child, {
                google: this.props.google,
                map: this.map,
                mapCenter: this.state.currentLocation,
              });
      }
    });
  }
};
