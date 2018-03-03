
import React from 'react';
import { List, InputItem, Button, Checkbox, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';

const Item = List.Item;
const AgreeItem = Checkbox.AgreeItem;

class EditPatternList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            noBreak: false,
        };
    }
    componentWillMount() {
        const { round } = this.props
        this.setState({ noBreak: round.breakDuration ? false : true })
    }


    validateField = (rule, value, callback) => {
        if (rule.field === 'ante') {
            if (value >= 0) {
                callback();
            } else {
                callback(new Error('前注是大于等于0的整数。'));
            }
        }
        if (rule.field === 'smallBlind') {
            if (value > 0) {
                callback();
            } else {
                callback(new Error('小盲是大于0的整数。'));
            }
        }
        if (rule.field === 'bigBlind') {
            if (value > 0) {
                let smallBlind = this.props.form.getFieldValue('smallBlind')
                if (value <= smallBlind)
                    callback(new Error('大盲不能小于等于小盲。'));
                else
                    callback();
            } else {
                callback(new Error('大盲是大于0的整数。'));
            }
        }
        if (rule.field === 'duration') {
            if (value > 0) {
                callback();
            } else {
                callback(new Error('时长是大于0的整数(分钟)。'));
            }
        }
        else if (rule.field === 'breakDuration') {
            console.log(`EditPatternList:validateField:1 rule.field:${rule.field}`)
            if (value > 0) {
                callback();
            } else {
                callback(new Error('休息时长是大于0的整数(分钟)。'));
            }
        }
        else {
            callback();
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields({ force: true }, (error, values) => {
            if (!error) {
                let round = { ...this.props.form.getFieldsValue() };
                console.log(`EditPatternList:onSubmit: round:${JSON.stringify(round)}`);
                this.props.onSaveEdit(round);
                this.props.onModalClose();
            } else {
                let errors = `${this.props.form.getFieldError('ante') ? this.props.form.getFieldError('ante').join('') : ''}
                ${this.props.form.getFieldError('smallBlind') ? this.props.form.getFieldError('smallBlind').join('') : ''}
                ${this.props.form.getFieldError('bigBlind') ? this.props.form.getFieldError('bigBlind').join('') : ''}
                ${this.props.form.getFieldError('duration') ? this.props.form.getFieldError('duration').join('') : ''}
                ${this.props.form.getFieldError('breakDuration') ? this.props.form.getFieldError('breakDuration').join('') : ''}`;
                Toast.fail(errors, 1, null, true);
            }
        });
    }

    onReset = () => {
        const { round } = this.props
        this.setState({ noBreak: round.breakDuration ? false : true })
        this.props.form.resetFields();
    }

    onChange = (e) => {
        console.log(e);
        this.setState({ noBreak: e.target.checked });
    }

    render() {
        const { round, form } = this.props
        const { getFieldProps, getFieldError, getFieldValue } = form;
        return (<form>
            <List
                renderHeader={() => round ? '编辑盲注' : '添加盲注'}
            >
                <InputItem {...getFieldProps('level', {
                    initialValue: round ? round.level : 1,
                }) }
                    editable={false}
                    extra='不能修改'
                >级别</InputItem>
                <InputItem
                    {...getFieldProps('ante', {
                        initialValue: round ? round.ante : 5,
                        name: 'ante',
                        rules: [
                            { required: true, message: '请输入前注' },
                            { validator: this.validateField },
                        ],
                        validateTrigger: 'onBlur',
                    }) }
                    extra='$'
                    clear
                    type='number'
                    placeholder="请输入前注"
                    error={!!getFieldError('ante')}
                    onErrorClick={() => {
                        Toast.fail(getFieldError('ante').join(','), 1);
                    }}
                >前注:</InputItem>
                <InputItem
                    {...getFieldProps('smallBlind', {
                        initialValue: round ? round.smallBlind : 5,
                        validateFirst: true,
                        name: 'smallBlind',
                        rules: [
                            { required: true, message: '请输入小盲' },
                            { validator: this.validateField },
                        ],
                        validateTrigger: 'onBlur',
                    }) }
                    extra='$'
                    clear
                    type='number'
                    placeholder="请输入小盲"
                    error={!!getFieldError('smallBlind')}
                    onErrorClick={() => {
                        Toast.fail(getFieldError('smallBlind').join(','), 1);
                    }}
                >小盲:</InputItem>

                <InputItem
                    {...getFieldProps('bigBlind', {
                        initialValue: round ? round.bigBlind : 5,
                        name: 'bigBlind',
                        rules: [
                            { required: true, message: '请输入大盲' },
                            { validator: this.validateField },
                        ],
                        validateTrigger: 'onBlur',
                    }) }
                    extra='$'
                    clear
                    type='number'
                    placeholder="请输入大盲"
                    error={!!getFieldError('bigBlind')}
                    onErrorClick={() => {
                        Toast.fail(getFieldError('bigBlind').join(','), 1);
                    }}
                >大盲:</InputItem>


                <InputItem
                    {...getFieldProps('duration', {
                        initialValue: round ? round.duration : 5,
                        name: 'duration',
                        rules: [
                            { required: true, message: '请输入时长' },
                            { validator: this.validateField },
                        ],
                        validateTrigger: 'onBlur',
                    }) }
                    extra='分钟'
                    clear
                    type='number'
                    placeholder="请输入时长"
                    error={!!getFieldError('duration')}
                    onErrorClick={() => {
                        Toast.fail(getFieldError('duration').join(','), 1);
                    }}
                >时长:</InputItem>

                {this.state.noBreak ? null :
                    <InputItem
                        {...getFieldProps('breakDuration', {
                            name: 'breakDuration',
                            initialValue: round ? round.breakDuration : '',
                            rules: [
                                { required: true, message: '请输入休息时长' },
                                { validator: this.validateField },
                            ],
                            hidden: true,
                            validateTrigger: 'onBlur',
                        }) }
                        extra='分钟'
                        clear
                        type='number'
                        placeholder="请输入休息时长"
                        error={!!getFieldError('breakDuration')}
                        onErrorClick={() => {
                            Toast.fail(getFieldError('breakDuration').join(','), 1);
                        }}
                    >休息时长:</InputItem>
                }

                <AgreeItem checked={this.state.noBreak} onChange={(e) => this.onChange(e)}>
                    不设置休息时长
                </AgreeItem >

                <Item>
                    <Button type="primary" size="normal" inline onClick={this.onSubmit}>确定修改</Button>
                    <Button size="normal" inline style={{ marginLeft: '2.5px' }} onClick={this.onReset}>重置</Button>
                </Item>
            </List>
        </form >);
    }
}
const EditPatternForm = createForm()(EditPatternList);
export default EditPatternForm;