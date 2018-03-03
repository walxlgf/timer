
import React from 'react';
import ReactDOM from 'react-dom';
import { GamesHeader } from '../components/gamesHeader';
import { ListView, Stepper, WingBlank, NoticeBar, Popover, Icon, Card } from 'antd-mobile';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router';
import { logout } from "../actions/auth";
import { setGame, fetchGames, deleteGame } from "../actions/game";


import { formatShortDate } from '../utils';


// let startIndex = 0;
const PAGE_SIZE = 5;
const dataSource = new ListView.DataSource({
    rowHasChanged: (row1, row2) => {
        console.log(`games:rowHasChanged:row1:${JSON.stringify(row1)} row1:${JSON.stringify(row2)}`)
        row1.get('title') !== row2.get('title') || row1 !== row2
    }
});

class Games extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dataSource,
            popoverVisible: false,
        };
    }

    componentDidMount() {
        console.log(`games:componentDidMount:`);
        //获取第一页
        if (this.props.games.length == 0) {
            this.props.fetchGames(this.props.startIndex, PAGE_SIZE);
        } else {
            this.setState({
                dataSource: dataSource.cloneWithRows(this.props.games),
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        console.log(`games:componentWillReceiveProps:`);
        if (!nextProps.fetching) {
            this.setState({
                dataSource: dataSource.cloneWithRows(nextProps.games),
            });
        }

    }

    componentWillUnmount() {
    }

    onEndReached = (event) => {
        //获取下一页数据
        if (this.props.fetching || !this.props.hasmore) {
            return;
        }
        console.log(`games:onEndReached:startIndex:${JSON.stringify(this.props.startIndex)}`);
        this.props.fetchGames(this.props.startIndex, PAGE_SIZE);
    }

    onSelect = (opt) => {
        if (opt.key.startsWith('edit')) {
            //先将选中的pattern设置到state.pattern.pattern中 
            let pattern = opt.props.value;
            this.props.setGame(pattern, 'edit');
            //然后跳转到编辑界面
            this.props.history.push('/editGame');
        } else if (opt.key.startsWith('delete')) {
            let pattern = opt.props.value;
            console.log(`patterns:onSelect:delete:title:${pattern.get('title')} id:${pattern.id}`);
            this.props.deleteGame(pattern);
        }

        this.setState({
            popoverVisible: false,
        });
    };
    render() {
        const separator = (sectionID, rowID) => (
            <div
                key={`${sectionID}-${rowID}`}
                style={{
                    backgroundColor: '#F5F5F9',
                    height: 8,
                    borderTop: '1px solid #ECECED',
                    borderBottom: '1px solid #ECECED',
                }}
            />
        );
        const row = (rowData, sectionID, rowID) => {
            let game = rowData;

            const onClick = () => {

                console.log(`games:row:onClick:${game.get('title')} rounds:${game.get('rounds').length} `);
                //设置pattern 和只读
                this.props.setGame(game, 'view');
                //然后跳转到编辑界面
                this.props.history.push('/viewGame');
            };
            return (
                <Card>
                    <Card.Header
                        title={<div onClick={onClick}>{game.get('title')}</div>}
                        extra={
                            <Popover mask
                                style={{
                                    width: '10%',
                                    color: '#888',
                                    fontSize: 18,
                                }}
                                overlayClassName="fortest"
                                overlayStyle={{ color: 'currentColor' }}
                                overlay={[
                                    (<Popover.Item key={`edit-${game.id}`} value={game} >编辑比赛</Popover.Item>),
                                    (<Popover.Item key={`delete-${game.id}`} value={game} >删除比赛</Popover.Item>),
                                ]}
                                visible={this.state.popoverVisible}
                                align={{
                                    overflow: { adjustY: 0, adjustX: 0 },
                                    offset: [-10, 0],
                                }}
                                onSelect={this.onSelect}>
                                <Icon type="ellipsis" />
                            </Popover>}
                    />
                    <Card.Body
                        onClick={onClick}>
                        {/* <div>This is content of `Card`</div> */}
                        <div> {`开始时间:${formatShortDate(game.get('startTime'))}`}</div>
                        <div> {`起始筹码:${game.get('startChips')}$`}</div>
                    </Card.Body>
                    <Card.Footer
                        onClick={onClick}
                        content="footer content"
                        extra={<div>extra footer content</div>} />
                </Card>
            );
        };

        return (
            <div>
                <GamesHeader
                    logout={() => { this.props.logout() }}
                    pushPatterns={() => this.props.history.push('/patterns')}
                    pushGame={() => {
                        this.props.setGame(null, 'add');
                        this.props.history.push('/editGame');
                    }}
                />
                <WingBlank>
                    {this.props.error &&
                        <NoticeBar mode="closable" icon={null}>{this.props.error.message}</NoticeBar>}
                    <ListView
                        ref={el => this.lv = el}
                        dataSource={this.state.dataSource}
                        renderHeader={() => <span>比赛列表</span>}
                        renderFooter={() => (<div style={{ padding: 30, textAlign: 'center' }}>
                            {this.props.fetching ? 'Loading...' : 'Loaded'}
                        </div>)}
                        renderRow={row}
                        renderSeparator={separator}
                        className="am-list"
                        pageSize={PAGE_SIZE}
                        useBodyScroll
                        onScroll={() => { console.log('scroll'); }}
                        scrollRenderAheadDistance={500}
                        onEndReached={this.onEndReached}
                        onEndReachedThreshold={200}
                    />
                </WingBlank>
            </div>
        );
    }
}



function mapStateToProps(state) {
    return {
        //获取
        fetching: state.game.fetching,
        hasmore: state.game.hasmore,
        games: state.game.games,
        startIndex: state.game.startIndex,
        //删除
        deleting: state.game.deleting,
        error: state.game.error,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        logout: bindActionCreators(logout, dispatch),
        setGame: bindActionCreators(setGame, dispatch),
        fetchGames: bindActionCreators(fetchGames, dispatch),
        deleteGame: bindActionCreators(deleteGame, dispatch),
    }
}

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps)(Games)
);