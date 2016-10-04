/*
    GoogleMaps
    ========================

    @file      : GoogleMaps.js
    @version   : 1.0.0
    @author    : Edwin P. Magezi
    @date      : 9/19/2016
    @copyright : Flock of Birds
    @license   : MIT

    Documentation
    ========================
    Google Maps Widget built with React-TypeScript .
*/

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

        this._updateRendering();
    }

    /**
     * mxui.widget._WidgetBase.update is called when context is changed or initialized.
     * Implement to re-render and / or fetch data.
     * @param obj
     * @param callback
     */
    public update(obj: mendix.lib.MxObject, callback?: Function) {
        logger.debug(this.id + ".update");
        this.contextObj = obj;

        if (this.useContextObject) {
            this.data.push(this.fetchDataFromMxObject(this.contextObj));
        }

        this._updateRendering(callback);
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
        if (this.contextObj !== null && typeof(this.contextObj) !== "undefined") {
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
        }
        // The callback, coming from update, needs to be executed, to let the page know it finished rendering
        mxLang.nullExec(callback);
    }
    // Reset subscriptions.
    private _resetSubscriptions () {
        logger.debug(this.id + "._resetSubscriptions");
        // When a mendix object exists create subscriptions.
        if (this.contextObj) {
            logger.debug(this.id + "._resetSubscriptions subscribe", this.contextObj.getGuid());
            this.subscribe({
                callback: dojoLang.hitch(this, (guid) => {
                    // this.fetchMarkers();
                }),
                guid: this.contextObj.getGuid(),
            });
        } else {
            this.subscribe({
                callback: dojoLang.hitch(this, (entity) => {
                    // this.fetchMarkers();
                }),
                entity: this.mapEntity,
                guid: null,
            });
        }
    }
    private fetchDataFromMxObject(object: mendix.lib.MxObject) {
        logger.debug(this.id, "fetchDataFromMxObject");
        let coordinates: MapData = {latitude: null, longitude: null};
        if (object) {
            coordinates.latitude = Number(object.get(this.latAttr));
            coordinates.longitude = Number(object.get(this.lngAttr));
            // TODO: consider coordinates retrieved over association
        }
        return coordinates ? coordinates : null;
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
