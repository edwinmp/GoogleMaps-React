import * as React from "GoogleMaps/lib/react";

class Info extends React.Component<{}, {}> {
    public render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}

export {Info as default};
