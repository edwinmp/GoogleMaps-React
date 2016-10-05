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
}

export default class GoogleMaps extends _WidgetBase {
    /**
     * Parameters configured in the Modeler
     *
     * @memberOf GoogleMaps
     */
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

    // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
    private contextObj: mendix.lib.MxObject;
    private behaviour: MapBehaviour;
    private appearance: MapAppearance;
    private data: Array<MapData>;

    /**
     * The TypeScript constructor, not the dojo constructor.
     * move constructor work into widget prototype at bottom of the page.
     */
    constructor(args?: Object, elem?: HTMLElement) {
        // Do not add any default value here... it wil not run in dojo!     
        super() ;
        return new dojoGoogleMaps(args, elem);
    }

    /**
     * dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
     */
    public postCreate() {
        logger.debug(this.id + ".postCreate");
        // set widget dimensions
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

        // this._updateRendering();
    }

    /**
     * mxui.widget._WidgetBase.update is called when context is changed or initialized.
     * Implement to re-render and / or fetch data.
     */
    public update(mxObject: mendix.lib.MxObject, callback?: Function) {
        logger.debug(this.id + ".update");
        this.contextObj = mxObject;
        this.setMapData(callback);
        this._resetSubscriptions();
    }

    /**
     * mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed.
     * Implement to do special tear-down work.
     */
    public uninitialize() {
        logger.debug(this.id + ".uninitialize");
        // Clean up listeners, helper objects, etc.
        // There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        ReactDOM.unmountComponentAtNode(this.domNode);
    }

    /**
     * Render the widget interface.
     * @param callback
     * @private
     */
    private _updateRendering (callback?: Function) {
        logger.debug(this.id + ".updateRendering");
        // Render react component
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
        // The callback, coming from update, needs to be executed, to let the page know it finished rendering
        mxLang.nullExec(callback);
    }
    // Reset subscriptions.
    private _resetSubscriptions () {
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
            this._updateRendering(callback);
        } else {
            this.fetchDataFromDatabase(callback);
        }
    }
    private fetchDataFromMxObject(object: mendix.lib.MxObject) {
        logger.debug(this.id + "fetchDataFromMxObject");
        let coordinates: MapData = {latitude: null, longitude: null};
        if (object) {
            coordinates.latitude = Number(object.get(this.latAttr));
            coordinates.longitude = Number(object.get(this.lngAttr));
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
                this._updateRendering(callback);
            }),
            error: (error) => { logger.debug("Error retrieving data"); }, // TODO: Add alert
            xpath,
        });
    }
}

// Declare widget prototype the Dojo way
// Thanks to https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/dojo/README.md
/* tslint:disable:only-arrow-functions */
let dojoGoogleMaps = dojoDeclare("GoogleMaps.widget.GoogleMaps", [_WidgetBase], (function(Source: any) {
    let result: any = {};
    // dojo.declare.constructor is called to construct the widget instance.
    // Implement to initialize non-primitive properties.
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
