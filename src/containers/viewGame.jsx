import React from 'react';
import { Button, Popover, Icon, WingBlank, Modal, InputItem, Toast, Card, WhiteSpace, Tag } from 'antd-mobile';
import { List } from 'antd-mobile';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router';
import {
    updateGame,
    subscribeGame, unsubscribeGames, unsubscribeGame
} from "../actions/game";
import {
    bindDeviceToGame, unbindDeviceToGame,
    bindDeviceToUser, unbindDeviceToUser, resetBindDeviceToUser,
    fetchUserDevices,
} from "../actions/screen";

import { GameHeader } from '../components/gameHeader';
import { CountDown } from '../components/countDown';
import EditPatternForm from '../components/editPatternForm';
import ScreenForm from '../components/screenForm';
import { lchmod } from 'fs';
import { formatShortDate, formatCountdown } from '../utils';
import index from 'antd-mobile/lib/picker-view';

const Item = List.Item;
const Brief = Item.Brief;

class ViewGame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            popoverVisible: false,
            modalVisible: false,
            rounds: [],
            selectedRound: null,
            status: '',//比赛状态 'before' 'gaming' 'after' 在CountDown中计算 回调回来
            currentRoundIndex: -1,//当前正在运行round的index 在CountDown中计算 回调回来
        };
    }

    componentWillMount() {
        console.log(`viewGame:componentWillMount`);
    }

    componentDidMount() {
        console.log(`viewGame:componentDidMount`);
        if (this.props.game) {
            this.setState({ rounds: [...this.props.game.get('rounds')] })
            //注册监听
            this.props.subscribeGame(this.props.game);
            this.props.fetchUserDevices();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.game) {
            this.setState({ rounds: [...nextProps.game.get('rounds')] })
        }
        //如果当前对象已经之删除 直接返回
        if (nextProps.deleted) {
            this.props.history.goBack();
        }
        
        if(!this.props.userbinded && nextProps.userbinded){
            this.props.fetchUserDevices();
        }

        if(!this.props.userunbinded && nextProps.userunbinded){
            this.props.fetchUserDevices();
        }

    }

    componentWillUnmount() {
        console.log(`viewGame:componentWillUnmount`);
        //取消监听
        this.props.unsubscribeGame();
    }


    addRound = () => {
        let rounds = this.state.rounds;
        if (!rounds || rounds.length === 0) {
            let level = 1;
            let ante = 5;
            let smallBlind = 10;
            let bigBlind = 20;
            let duration = 30;
            let round = { level, ante, smallBlind, bigBlind, duration };
            rounds.push(round);
        } else {
            let level = rounds[rounds.length - 1].level + 1;
            let smallBlind = level * 10;
            let bigBlind = level * 20;
            let round = { ...rounds[rounds.length - 1], level, smallBlind, bigBlind };
            rounds.push(round);
        }
        this.setState({ rounds: rounds })
    }

    //把编辑过后的round保存到form中
    onSaveEdit = (roundFromEdit) => {
        let rounds = this.state.rounds;
        let roundsData = [];
        for (let i = 0; i < rounds.length; i++) {
            let round = rounds[i];
            if (round.level === roundFromEdit.level) {
                let newRound = { ...roundFromEdit };
                roundsData.push(newRound)
            } else {
                let newRound = { ...round };
                roundsData.push(newRound);
            }
        }

        this.setState({ rounds: roundsData })
    }

    //大屏幕绑定到用户
    onBindDeviceToUser = (uuid) => {
        if (this.props.game) {
            this.props.bindDeviceToUser(uuid);
        }
    }
    onUnbindDeviceToUser = (uuid) => {
        if (this.props.game) {
            this.props.unbindDeviceToUser(uuid);
        }
    }

    startImmediate = () => {
        let game = this.props.game;
        game.set('startTime', new Date())
        this.props.updateGame(game);
    }

    pause = () => {
        let game = this.props.game;
        game.set('pauseTime', new Date())
        this.props.updateGame(game);
    }

    resume = () => {
        let game = this.props.game;
        //求出当前时间和pausetime的时间差  
        let pauseTime = game.get('pauseTime').getTime();
        let pauseDuration = Date.now() - pauseTime;
        console.log(`view:resume:pauseDuration${pauseDuration}`);

        //让开始时间推迟
        let startTime = new Date(game.get('startTime').getTime() + pauseDuration);
        //设置pauseTime
        game.set('startTime', startTime);
        game.set('pauseTime', null);

        this.props.updateGame(game);
    }

    onSelect = (opt) => {
        const { form } = this.props;
        let selectedRound = opt.props.value;
        let rounds = this.state.rounds;
        let selectedIndex = rounds.indexOf(selectedRound);

        if (opt.key.startsWith('edit')) {
            console.log(`viewGame:onSelect:edit:${JSON.stringify(opt.key)}`);
            this.setState({
                modalVisible: true,
            });
        } else if (opt.key.startsWith('insert')) {
            //insert 三部分 
            //小于selectedIndex 复制就好了
            //等于selectedIndex 复制一份 再加 level加1的一份
            //大于selectedIndex level加1 复制一份
            let roundsData = [];
            for (let i = 0; i < rounds.length; i++) {
                let round = rounds[i];
                if (i < selectedIndex) {
                    let newRound = { ...round };
                    roundsData.push(newRound)
                } else if (i === selectedIndex) {
                    let newRound = { ...round };
                    roundsData.push(newRound)
                    newRound = { ...round };
                    newRound.level = newRound.level + 1;
                    roundsData.push(newRound);
                } else {
                    let newRound = { ...round };
                    newRound.level = newRound.level + 1;
                    roundsData.push(newRound);
                }
            }
            this.setState({ rounds: roundsData })
        } else if (opt.key.startsWith('delete')) {
            //delete 三部分 
            //小于selectedIndex 复制就好了
            //等于selectedIndex 删除 不push
            //大于selectedIndex level-1 复制一份
            let roundsData = [];
            for (let i = 0; i < rounds.length; i++) {
                let round = rounds[i];
                if (i < selectedIndex) {
                    let newRound = { ...round };
                    roundsData.push(newRound)
                } else if (i === selectedIndex) {
                } else {
                    let newRound = { ...round };
                    newRound.level = newRound.level - 1;
                    roundsData.push(newRound);
                }
            }
            this.setState({ rounds: roundsData })
        } else if (opt.key.startsWith('breakDuration')) {
            selectedRound.breakDuration = 30;
        }

        this.setState({
            popoverVisible: false,
            selectedRound: opt.props.value,
        });

        console.log(`viewGame：onSelect：this.state:${JSON.stringify(this.state)}`)
    };


    onModalClose = key => () => {
        console.log(`viewGame：onModalClose:${key}`)
        this.setState({
            [key]: false,
        });
    }

    onSubmit = () => {
        let game = this.props.game;
        console.log(`viewGame:onSubmit:game:${this.props.game}`);
        game.set('rounds', this.state.rounds)
        this.props.updateGame(game);
    }

    handleVisibleChange = (visible) => {
        this.setState({
            popoverVisible: visible,
        });
    };

    updateStatus = (status) => {
        console.log(`viewGame:updateStatus:${status}`);

        this.setState({ status });
    };

    updateCurrentRoundIndex = (currentRoundIndex) => {
        console.log(`viewGame:updateCurrentRoundIndex:${currentRoundIndex}`);
        this.setState({ currentRoundIndex });
    };

    render() {
        const roundItems = this.state.rounds.map((round, index) => {
            // console.log(`viewGame:render:status:${this.state.status} currentRoundIndex:${this.state.currentRoundIndex}`);
            let showPopover = false;
            switch (this.state.status) {
                case 'before':
                    showPopover = true;
                    break;
                case 'gaming':
                    if (index < this.state.currentRoundIndex) {
                        showPopover = false;
                    } else if (index >= this.state.currentRoundIndex) {
                        showPopover = true;
                    }
                    break;
                case 'after':
                    showPopover = false;
                    break;
                default:
                    break;
            }
            return (
                <Item align='top' key={round.level}
                    multipleLine
                    extra={
                        showPopover ?
                            <Popover
                                mask
                                overlayClassName="fortest"
                                overlayStyle={{ color: 'currentColor' }}
                                overlay={[
                                    (<Popover.Item key={`edit-${round.level}`} value={round} >编辑级别</Popover.Item>),
                                    (<Popover.Item key={`insert-${round.level}`} value={round} >添加级别</Popover.Item>),
                                    (<Popover.Item key={`delete-${round.level}`} value={round} >删除级别</Popover.Item>),
                                    (<Popover.Item key={`breakDuration-${round.level}`} value={round} >添加休息</Popover.Item>),
                                ]}
                                visible={this.state.popoverVisible}
                                align={{
                                    overflow: { adjustY: 0, adjustX: 0 },
                                    offset: [-10, 0],
                                }}
                                onVisibleChange={this.handleVisibleChange}
                                onSelect={this.onSelect}>
                                <Icon type="ellipsis" />
                            </Popover>
                            : null
                    }>
                    {`${round.level} ${round.smallBlind}/${round.bigBlind}$ ${round.duration}分钟`}
                    {round.breakDuration ? <Brief> {`休息时长:${round.breakDuration}`}</Brief> : null}
                </Item>
            );
        });

        const screens = this.props.devices
            && this.props.devices.map((device) => {
                let uuid = device.get('uuid');
                let selected = device.get('game') ? device.get('game').id === this.props.game.id : false;
                console.log(`viewGame:screens:uuid:${uuid} selected:${selected} `);
                return (
                    <div
                        key={uuid}
                        style={{
                            marginLeft: 9,
                            marginBottom: 9,
                        }}
                    >
                        <Tag
                            selected={selected}
                            onChange={(selected) => {
                                if (selected) {
                                    this.props.bindDeviceToGame(this.props.game, uuid);
                                } else {
                                    this.props.unbindDeviceToGame(this.props.game, device);
                                }
                            }}
                        >
                            {uuid}
                        </Tag>
                    </div>
                );
            });
        return (
            <div>
                <GameHeader
                    title={'比赛详情'}
                    opt={this.props.opt}
                    goBack={() => this.props.history.goBack()}
                />

                <WingBlank>
                    <WhiteSpace size='md' />
                    <Card>
                        <Card.Header
                            title={this.props.game && this.props.game.get('title')}
                        />
                        <Card.Body>
                            <div> {`开始时间:${this.props.game && formatShortDate(this.props.game.get('startTime'))}`}</div>
                            <div> {`起始筹码:${this.props.game && this.props.game.get('startChips')}$`}</div>
                        </Card.Body>
                    </Card>

                    <WhiteSpace size='md' />

                    <CountDown
                        game={this.props.game}
                        updateStatus={this.updateStatus}
                        updateCurrentRoundIndex={this.updateCurrentRoundIndex}
                        startImmediate={this.startImmediate}
                        pause={this.pause}
                        resume={this.resume}
                    />

                    <WhiteSpace size='md' />
                    <Card>
                        <Card.Header
                            title={'大屏幕'}
                        />
                        <Card.Body>
                            <div
                                style={{
                                    display: 'flex',
                                    paddingTop: 8,
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <Button
                                    size="small"
                                    type='ghost'
                                    style={{
                                        height: 24,
                                        marginLeft: 9,
                                        marginBottom: 9,
                                    }}
                                    onClick={() => this.setState({ screenVisible: true, screenOpt: '-' })}
                                >-</Button>
                                {screens}
                                <Button
                                    size="small"
                                    type='ghost'
                                    style={{
                                        height: 24,
                                        marginLeft: 9,
                                        marginBottom: 9,
                                    }}
                                    onClick={() => this.setState({ screenVisible: true, screenOpt: '+' })}
                                >+</Button>
                            </div>
                        </Card.Body>
                    </Card>

                    <WhiteSpace size='md' />
                    <Card>
                        <Card.Header title={'盲注详情'} />
                        <Card.Body>
                            {roundItems}
                            <Item align='middle'>
                                <Button
                                    size='small'
                                    type='ghost'
                                    inline
                                    onClick={this.addRound}
                                    disabled={this.props.saving}
                                >添加级别</Button>
                                <Button
                                    size='small'
                                    type='ghost'
                                    inline
                                    onClick={() => this.onSubmit()}
                                    disabled={this.props.saving}
                                >保存</Button>
                            </Item>
                        </Card.Body>
                    </Card>

                    <Modal
                        popup
                        visible={this.state.modalVisible}
                        closable={true}
                        maskClosable={true}
                        animationType='slide-up'
                        title='编辑盲注'
                        onClose={this.onModalClose('modalVisible')}
                    >
                        <EditPatternForm
                            round={this.state.selectedRound}
                            onSaveEdit={(round) => this.onSaveEdit(round)}
                            onModalClose={this.onModalClose('modalVisible')}
                        />
                    </Modal>


                    <Modal
                        popup
                        visible={this.state.screenVisible}
                        closable={true}
                        maskClosable={true}
                        animationType='slide-up'
                        onClose={this.onModalClose('screenVisible')}
                    >
                        <ScreenForm
                            game={this.props.game}
                            onBindDeviceToUser={(uuid) => this.onBindDeviceToUser(uuid)}
                            onUnbindDeviceToUser={(uuid) => this.onUnbindDeviceToUser(uuid)}
                            onModalClose={this.onModalClose('screenVisible')}
                            resetState={() => this.props.resetBindDeviceToUser()}
                            userbinding={this.props.userbinding}
                            userbinded={this.props.userbinded}
                            userbinderror={this.props.userbinderror}
                            userunbinding={this.props.userunbinding}
                            userunbinded={this.props.userunbinded}
                            userunbinderror={this.props.userunbinderror}
                            opt={this.state.screenOpt}
                        />
                    </Modal>
                </WingBlank>

            </div >
        );
    }
}



function mapStateToProps(state) {

    return {
        patterns: state.pattern.patterns,//用于picker选择
        opt: state.game.opt,//是否只读

        saving: state.game.saving,//正在保存
        saved: state.game.saved,//保存是否成功
        game: state.game.game,//保存成功后返回的game 有更新也通过这个字段返回

        deleted: state.game.deleted,//ViewGame中，当前game已经被其它用户删除

        error: state.game.error,

        userbinding: state.screen.userbinding,//正在设置大屏幕
        userbinded: state.screen.userbinded,//大屏幕设置成功
        userbinderror: state.screen.userbinderror,//

        
        userunbinding: state.screen.userunbinding,//正在设置大屏幕
        userunbinded: state.screen.userunbinded,//大屏幕设置成功
        userunbinderror: state.screen.userunbinderror,//

        devices: state.screen.devices,//绑定到当前用户的大屏幕列表
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateGame: bindActionCreators(updateGame, dispatch),
        subscribeGame: bindActionCreators(subscribeGame, dispatch),
        unsubscribeGame: bindActionCreators(unsubscribeGame, dispatch),

        bindDeviceToUser: bindActionCreators(bindDeviceToUser, dispatch),
        unbindDeviceToUser: bindActionCreators(unbindDeviceToUser, dispatch),
        resetBindDeviceToUser: bindActionCreators(resetBindDeviceToUser, dispatch),
        bindDeviceToGame: bindActionCreators(bindDeviceToGame, dispatch),
        unbindDeviceToGame: bindActionCreators(unbindDeviceToGame, dispatch),
        fetchUserDevices: bindActionCreators(fetchUserDevices, dispatch),
    }
}

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(ViewGame)
);