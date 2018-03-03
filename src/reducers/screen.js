
import {
    BIND_DEVICE_TO_USER, BIND_DEVICE_TO_USER_FAILED, BIND_DEVICE_TO_USER_SUCCESSFUL,
    UNBIND_DEVICE_TO_USER, UNBIND_DEVICE_TO_USER_FAILED, UNBIND_DEVICE_TO_USER_SUCCESSFUL,
    BIND_DEVICE_TO_USER_RESET,
    FETCH_USER_DEVICES, FETCH_USER_DEVICES_FAILED, FETCH_USER_DEVICES_SUCCESSFUL,
} from '../actions/screen'

import {
    CLEAR_STATE,
} from '../actions/auth'

const initialState = {
    //screen
    userbinding: false,//正在绑定大屏幕到用户
    userbinded: false,//绑定大屏幕到用户成功
    userbinderror: null,//

    userunbinding: false,//正在设置大屏幕
    userunbinded: false,//大屏幕设置成功
    userunbinderror: null,//

    deviceFetching: false,//正在查询
    devices: [],
    fetchDevicesError: null,
};

export function screen(state = initialState, action) {
    switch (action.type) {
        case BIND_DEVICE_TO_USER: {
            return {
                ...state,
                userbinding: true,
                userbinded: false,
                userbinderror: null,
            }
        }
        case BIND_DEVICE_TO_USER_FAILED: {
            return {
                ...state,
                userbinding: false,
                userbinded: false,
                userbinderror: action.error,
            }
        }
        case BIND_DEVICE_TO_USER_SUCCESSFUL: {
            return {
                ...state,
                userbinding: false,
                userbinded: true,
                userbinderror: null,
            }
        }


        case UNBIND_DEVICE_TO_USER: {
            return {
                ...state,
                userunbinding: true,
                userunbinded: false,
                userunbinderror: null,
            }
        }
        case UNBIND_DEVICE_TO_USER_FAILED: {
            return {
                ...state,
                userunbinding: false,
                userunbinded: false,
                userunbinderror: action.error,
            }
        }
        case UNBIND_DEVICE_TO_USER_SUCCESSFUL: {
            return {
                ...state,
                userunbinding: false,
                userunbinded: true,
                userunbinderror: null,
            }
        }

        case BIND_DEVICE_TO_USER_RESET: {
            return {
                ...state,
                userbinding: false,
                userbinded: false,
                userbinderror: null,

                userunbinding: false,
                userunbinded: false,
                userunbinderror: null,
            }
        }
        //分页获取列表
        case FETCH_USER_DEVICES:
            return {
                ...state,
                deviceFetching: true,
                devices: [],
                fetchDevicesError: null
            }
        case FETCH_USER_DEVICES_FAILED:
            return {
                ...state,
                deviceFetching: false,
                devices: [],
                fetchDevicesError: action.error
            };
        case FETCH_USER_DEVICES_SUCCESSFUL:
            return {
                ...state,
                deviceFetching: false,
                devices: [...action.devices],
                fetchDevicesError: null,
            };
        case CLEAR_STATE: {
            //不更新games，通过LiveQuery的SGAMES_DELETED更新
            return {
                ...initialState,
            };
        }
        default:
            return state;
    }
}