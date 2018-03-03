import React from 'react';
import { Button, Popover, Icon, WingBlank, Modal, InputItem, Toast } from 'antd-mobile';
import { List } from 'antd-mobile';
import { createForm, createFormField } from 'rc-form';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router';
import { save, updatePattern } from "../actions/pattern";
import { EditPatternHeader } from '../components/editPatternHeader';
import EditPatternForm from '../components/editPatternForm';

const Item = List.Item;
const Brief = Item.Brief;

class EditPatternList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            popoverVisible: false,
            modalVisible: false,
            selectedRound: null,
        };
    }

    componentWillMount() {

    }
    componentWillReceiveProps(nextProps) {
        //保存成功直接返回
        if (nextProps.saved) {
            this.props.history.goBack();
        }
    }


    validateField = (rule, value, callback) => {

        if (rule.field === 'title') {
            if (value) {
                callback();
            } else {
                callback(new Error('标题不能为空。'));
            }
        }
        else if (rule.field === 'rounds') {
            console.log(`EditPatternList:validateAnte:1 rule.field:${rule.field}`)
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
            console.log(`editPattern:onSelect:edit:${JSON.stringify(opt.key)}`);
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
        console.log(`editPattern：onSelect：this.state:${JSON.stringify(this.state)}`)
    };

    onModalClose = key => () => {
        console.log(`editPattern：onModalClose:${key}`)
        this.setState({
            [key]: false,
        });
    }

    onReset = () => {
        this.props.form.resetFields();
    }

    onSubmit = (e) => {
        e.preventDefault();
        let { form } = this.props;
        form.validateFields({ force: true }, (error, values) => {
            if (!error) {
                //如果this.props.pattern 为空，说明的新增
                console.log(`editPattern:save:pattern:${this.props.pattern}`);
                if (this.props.pattern === null) {
                    console.log(`editPattern:save:pattern1:${this.props.pattern}`);
                    let pattern = { ...form.getFieldsValue() };
                    this.props.save(pattern);
                } else {
                    let pattern = this.props.pattern;
                    console.log(`editPattern:save:pattern2:${this.props.pattern}`);
                    pattern.set('title', form.getFieldValue('title'))
                    pattern.set('rounds', form.getFieldValue('rounds'))
                    this.props.updatePattern(pattern);
                }
            } else {
                let errors = `${form.getFieldError('title') ? form.getFieldError('title').join('') + '\n' : ''}
                ${form.getFieldError('rounds') ? form.getFieldError('rounds').join('') + '\n' : ''}`;
                Toast.fail(errors, 2, null, true);
            }
        });
    }


    render() {
        const { getFieldProps, getFieldValue, getFieldError } = this.props.form;
        getFieldProps('rounds', {
            initialValue: [],
            rules: [
                { required: true, message: '请添加级别。' },
                { validator: this.validateField },
            ],
        });

        const roundItems = getFieldValue('rounds').map((round) => {
            return (
                <Item align='top' key={round.level}
                    multipleLine
                    extra={!this.props.readonly &&
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
                    {`级别${round.level}`}<Brief >{`盲注:${round.smallBlind}/${round.bigBlind}$`}</Brief>
                    <Brief>{`时长:${round.duration}分钟`}</Brief>
                    {round.breakDuration ? <Brief> {`休息时长:${round.breakDuration}`}</Brief> : null}
                </Item>
            );
        });
        return (
            <div>
                <EditPatternHeader
                    title={this.props.readonly ? '盲注模板详情' : this.props.pattern ? '编辑盲注模板' : '新建盲注模板'}
                    goBack={() => this.props.history.goBack()}
                />
                <WingBlank>
                    <List renderHeader={() => { this.props.readonly && '请输入模板内容' }} className="my-list">
                        <InputItem
                            {...getFieldProps('title', {
                                name: 'title',
                                // initialValue: title,
                                rules: [
                                    { required: true, message: '请输入标题' },
                                    { validator: this.validateField },
                                ],
                                validateTrigger: 'onBlur',
                            }) }
                            clear
                            placeholder="请输入标题"
                            error={!!getFieldError('title')}
                            onErrorClick={() => {
                                Toast.fail(getFieldError('title').join(','));
                            }}
                        >名称:</InputItem>
                        {roundItems}
                        {!this.props.readonly &&
                            <Item align='middle'>
                                <Button
                                    size="normal"
                                    inline
                                    onClick={this.addRound}
                                    disabled={this.props.saving}
                                >添加级别</Button>
                                <Button
                                    size="normal"
                                    inline
                                    style={{ marginLeft: '5px' }}
                                    onClick={this.onReset}
                                    disabled={this.props.saving}
                                >重置</Button>
                                <Button
                                    size="normal"
                                    inline
                                    type="primary"
                                    style={{ marginLeft: '5px' }}
                                    disabled={this.props.saving}
                                    loading={this.props.logining}
                                    onClick={this.onSubmit} >保存</Button>
                            </Item>}
                    </List>
                    {!this.props.readonly &&
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

            </div>
        );
    }
}



function mapStateToProps(state) {
    let pattern = state.pattern;
    return {
        readonly: state.pattern.readonly,//是否只读
        saving: state.pattern.saving,//正在保存
        saved: state.pattern.saved,//保存是否成功
        pattern: state.pattern.pattern,//保存成功后返回的Pattern
        error: state.pattern.error
    };
}

function mapDispatchToProps(dispatch) {
    return {
        save: bindActionCreators(save, dispatch),
        updatePattern: bindActionCreators(updatePattern, dispatch),
    }
}

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(createForm({
        mapPropsToFields(props) {
            console.log('mapPropsToFields:props:', props);
            let pattern = props.pattern;
            let title = '';
            let rounds = [];
            if (pattern) {
                //如果有title说不是pasr对象 直接获取
                title = pattern.get('title');
                rounds = pattern.get('rounds');
            }
            return {
                title: createFormField({ value: title }),
                rounds: createFormField({ value: rounds })
            }
        },
        onFieldsChange(props, fields) {
            console.log('editPattern：onFieldsChange', fields);
        },
    })(EditPatternList))
);