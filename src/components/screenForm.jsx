
import React from 'react';
import { List, InputItem, Button, Checkbox, Toast, NoticeBar } from 'antd-mobile';
import { createForm } from 'rc-form';

const Item = List.Item;
const AgreeItem = Checkbox.AgreeItem;

class Screen extends React.Component {
    constructor(props) {
        super(props);

    }
    componentWillMount() {
    }

    componentDidMount() {
        this.props.resetState();
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.userbinded || nextProps.userunbinded) {
            this.props.onModalClose();
        }
    }

    validateField = (rule, value, callback) => {
        if (rule.field === 'screenUuid') {
            if (value.length !== 4) {
                callback(new Error('请输入4位UUID。'));
            } else {
                callback();
            }
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields({ force: true }, (error, values) => {
            if (!error) {
                if (this.props.opt === '-') {
                    let uuid = this.props.form.getFieldValue('screenUuid');
                    this.props.onUnbindDeviceToUser(uuid);
                } else if (this.props.opt === '+') {
                    let uuid = this.props.form.getFieldValue('screenUuid');
                    this.props.onBindDeviceToUser(uuid);
                }
            } else {
                let errors = `${this.props.form.getFieldError('screenUuid') ? this.props.form.getFieldError('screenUuid').join('') : ''}`;
                Toast.fail(errors, 1, null, true);
            }
        });
    }


    render() {
        const { getFieldProps, getFieldError, getFieldValue } = this.props.form;
        return (<form>
            <List renderHeader={() => this.props.opt === '+' ? '绑定大屏幕' : '大屏幕取绑'}>
                <InputItem
                    {...getFieldProps('screenUuid', {
                        rules: [
                            { required: true, message: '请输入UUID。' },
                            { validator: this.validateField },
                        ],
                        validateTrigger: 'onBlur',
                    }) }
                    clear
                    type='number'
                    placeholder="请输入UUID"
                    error={!!getFieldError('ante')}
                    onErrorClick={() => {
                        Toast.fail(getFieldError('ante').join(','), 1);
                    }}
                    editable={!this.props.userbinding}
                >大屏幕:</InputItem>
                {(this.props.userbinderror || this.props.userunbinderror) &&
                    <NoticeBar mode="closable" icon={null}>{this.props.userbinderror || this.props.userunbinderror}</NoticeBar>}
                <Item>
                    <Button
                        type="primary"
                        size="small"
                        disabled={this.props.opt === '-' ? this.props.userunbinding : this.props.userbinding}
                        onClick={this.onSubmit}>确定</Button>
                </Item>
            </List>
        </form >);
    }
};
export default createForm()(Screen);