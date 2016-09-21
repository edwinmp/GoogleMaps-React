import * as React from "GoogleMaps/lib/react";

import hoistStatics from "../hoist-non-react-statics";
import { newScript, noop, series } from "./utils";

const loadedScript: Array<string> = [];
const pendingScripts: Object = {};
let failedScript: Array<string> = [];

export function startLoadingScripts(scripts: Array<string>, onComplete = noop) {
  // sequence load
  const loadNewScript = (src: string) => {
    if (loadedScript.indexOf(src) < 0) {
      return taskComplete => {
        const callbacks = pendingScripts[src] || [];
        callbacks.push(taskComplete)
        pendingScripts[src] = callbacks;
        if (callbacks.length === 1) {
          return newScript(src)(err => {
            pendingScripts[src].forEach(cb => cb(err, src));
            delete pendingScripts[src];
          });
        }
      };
    }
  };
  const tasks = scripts.map(src => {
    if (Array.isArray(src)) {
      return src.map(loadNewScript);
    } else { return loadNewScript(src); }
  });

  series(...tasks)((err, src) => {
    if (err) {
      failedScript.push(src);
    } else {
      if (Array.isArray(src)) {
        src.forEach(addCache);
      } else { addCache(src); }
    }
  })(err => {
    removeFailedScript();
    onComplete(err);
  });
}

const addCache = (entry) => {
  if (loadedScript.indexOf(entry) < 0) {
    loadedScript.push(entry);
  }
};

const removeFailedScript = () => {
  if (failedScript.length > 0) {
    failedScript.forEach((script) => {
      const node = document.querySelector(`script[src='${script}']`)
      if (node != null) {
        node.parentNode.removeChild(node);
      }
    })

    failedScript = [];
  }
};

const scriptLoader: Function = (...scripts) => (WrappedComponent: __React.Component<{}, {}>) => {
  class ScriptLoader extends React.Component<{}, {}> {
    private static propTypes = {
      onScriptLoaded: React.PropTypes.func,
    };

    private static defaultProps = {
      onScriptLoaded: noop,
    };
    private _isMounted: boolean;

    constructor (props, context) {
      super(props, context);

      this.state = {
        isScriptLoaded: false,
        isScriptLoadSucceed: false,
      };

      this._isMounted = false;
    }

    public componentDidMount () {
      this._isMounted = true;
      startLoadingScripts(scripts, err => {
        if (this._isMounted) {
          this.setState({
            isScriptLoaded: true,
            isScriptLoadSucceed: !err,
          }, () => {
            if (!err) {
              this.props.onScriptLoaded();
            }
          });
        }
      });
    }

    public componentWillUnmount () {
      this._isMounted = false;
    }

    public render () {
      const props = Object.assign(
        {},
        this.props,
        this.state
      );

      return (
        <WrappedComponent {...this.props} />
      );
    }
  }

  return hoistStatics(ScriptLoader, WrappedComponent);
};

export default scriptLoader;
