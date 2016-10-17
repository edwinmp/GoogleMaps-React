import * as React from "com/mendix/widget/GoogleMaps/lib/react";

interface InfoProps extends React.Props<Info> {
    classes: string;
}

class Info extends React.Component<InfoProps, {}> {
    public render() {
        return (
            <div className={this.props.classes}>
                {this.props.children}
            </div>
        );
    }
}

export {Info as default};
