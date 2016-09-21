/// <reference path="dojo/dojo.d.ts" />
/// <reference path="dojo/dijit.d.ts" />

/// <reference path="react/react.d.ts" />
/// <reference path="react/react-dom.d.ts" />
/// <reference path="mobx/mobx.d.ts" />
/// <reference path="mobx/mobx-react-devtool.d.ts" />
/// <reference path="index.d.ts" />


declare module "GoogleMaps/lib/react-dom"
{
	export =  __React.__DOM;
}

declare module "GoogleMaps/lib/react"
{
	export = __React;
}
declare module "GoogleMaps/lib/react.min"
{
	export = __React;
}
