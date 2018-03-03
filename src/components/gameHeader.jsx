import React from 'react';
import { NavBar, Icon, Button } from 'antd-mobile';
export class GameHeader extends React.Component {
    render() {
        let hasRight = false;
        switch (this.props.opt) {
            case 'add':
            case 'edit':
                hasRight = true;
                break;
            case 'view':
            default:
                hasRight = false;
                break;
        }
        return (
            <div>
                <NavBar
                    mode="light"
                    icon={<Icon type="left" />}
                    onLeftClick={() => this.props.goBack()}
                    rightContent={
                        hasRight && <Button
                            type="primary"
                            size="small"
                            inline
                            onClick={() => this.props.save()}
                        >保存</Button>
                    }
                >{this.props.title}</NavBar>
            </div>);
    }
}