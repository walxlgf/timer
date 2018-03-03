
import React from 'react';
import { List, InputItem, Stepper, Range, Button, Toast, NoticeBar, WingBlank } from 'antd-mobile';
import { createForm } from 'rc-form';

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { login, signUp } from "../actions/auth";
import { withRouter } from 'react-router';

const Item = List.Item;

class LoginList extends React.Component {

    state = {
        logining: false,
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isAuthenticated) {
            this.props.history.replace('/games')
        }
    }

    componentDidMount() {
    }

    onSubmit = () => {
        this.props.form.validateFields({ force: true }, (error) => {
            if (!error) {
                let user = { ...this.props.form.getFieldsValue() };
                console.log(`LoginList:login:user:${this.props.form.getFieldsValue()}`);
                this.props.login(user);
            } else {
                let errors = `${this.props.form.getFieldError('username') ? this.props.form.getFieldError('username').join('') : ''}
                ${this.props.form.getFieldError('password') ? this.props.form.getFieldError('password').join('') : ''}`;
                Toast.fail(errors, 1, null, true);
            }
        });
    }

    signUp = () => {
        this.props.history.replace('/signup')
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
                    >用户名：</InputItem>

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
                    > 密码:</InputItem>
                    {this.props.error &&
                        <NoticeBar mode="closable" icon={null}>{this.props.error.message}</NoticeBar>}
                    <Item>
                        <Button type="primary"
                            size="normal"
                            loading={this.props.logining}
                            disabled={this.props.logining}
                            onClick={this.onSubmit}
                        >登录</Button>
                        <Button size="normal"
                            style={{ marginLeft: '2.5px' }}
                            onClick={this.signUp}
                            disabled={this.props.logining}
                        >注册</Button>
                    </Item>
                </List>
            </WingBlank>);
    }
}




function mapStateToProps(state) {
    return {
        isAuthenticated: state.auth.isAuthenticated,
        logining: state.auth.logining,
        user: state.auth.user,
        error: state.auth.error
    };
}

function mapDispatchToProps(dispatch) {
    return {
        login: bindActionCreators(login, dispatch),
    }
}

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps)(createForm()(LoginList))
);
