/* eslint no-dupe-keys: 0 */
import React from 'react';
import ReactDOM from 'react-dom';
import { PatternsHeader } from '../components/patternsHeader';
import { ListView, WingBlank, WhiteSpace, NoticeBar, Popover, Icon } from 'antd-mobile';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router';
import { fetchPatterns, deletePattern, setPattern } from '../actions/pattern';

const PAGE_SIZE = 8;
let startIndex = 0;
const dataSource = new ListView.DataSource({
    rowHasChanged: (row1, row2) => row1 !== row2,
});

class Patterns extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource,
            popoverVisible: false,
        };
    }

    componentWillMount() {
        console.log(`patterns:componentWillMount:`);
    }

    shouldComponentUpdate(nextProps, nextState) {
        console.log(`patterns:shouldComponentUpdate:`);
        return true;
    }

    componentWillUpdate(nextProps, nextState) {
        console.log(`patterns:componentWillUpdate:`);
    }

    componentDidUpdate(prevProps, prevState) {
        console.log(`patterns:componentDidUpdate:`);
    }
    componentWillUnmount() {
        console.log(`patterns:componentWillUnmount:`);
    }

    componentDidMount() {
        console.log(`patterns:componentDidMount:`);
        //获取第一页
        startIndex = 0;
        this.props.fetchPatterns(startIndex, PAGE_SIZE);
    }

    componentWillReceiveProps(nextProps) {
        console.log(`patterns:componentWillReceiveProps:`);
        //处理按页获取数据
        if (!nextProps.fetching && nextProps.patterns.length > 0) {
            console.log(`patterns:fetched:`);
            //获得下一页的开始索引
            startIndex += PAGE_SIZE;
            if (this.patterns === undefined) {
                this.patterns = [];
            }
            this.patterns = [...this.patterns, ...nextProps.patterns];

            this.setState({
                dataSource: dataSource.cloneWithRows(this.patterns),
            });
        }

        //处理删除 删除成功 deletedPattern 不为空
        if (!nextProps.deleting && nextProps.deletedPattern) {
            let index = this.patterns.findIndex(function (value, index, arr) {
                return value.id === nextProps.deletedPattern.id;
            });
            if (index !== -1) {
                this.patterns.splice(index, 1);
                //删除掉一个了 将下一页开始索引减一 防止漏数据
                startIndex--;
                this.setState({
                    dataSource: dataSource.cloneWithRows(this.patterns),
                });
            }
        }
    }

    onEndReached = (event) => {
        //获取下一页数据
        if (this.props.fetching || !this.props.hasmore) {
            return;
        }
        console.log(`patterns:onEndReached:startIndex:${JSON.stringify(startIndex)}`);
        this.props.fetchPatterns(startIndex, PAGE_SIZE);
    }


    onSelect = (opt) => {
        if (opt.key.startsWith('edit')) {
            //先将选中的pattern设置到state.pattern.pattern中 
            let pattern = opt.props.value;
            this.props.setPattern(pattern, false);
            //然后跳转到编辑界面
            this.props.history.push('/editPattern');
        } else if (opt.key.startsWith('delete')) {
            let pattern = opt.props.value;
            console.log(`patterns:onSelect:delete:title:${pattern.get('title')} id:${pattern.id}`);
            this.props.deletePattern(pattern);
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
            // console.log(`rowData:${JSON.stringify(rowData.get('title'))} sectionID:${sectionID} rowID:${rowID} `);
            const pattern = rowData;
            return (
                <div key={rowID}
                    style={{ padding: '0 15px', display: 'flex' }}
                >
                    <div
                        style={{
                            width: '90%',
                            lineHeight: '50px',
                            color: '#888',
                            fontSize: 18,
                            borderBottom: '1px solid #F6F6F6',
                        }}

                        onClick={() => {
                            //设置pattern 和只读
                            this.props.setPattern(pattern, true);
                            //然后跳转到编辑界面
                            this.props.history.push('/editPattern');
                        }}
                    >{pattern.get('title')}</div>
                    <Popover mask
                        style={{
                            width: '10%',
                            color: '#888',
                            fontSize: 18,
                        }}
                        overlayClassName="fortest"
                        overlayStyle={{ color: 'currentColor' }}
                        overlay={[
                            (<Popover.Item key={`edit-${pattern.id}`} value={pattern} >编辑模板</Popover.Item>),
                            (<Popover.Item key={`delete-${pattern.id}`} value={pattern} >删除模板</Popover.Item>),
                        ]}
                        visible={this.state.popoverVisible}
                        align={{
                            overflow: { adjustY: 0, adjustX: 0 },
                            offset: [-10, 0],
                        }}
                        onSelect={this.onSelect}>
                        <Icon type="ellipsis" />
                    </Popover>
                </div>
            );
        };

        return (<div>
            <PatternsHeader
                title='盲注模板'
                goBack={() => this.props.history.goBack()}
                pushEditPattern={() => {
                    this.props.setPattern(null, false);
                    this.props.history.push('/editPattern')
                }}
            />
            <WingBlank>
                {this.props.error &&
                    <NoticeBar mode="closable" icon={null}>{this.props.error.message}</NoticeBar>}
                <ListView
                    ref={el => this.lv = el}
                    dataSource={this.state.dataSource}
                    renderHeader={() => <span>盲注模板列表</span>}
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
        fetching: state.pattern.fetching,
        hasmore: state.pattern.hasmore,
        patterns: state.pattern.patterns,

        //删除
        deleting: state.pattern.deleting,
        deletedPattern: state.pattern.deletedPattern,

        //
        error: state.pattern.error,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        fetchPatterns: bindActionCreators(fetchPatterns, dispatch),
        deletePattern: bindActionCreators(deletePattern, dispatch),
        setPattern: bindActionCreators(setPattern, dispatch),
    }
}

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps)(Patterns)
);