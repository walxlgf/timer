
import React from 'react';
import { List, InputItem, Stepper, Range, Button, Toast, NoticeBar, WingBlank } from 'antd-mobile';
import { createForm } from 'rc-form';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { signUp } from "../actions/auth";
import PropTypes from 'prop-types'
import { withRouter } from 'react-router';

const Item = List.Item;

class SignUpList extends React.Component {

    state = {
        logining: false,
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isAuthenticated) {
            this.props.history.replace('/games')
        }
    }

    onSubmit = () => {
        this.props.form.validateFields({ force: true }, (error) => {
            if (!error) {
                let user = { ...this.props.form.getFieldsValue() };
                console.log(`SignUpList:signup:user:${JSON.stringify(user)}`);
                this.props.signUp(user);
            } else {
                let errors = `${this.props.form.getFieldError('username') ? this.props.form.getFieldError('username').join('') : ''}
                ${this.props.form.getFieldError('password') ? this.props.form.getFieldError('password').join('') : ''}`;
                Toast.fail(errors, 1, null, true);
            }
        });
    }


    render() {
        const { getFieldProps, getFieldError } = this.props.form;
        const logiType = this.props.logining ? 'disabled' : 'primary';
        return (
            <WingBlank>
                <List
                    renderHeader={() => 'Form Validation'}
                    renderFooter={() => getFieldError('account') && getFieldError('account').join(',')}
                >
                    <InputItem
                        {...getFieldProps('username', {
                            rules: [
                                { required: true, message: '请输入用户名。' },
                            ],
                        }) }
                        clear
                        placeholder="请输入用户名"
                        error={!!getFieldError('username')}
                        onErrorClick={() => {
                            Toast.fail(getFieldError('username').join(''), 1);
                        }}
                    >用户名：
                    </InputItem>
                    <InputItem
                        {...getFieldProps('password', {
                            rules: [
                                { required: true, message: '请输入密码。' },
                            ],
                        }) }
                        type='password'
                        clear
                        placeholder="请输入密码"
                        error={!!getFieldError('password')}
                        onErrorClick={() => {
                            Toast.fail(getFieldError('password').join(''), 1);
                        }}
                    > 密码:
                    </InputItem>
                    {this.props.error &&
                        <NoticeBar mode="closable" icon={null}>{this.props.error.message}</NoticeBar>}
                    <Item>
                        <Button type="primary"
                            size="normal"
                            loading={this.props.signuping}
                            onClick={this.onSubmit}
                        >注册</Button>
                    </Item>
                </List>
            </WingBlank>);
    }
}




function mapStateToProps(state) {
    return {
        isAuthenticated: state.auth.isAuthenticated,
        signuping: state.auth.signuping,
        user: state.auth.user,
        error: state.auth.error
    };
}

function mapDispatchToProps(dispatch) {
    return {
        signUp: bindActionCreators(signUp, dispatch),
    }
}

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps)(createForm()(SignUpList))
);
