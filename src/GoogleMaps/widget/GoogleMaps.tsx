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

// declare globals
declare var mx: mx.mx;
declare var logger: mendix.logger;
declare var window: IMapsWindow;

// import dependent modules
import * as dojoDeclare from "dojo/_base/declare";
import * as dojoLang from "dojo/_base/lang";
import * as mxLang from "mendix/lang";
import * as _WidgetBase from  "mxui/widget/_WidgetBase";

import * as React from "GoogleMaps/lib/react";
import ReactDOM = require("GoogleMaps/lib/react-dom");

// import components
import Wrapper, { IMapBehaviour } from "./components/Wrapper";

// interface extensions
export interface IMapsWindow extends Window {
    // Use this to extend the Window global with your own properties
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
    // Behaviour
    private apiAccessKey: string;
    private defaultLat: string;
    private defaultLng: string;

    // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
    private contextObj: mendix.lib.MxObject;
    private handles: any[];
    private _readOnly: boolean;
    private behaviour: IMapBehaviour;

    // The TypeScript Contructor, not the dojo consctuctor, move contructor work into widget prototype at bottom of the page. 
    constructor(args?: Object, elem?: HTMLElement) {
        // Do not add any default value here... it wil not run in dojo!     
        super() ;
        return new dojoGoogleMaps(args, elem);
    }
    // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
    public postCreate() {
        logger.debug(this.id + ".postCreate");
        // initialize widget component props
        this.behaviour = {
            defaultLat: this.defaultLat,
            defaultLng: this.defaultLng,
        };

        this._updateRendering();
    }
    // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
    public update(obj: mendix.lib.MxObject, callback?: Function) {
        logger.debug(this.id + ".update");
        this.contextObj = obj;

        this._updateRendering(callback);
        this._resetSubscriptions();
    }
    // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
    public uninitialize() {
        logger.debug(this.id + ".uninitialize");
        // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.  
        ReactDOM.unmountComponentAtNode(this.domNode);
    }
    // Render the widget interface.
    private _updateRendering (callback?: Function) {
        logger.debug(this.id + ".updateRendering");
        if (this.contextObj !== null && typeof(this.contextObj) !== "undefined") {
            // Render react component
            ReactDOM.render(
                <Wrapper
                    apiKey={this.apiAccessKey}
                    behaviour={this.behaviour}
                    widget={this}
                    width={this.mapWidth}
                    height={this.mapHeight}
                />,
                this.domNode
            );
        }
        // The callback, coming from update, needs to be executed, to let the page know it finished rendering
        mxLang.nullExec(callback);
    }
    // Remove subscriptions
    private _unsubscribe () {
        if (this.handles) {
            for (let handle of this.handles) {
                mx.data.unsubscribe(handle);
            }
            this.handles = [];
        }
    }
    // Reset subscriptions.
    private _resetSubscriptions () {
        logger.debug(this.id + "._resetSubscriptions");
        // Release handles on previous object, if any.
        this._unsubscribe();
        // When a mendix object exists create subscribtions.
        if (this.contextObj) {
            let objectHandle = mx.data.subscribe({
                callback: dojoLang.hitch(this, function (guid: string) {
                    this._updateRendering();
                }),
                guid: this.contextObj.getGuid(),
            });

            // let attrHandle = mx.data.subscribe({
            //     attr: this.backgroundColor,
            //     callback: dojoLang.hitch(this, function (guid, attr, attrValue) {
            //         this._updateRendering();
            //     }),
            //     guid: this.contextObj.getGuid(),
            // });

            this.handles = [ objectHandle ];
        }
    }
}

// Declare widget's prototype the Dojo way
// Thanks to https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/dojo/README.md
let dojoGoogleMaps = dojoDeclare("GoogleMaps.widget.GoogleMaps", [_WidgetBase], (function(Source: any) {
    let result: any = {};
    // dojo.declare.constructor is called to construct the widget instance.
    // Implement to initialize non-primitive properties.
    result.constructor = function() {
        logger.debug( this.id + ".constructor");
    };
    for (let i in Source.prototype) {
        if (i !== "constructor" && Source.prototype.hasOwnProperty(i)) {
            result[i] = Source.prototype[i];
        }
    }
    return result;
} (GoogleMaps)));

