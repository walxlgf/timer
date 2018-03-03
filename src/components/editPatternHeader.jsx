import React from 'react';
import { NavBar, Icon } from 'antd-mobile';
export class EditPatternHeader extends React.Component {
    render() {
        return (
            <div>
                <NavBar
                    mode="light"
                    icon={<Icon type="left" />}
                    onLeftClick={() => this.props.goBack()}
                >{this.props.title}</NavBar>
            </div>);
    }
}