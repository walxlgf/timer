import React from 'react';
import { Popover, NavBar, Icon } from 'antd-mobile';
const Item = Popover.Item;
export class PatternsHeader extends React.Component {
    state = {
        visible: false,
    };

    onSelect = (opt) => {
        switch (opt.key) {
            case 'editPattern':
                this.props.pushEditPattern();
                break;
        }
        this.setState({
            visible: false,
        });
    };

    handleVisibleChange = (visible) => {
        console.log(`DetailsHeader:handleVisibleChange:visible:${visible}`);
        this.setState({
            visible,
        });
    };

    render() {
        return (
            <div>
                <NavBar
                    mode="light"
                    icon={<Icon type="left" />}
                    onLeftClick={() => this.props.goBack()}
                    rightContent={
                        <Popover mask
                            overlayClassName="fortest"
                            overlayStyle={{ color: 'currentColor' }}
                            visible={this.state.visible}
                            overlay={[
                                (<Item key="editPattern" >新建模板</Item>),
                            ]}
                            align={{
                                overflow: { adjustY: 0, adjustX: 0 },
                                offset: [-10, 0],
                            }}
                            onVisibleChange={this.handleVisibleChange}
                            onSelect={this.onSelect}
                        >
                            <div style={{
                                height: '100%',
                                padding: '0 15px',
                                marginRight: '-15px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                            >
                                <Icon type="ellipsis" />
                            </div>
                        </Popover>
                    }
                >盲注列表</NavBar>
            </div>);
    }
}