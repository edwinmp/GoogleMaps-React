// import dependent modules
import * as DojoDeclare from "dojo/_base/declare";
import * as domClass from "dojo/dom-class";
import * as domStyle from "dojo/dom-style";
import * as mendixLang from "mendix/lang";
import * as _WidgetBase from  "mxui/widget/_WidgetBase";
// tslint:disable-next-line
import { createElement } from "com/mendix/widget/GoogleMaps/lib/react";
import { render, unmountComponentAtNode } from "com/mendix/widget/GoogleMaps/lib/react-dom";

// import components
import { MapTypeIds, Wrapper, WrapperProps } from "./components/Wrapper";

export interface MapData {
    latitude: number;
    longitude: number;
    info: string;
    guid: string;
}

class GoogleMaps extends _WidgetBase {
    private mapHeight: number;
    private mapWidth: number;
    private defaultMapType: MapTypeIds;
    private apiAccessKey: string;
    private defaultLat: string;
    private defaultLng: string;
    private useContextObject: boolean;
    private zoom: number;
    private mapEntity: string;
    private latAttr: string;
    private lngAttr: string;
    private xpathConstraint: string;
    private infoWindowAttr: string;
    private onClickMarkerMicroflow: string;

    private contextObj: mendix.lib.MxObject;
    private wrapperProps: WrapperProps;
    private data: MapData[];

    postCreate() {
        this.data = [];
        this.setDataAndUpdate = this.setDataAndUpdate.bind(this);
        this.updateRendering = this.updateRendering.bind(this);
        this.callMicroflow = this.callMicroflow.bind(this);
        domClass.add(this.domNode, "google-map-wrapper");
        domStyle.set(this.domNode, {
            height: this.mapHeight !== 0 ? this.mapHeight + "px" : "auto",
            width: this.mapWidth !== 0 ? this.mapWidth + "px" : "100%",
        });
    }

    update(mxObject: mendix.lib.MxObject, callback?: Function) {
        this.contextObj = mxObject;
        this.fetchMapData(callback);
        this.resetSubscriptions();
    }

    uninitialize() {
        unmountComponentAtNode(this.domNode);
    }

    private updateRendering (callback?: Function) {
        const onClickMarker = this.onClickMarkerMicroflow
            ? (guids: Array<string>) => this.callMicroflow(this.onClickMarkerMicroflow, guids)
            : null;

        this.wrapperProps = {
            apiKey: this.apiAccessKey,
            data: this.data,
            defaultLat: Number(this.defaultLat),
            defaultLng: Number(this.defaultLng),
            defaultMapType: this.defaultMapType,
            height: this.mapHeight,
            onClickMarker,
            widgetID: this.id,
            width: this.mapWidth,
            zoom: this.zoom,
        };
        render(createElement(Wrapper, this.wrapperProps), this.domNode);
        mendixLang.nullExec(callback);
    }
    private resetSubscriptions () {
        this.unsubscribeAll();
        if (this.contextObj) {
            this.subscribe({
                callback: (guid: string) => this.fetchMapData(),
                guid: this.contextObj.getGuid(),
            });
        } else {
            this.subscribe({
                callback: (entity: string) => this.fetchMapData(),
                entity: this.mapEntity,
                guid: null,
            });
        }
    }
    private fetchMapData(callback?: Function) {
        this.useContextObject ? this.setDataAndUpdate([this.contextObj]) : this.fetchDataFromDatabase();
        mendixLang.nullExec(callback);
    }
    private setDataAndUpdate(mxObjects: mendix.lib.MxObject[]) {
        this.data = mxObjects.map( (mxObject) => this.getDataFromMxObject(mxObject) );
        this.updateRendering();
    }
    private getDataFromMxObject(object: mendix.lib.MxObject) {
        let location: MapData = null;
        if (object) {
            location = {
                guid: object.getGuid(),
                info: this.infoWindowAttr ? object.get(this.infoWindowAttr) as string : null,
                latitude: Number(object.get(this.latAttr)),
                longitude: Number(object.get(this.lngAttr))
            };
        }
        return location;
    }
    private fetchDataFromDatabase() {
        let xpath = "//" + this.mapEntity + this.xpathConstraint;
        // TODO: Add error alert for this scenario.
        if (!this.contextObj && xpath.indexOf("[%CurrentObject%]") > -1) { return; }
        if (this.contextObj) { xpath = xpath.replace("[%CurrentObject%]", this.contextObj.getGuid()); }
        mx.data.get({
            callback: (objects: mendix.lib.MxObject[]) => this.setDataAndUpdate(objects),
            error: () => { logger.debug("Error retrieving data"); }, // TODO: Add alert
            xpath,
        });
    }
    private callMicroflow(microflow: string, guids?: string[],
                          onSuccessCallback?: Function, onFailureCallback?: Function) {
        mx.data.action({
            callback: (result: any) => onSuccessCallback && onSuccessCallback(result),
            error: (error: mendix.lib.MxError) => onFailureCallback && onFailureCallback(error),
            params: {
                actionname: microflow,
                applyto: "selection",
                guids,
            },
            origin: this.mxform
        });
    }
}

/* tslint:disable:only-arrow-functions */
DojoDeclare("com.mendix.widget.GoogleMaps.GoogleMaps", [_WidgetBase], (function(Source: any) {
    let result: any = {};
    for (let i in Source.prototype) {
        if (i !== "constructor" && Source.prototype.hasOwnProperty(i)) {
            result[i] = Source.prototype[i];
        }
    }
    return result;
} (GoogleMaps)));
