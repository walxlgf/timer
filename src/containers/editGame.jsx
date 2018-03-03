import React from 'react';
import { Button, Popover, Icon, WingBlank, Modal, InputItem, Toast, Picker, DatePicker } from 'antd-mobile';
import { List } from 'antd-mobile';
import { createForm, createFormField } from 'rc-form';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router';
import { save, updateGame, setPickedPattern } from "../actions/game";
import { fetchPatterns } from "../actions/pattern";
import { GameHeader } from '../components/gameHeader';
import EditPatternForm from '../components/editPatternForm';
import { lchmod } from 'fs';

const Item = List.Item;
const Brief = Item.Brief;

class GameList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            popoverVisible: false,
            modalVisible: false,
            selectedRound: null,
        };
    }

    componentWillMount() {
        console.log(`game:componentWillMount`);
    }

    componentDidMount() {
        console.log(`game:componentDidMount`);
        //先获取盲注结构列表 pageSize设置大一些 不分页
        this.props.fetchPatterns(0, 100000);
    }

    componentWillReceiveProps(nextProps) {
        console.log(`game:componentWillReceiveProps`);
        //如果当前对象已经之删除 直接返回
        if (nextProps.deleted) {
            this.props.history.goBack();
        }
        //保存成功直接返回
        if (nextProps.saved) {
            this.props.history.goBack();
        }
    }

    componentWillUnmount() {
        console.log(`game:componentWillUnmount`);
    }

    validateField = (rule, value, callback) => {

        if (rule.field === 'startTime') {
            if (value) {
                callback();
            } else {
                callback(new Error('请选择开始时间。'));
            }
        } else if (rule.field === 'rounds') {
            if (value.length > 0) {
                callback();
            } else {
                callback(new Error('尚未添加级别。'));
            }
        }
        else {
            callback();
        }
    }

    addRound = () => {
        const { form } = this.props;
        let rounds = form.getFieldValue('rounds');
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

        form.setFieldsValue({
            rounds,
        });
    }

    //把编辑过后的round保存到form中
    onSaveEdit = (roundFromEdit) => {
        let { form } = this.props;
        let rounds = form.getFieldValue('rounds');

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
        form.setFieldsValue({
            rounds: roundsData,
        });
    }

    onSelect = (opt) => {
        const { form } = this.props;
        let selectedRound = opt.props.value;
        let rounds = form.getFieldValue('rounds');
        let selectedIndex = rounds.indexOf(selectedRound);

        if (opt.key.startsWith('edit')) {
            console.log(`game:onSelect:edit:${JSON.stringify(opt.key)}`);
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
            form.setFieldsValue({
                rounds: roundsData,
            });
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
            form.setFieldsValue({
                rounds: roundsData,
            });
        } else if (opt.key.startsWith('breakDuration')) {
            selectedRound.breakDuration = 30;
        }
        /*     this.setState({
                popoverVisible: false,
            }); */

        this.setState({
            popoverVisible: false,
            selectedRound: opt.props.value,
        });
        console.log(`game：onSelect：this.state:${JSON.stringify(this.state)}`)
    };

    onModalClose = key => () => {
        console.log(`game：onModalClose:${key}`)
        this.setState({
            [key]: false,
        });
    }


    onSubmit = () => {
        let { form } = this.props;
        form.validateFields({ force: true }, (error, values) => {
            if (!error) {
                //如果this.props.game 为空，说明的新增
                console.log(`game:save:game:${this.props.game}`);
                if (this.props.game === null) {
                    console.log(`game:save:game1:${this.props.game}`);
                    let game = { ...form.getFieldsValue() };
                    this.props.save(game);
                } else {
                    let game = this.props.game;
                    console.log(`game:save:game2:${this.props.game}`);
                    game.set('title', form.getFieldValue('title'))
                    game.set('rounds', form.getFieldValue('rounds'))
                    this.props.updateGame(game);
                }
            } else {
                let errors = `${form.getFieldError('title') ? form.getFieldError('title').join('') + '\n' : ''}
                ${form.getFieldError('rounds') ? form.getFieldError('rounds').join('') + '\n' : ''}`;
                Toast.fail(errors, 2, null, true);
            }
        });
    }


    render() {
        const { getFieldProps, getFieldValue, getFieldError, setFieldsValue } = this.props.form;
        const nowTimeStamp = Date.now();
        const now = new Date(nowTimeStamp);
        getFieldProps('rounds', {
            initialValue: [],
            rules: [
                { required: true, message: '请添加级别。' },
                { validator: this.validateField },
            ],
        });

        let pickerPatterns = [];
        for (let obj of this.props.patterns) {
            let pattern = { value: obj.id, label: obj.get('title') }
            pickerPatterns.push(pattern);
        }

        let title = '';
        let header = '';
        switch (this.props.opt) {
            case 'add':
                title = '新建比赛'
                header = '请输入比赛信息'
                break;
            case 'edit':
                title = '编辑比赛'
                header = '请编辑比赛信息'
                break;
        }

        const roundItems = getFieldValue('rounds').map((round) => {
            return (
                <Item align='top' key={round.level}
                    multipleLine
                    extra={this.props.opt == 'edit' &&
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
                            onSelect={this.onSelect}>
                            <Icon type="ellipsis" />
                        </Popover>
                    }>
                    {`${round.level} ${round.smallBlind}/${round.bigBlind}$ ${round.duration}分钟`}
                    {round.breakDuration ? <Brief> {`休息时长:${round.breakDuration}`}</Brief> : null}
                </Item>
            );
        });
        return (
            <div>
                <GameHeader
                    title={title}
                    opt={this.props.opt}
                    save={() => this.onSubmit()}
                    goBack={() => this.props.history.goBack()}

                />
                <WingBlank>
                    <List
                        renderHeader={() => header}
                        className="my-list">
                        <InputItem
                            {...getFieldProps('title', {
                                name: 'title',
                                // initialValue: title,
                                rules: [
                                    { required: true, message: '请输入名称' },
                                ],
                                validateTrigger: 'onBlur',
                            }) }
                            clear
                            placeholder="请输入名称"
                            error={!!getFieldError('title')}
                            onErrorClick={() => {
                                Toast.fail(getFieldError('title').join(','));
                            }}
                        >名称:</InputItem>
                        <InputItem
                            {...getFieldProps('startChips', {
                                name: 'startChips',
                                // initialValue: title,
                                rules: [
                                    { required: true, message: '请输入起始筹码' },
                                    { validator: this.validateField },
                                ],
                                validateTrigger: 'onBlur',
                            }) }
                            clear
                            type='number'
                            placeholder="请输入起始筹码"
                            error={!!getFieldError('startChips')}
                            onErrorClick={() => {
                                Toast.fail(getFieldError('startChips').join(','));
                            }}
                        >起始筹码:</InputItem>

                        <DatePicker
                            {...getFieldProps('startTime', {
                                initialValue: now,
                                rules: [
                                    { required: true, message: '请输入起始时间' },
                                    { validator: this.validateField },
                                ],
                            }) }
                            error={!!getFieldError('startTime')}
                        >
                            <List.Item arrow="horizontal">开始时间：</List.Item>
                        </DatePicker>

                        {this.props.opt == 'add' && this.props.patterns.length > 0 &&
                            <Picker
                                data={pickerPatterns}
                                title="选择盲注结构:"
                                value={this.state.pickerValue}
                                onChange={v => {
                                    this.setState({ pickerValue: v })
                                }}
                                onOk={v => {
                                    let pickedPattern;
                                    if (this.props.patterns.length > 0) {
                                        pickedPattern = this.props.patterns.find(function (value, index, arr) {
                                            return value.id == v;
                                        });
                                    }
                                    if (pickedPattern)
                                        setFieldsValue({ rounds: pickedPattern.get('rounds') })
                                }}
                            >
                                <List.Item arrow="horizontal">选择盲注结构:</List.Item>
                            </Picker>
                        }

                    </List>
                    <List
                        renderHeader={() => '盲注详情'}
                        className="my-list">
                        {roundItems}
                        {this.props.opt == 'edit' &&
                            <Item align='middle'>
                                <Button
                                    size="normal"
                                    inline
                                    onClick={this.addRound}
                                    disabled={this.props.saving}
                                >添加级别</Button>
                            </Item>}
                    </List>

                    {this.props.opt == 'edit' &&
                        <Modal
                            popup
                            visible={this.state.modalVisible}
                            closable={true}
                            maskClosable={true}
                            animationType="slide-up"
                            title='编辑盲注'
                            onClose={this.onModalClose('modalVisible')}
                        >
                            <EditPatternForm
                                round={this.state.selectedRound}
                                onSaveEdit={(round) => this.onSaveEdit(round)}
                                onModalClose={this.onModalClose('modalVisible')}
                            />
                        </Modal>}
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

        deleted: state.game.deleted,

        error: state.game.error,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        save: bindActionCreators(save, dispatch),
        updateGame: bindActionCreators(updateGame, dispatch),
        fetchPatterns: bindActionCreators(fetchPatterns, dispatch),
    }
}

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(createForm({
        mapPropsToFields(props) {
            console.log('mapPropsToFields:props:', props);
            let game = props.game;
            let title;
            let startChips;
            let startTime;
            let rounds = [];
            if (game) {
                title = game.get('title');
                startChips = game.get('startChips');
                startTime = game.get('startTime');
                rounds = game.get('rounds');
            }
            return {
                title: createFormField({ value: title }),
                startChips: createFormField({ value: startChips }),
                startTime: createFormField({ value: startTime }),
                rounds: createFormField({ value: rounds })
            }
        }
    })(GameList))
);