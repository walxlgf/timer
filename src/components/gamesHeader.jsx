import React from 'react';
import { Popover, NavBar, Icon } from 'antd-mobile';
const Item = Popover.Item;
export class GamesHeader extends React.Component {
    state = {
        visible: false,
        selected: '',
    };


    onSelect = (opt) => {
        switch (opt.key) {
            case 'newGame':
                this.props.pushGame();
                break;
            case 'patterns':
                this.props.pushPatterns();
                break;
            case 'logout':
                this.props.logout();
                break;
        }
        this.setState({
            visible: false,
        });
    };
    handleVisibleChange = (visible) => {
        console.log(`GamesHeader:handleVisibleChange:visible:${visible}`);
        this.setState({
            visible,
        });
    };


    render() {
        return (<div>
            <NavBar
                mode="light"
                rightContent={
                    <Popover mask
                        overlayClassName="fortest"
                        overlayStyle={{ color: 'currentColor' }}
                        visible={this.state.visible}
                        overlay={[
                            (<Item key="newGame" >新建比赛</Item>),
                            (<Item key="patterns" style={{ whiteSpace: 'nowrap' }}>盲注表管理</Item>),
                            (<Item key="logout" >退出</Item>),
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
            >
                HuluTimer
      </NavBar>
        </div>);
    }
}
