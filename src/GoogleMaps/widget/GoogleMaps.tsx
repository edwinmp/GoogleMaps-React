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

// import * as makeCancelable from "GoogleMaps/lib/cancelablePromise";
// import * as GoogleApi from "GoogleMaps/lib/GoogleApi";
// import * as ScriptCache from "GoogleMaps/lib/ScriptCache";

// import components
import GetWrapper from "./components/Wrapper";

// interface extensions
interface IMapsWindow extends Window {
    isScriptLoaded: boolean;
    isScriptLoading: boolean;
}

class GoogleMaps extends _WidgetBase {
    // Parameters configured in the Modeler
    private onChangeMicroflow: string;
    private apiKey: string;

    // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
    private contextObj: mendix.lib.MxObject;
    private handles: any[];
    private _readOnly: boolean;
    private libraries: string[];
    private googleMapsApiBaseUrl: string;

    // The TypeScript Contructor, not the dojo consctuctor, move contructor work into widget prototype at bottom of the page. 
    constructor(args?: Object, elem?: HTMLElement) {
        // Do not add any default value here... it wil not run in dojo!     
        super() ;
        return new dojoGoogleMaps(args, elem);
    }
    // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
    public postCreate() {
        logger.debug(this.id + ".postCreate");

        if (this.readOnly || this.get("disabled")) {
            this._readOnly = true;
        }
        // hitch context to all callbacks
        this.onChangeEvent = this.onChangeEvent.bind(this);
        this.callMicroflow = this.callMicroflow.bind(this);
        this.getGoogleMapsApiUrl = this.getGoogleMapsApiUrl.bind(this);
        this.onLibraryLoaded = this.onLibraryLoaded.bind(this);
        this.onLibraryLoadingError = this.onLibraryLoadingError.bind(this);
        this.onLibraryLoading = this.onLibraryLoading.bind(this);

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
    }
    // Render the widget interface.
    private _updateRendering (callback?: Function) {
        logger.debug(this.id + ".updateRendering");
        const Wrapper = GetWrapper([this.getGoogleMapsApiUrl()]);
        if (this.contextObj !== null && typeof(this.contextObj) !== "undefined") {
            ReactDOM.render(
                // Component goes here, this.domNode
                <Wrapper
                    isScriptLoading={window.isScriptLoading}
                    isScriptLoaded={window.isScriptLoaded}
                    onScriptLoading={this.onLibraryLoading}
                    onScriptLoaded={this.onLibraryLoaded}
                    onError={this.onLibraryLoadingError}
                />,
                this.domNode
            );
        }
        // The callback, coming from update, needs to be executed, to let the page know it finished rendering
        mxLang.nullExec(callback);
    }
    private getGoogleMapsApiUrl() {
        return `${this.googleMapsApiBaseUrl}?key=${this.apiKey}&libraries=${this.libraries.join()}`;
    }
    /**
     * Called when google Maps API script is successfully loaded
     * 
     * @private
     * 
     * @memberOf GoogleMaps
     */
    private onLibraryLoaded() {
        logger.debug(this.id + "... Script Loaded!");
        if (!window.isScriptLoaded) {
            window.isScriptLoaded = true;
            this._updateRendering();
        }
    }
    /**
     * Called when google Maps API script is loading
     * 
     * @private
     * 
     * @memberOf GoogleMaps
     */
    private onLibraryLoading() {
        logger.debug(this.id + "... Script Loading!");
        window.isScriptLoading = true;
    }
    /**
     * Called when google Maps API script failes to load
     * 
     * @private
     * 
     * @memberOf GoogleMaps
     */
    private onLibraryLoadingError() {
        logger.debug(this.id + "... Library Loading Failed...");
        window.isScriptLoaded = false;
    }
    /**
     * Called when a change occurs
     * 
     * @private
     * @param {string} value
     * 
     * @memberOf GoogleMaps
     */
    private onChangeEvent(value: string) {
        logger.debug(this.id + ".onChangeEvent");
    }
    // call the microflow and remove progress on finishing
    private callMicroflow(callback?: Function) {
        logger.debug(this.id + ".callMicroflow");
        mx.data.action({
            callback: (obj: mendix.lib.MxObject) => {
                logger.debug(this.id + ": Microflow executed successfully");
            },
            error: dojoLang.hitch(this, (error) => {
                logger.error(this.id + ": An error occurred while executing microflow: " + error.description);
            }),
            params: {
                actionname: this.onChangeMicroflow,
                applyto: "selection",
                guids: [ this.contextObj.getGuid() ],
            },
            store: {
                caller: this.mxform,
            },
        });
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
        this.apiKey = "";
        this.libraries = ["geometry", "places", "visualization", "places"];
        this.googleMapsApiBaseUrl = "https://maps.googleapis.com/maps/api/js";

        if (typeof window.isScriptLoaded === "undefined") {
            window.isScriptLoaded = false;
        }
        if (typeof window.isScriptLoading === "undefined") {
            window.isScriptLoading = false;
        }
    };
    for (let i in Source.prototype) {
        if (i !== "constructor" && Source.prototype.hasOwnProperty(i)) {
            result[i] = Source.prototype[i];
        }
    }
    return result;
} (GoogleMaps)));

export = GoogleMaps;

