// import dependent modules
import * as dojoDeclare from "dojo/_base/declare";
import * as dojoLang from "dojo/_base/lang";
import * as domStyle from "dojo/dom-style";
import * as mxLang from "mendix/lang";
import * as _WidgetBase from  "mxui/widget/_WidgetBase";
// tslint:disable-next-line
import * as React from "GoogleMaps/lib/react";
import ReactDOM = require("GoogleMaps/lib/react-dom");

// import components
import Wrapper, { MapAppearance, MapBehaviour } from "./components/Wrapper";

export interface MapData {
    latitude: number;
    longitude: number;
    info: string;
}

export default class GoogleMaps extends _WidgetBase {
    // Appearance
    private mapHeight: number;
    private mapWidth: number;
    private defaultMapType: string;
    // Behaviour
    private apiAccessKey: string;
    private defaultLat: string;
    private defaultLng: string;
    private useContextObject: boolean;
    private zoom: number;
    // Data source
    private mapEntity: string;
    private latAttr: string;
    private lngAttr: string;
    private xpathConstraint: string;
    private infoWindowAttr: string;

    private contextObj: mendix.lib.MxObject;
    private behaviour: MapBehaviour;
    private appearance: MapAppearance;
    private data: Array<MapData>;

    constructor(args?: Object, elem?: HTMLElement) {    
        super() ;
        return new dojoGoogleMaps(args, elem);
    }

    public postCreate() {
        logger.debug(this.id + ".postCreate");
        domStyle.set(this.domNode, {
            height: this.mapHeight !== 0 ? this.mapHeight + "px" : "auto",
            position: "relative", // required to contain map width
            width: this.mapWidth !== 0 ? this.mapWidth + "px" : "100%",
        });
        // initialize widget component props
        this.behaviour = {
            apiAccessKey: this.apiAccessKey,
            defaultLat: Number(this.defaultLat),
            defaultLng: Number(this.defaultLng),
            zoom: this.zoom,
        };
        this.appearance = {
            defaultMapType: this.defaultMapType,
        };
    }

    public update(mxObject: mendix.lib.MxObject, callback?: Function) {
        logger.debug(this.id + ".update");
        this.contextObj = mxObject;
        this.setMapData(callback);
        this.resetSubscriptions();
    }

    public uninitialize() {
        logger.debug(this.id + ".uninitialize");
        ReactDOM.unmountComponentAtNode(this.domNode);
    }

    private updateRendering (callback?: Function) {
        logger.debug(this.id + ".updateRendering");
        ReactDOM.render(
            <Wrapper
                apiKey={this.apiAccessKey}
                appearance={this.appearance}
                behaviour={this.behaviour}
                data={this.data}
                height={this.mapHeight}
                widgetID={this.id}
                width={this.mapWidth}
            />,
            this.domNode
        );
        mxLang.nullExec(callback);
    }
    private resetSubscriptions () {
        logger.debug(this.id + "._resetSubscriptions");
        if (this.contextObj) {
            this.subscribe({
                callback: dojoLang.hitch(this, (guid) => {
                    this.setMapData();
                }),
                guid: this.contextObj.getGuid(),
            });
        } else {
            this.subscribe({
                callback: dojoLang.hitch(this, (entity) => {
                    this.setMapData();
                }),
                entity: this.mapEntity,
                guid: null,
            });
        }
    }
    private setMapData(callback?: Function) {
        logger.debug(this.id + ".setMapData");
        if (this.useContextObject) {
            this.data.push(this.fetchDataFromMxObject(this.contextObj));
            this.updateRendering(callback);
        } else {
            this.fetchDataFromDatabase(callback);
        }
    }
    private fetchDataFromMxObject(object: mendix.lib.MxObject) {
        logger.debug(this.id + "fetchDataFromMxObject");
        let coordinates: MapData = {info: null, latitude: null, longitude: null};
        if (object) {
            coordinates.latitude = Number(object.get(this.latAttr));
            coordinates.longitude = Number(object.get(this.lngAttr));
            coordinates.info = this.infoWindowAttr !== "" ? object.get(this.infoWindowAttr) as string : null;
            // TODO: consider coordinates retrieved over association: Not in this function though
        }
        return coordinates ? coordinates : null;
    }
    private fetchDataFromDatabase(callback?: Function) {
        logger.debug(this.id + "fetchDataFromDatabase");
        let xpath = "//" + this.mapEntity + this.xpathConstraint;
        if (!this.contextObj && xpath.indexOf("[%CurrentObject%]") > -1) {
            // TODO: Add error alert for this scenario.
            return;
        }
        if (this.contextObj) {
            xpath = xpath.replace("[%CurrentObject%]", this.contextObj.getGuid());
        }
        mx.data.get({
            callback: dojoLang.hitch(this, (objects) => {
                this.data = objects.map((mxObject: mendix.lib.MxObject) => {
                    return this.fetchDataFromMxObject(mxObject);
                });
                this.updateRendering(callback);
            }),
            error: (error) => { logger.debug("Error retrieving data"); }, // TODO: Add alert
            xpath,
        });
    }
}

/* tslint:disable:only-arrow-functions */
let dojoGoogleMaps = dojoDeclare("GoogleMaps.widget.GoogleMaps", [_WidgetBase], (function(Source: any) {
    let result: any = {};
    result.constructor = function() {
        logger.debug( this.id + ".constructor");
        this.data = [];
    };
    for (let i in Source.prototype) {
        if (i !== "constructor" && Source.prototype.hasOwnProperty(i)) {
            result[i] = Source.prototype[i];
        }
    }
    return result;
} (GoogleMaps)));
