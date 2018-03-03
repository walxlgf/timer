
import {
    SET_PATTERN,
    SAVE, SAVE_FAILED, SAVE_SUCCESSFUL,
    UPEATE_PATTERN, UPEATE_PATTERN_FAILED, UPEATE_PATTERN_SUCCESSFUL,
    FETCH_PATTERNS, FETCH_PATTERNS_FAILED, FETCH_PATTERNS_SUCCESSFUL,
    DELETE_PATTERN, DELETE_PATTERN_FAILED, DELETE_PATTERN_SUCCESSFUL,
} from '../actions/pattern'


import {
    CLEAR_STATE,
} from '../actions/auth'


const initialState = {
    readonly: false, //是否只读 在编辑页可用
    //保存 包括新增和更新
    saving: false,//正在保存
    saved: false,//保存是否成功
    pattern: null,

    //查询
    fetching: false,//正在查询
    hasmore: true,//是否最后一页
    patterns: [],

    //删除
    deleting: false,
    deletedPattern: null,//已经被删除的pattern

    error: null,
};

export function pattern(state = initialState, action) {
    switch (action.type) {
        case SET_PATTERN:
            return {
                ...state,
                pattern: action.pattern,
                readonly: action.readonly,
            }

        //更新时保存
        case UPEATE_PATTERN:
            return {
                ...state,
                saving: true,
                saved: false,
                pattern: action.pattern,
                patterns: [],//设置一下为空 防止冲突
                deletedPattern: null,//设置一下为空 防止冲突
                error: null
            }
        case UPEATE_PATTERN_FAILED:
            return {
                ...state,
                saving: false,
                saved: false,
                pattern: action.pattern,
                error: action.error,
            };
        case UPEATE_PATTERN_SUCCESSFUL:
            return {
                ...state,
                saving: false,
                saved: true,
                pattern: action.pattern,
                error: null,
            };
        //新增时保存
        case SAVE:
            return {
                ...state,
                saving: true,
                saved: false,
                pattern: action.pattern,
                patterns: [],//设置一下为空 防止冲突
                deletedPattern: null,//设置一下为空 防止冲突
                error: null
            }
        case SAVE_FAILED:
            return {
                ...state,
                saving: false,
                saved: false,
                pattern: action.pattern,
                error: action.error,
            };
        case SAVE_SUCCESSFUL:
            return {
                ...state,
                saving: false,
                saved: true,
                pattern: action.pattern,
                error: null,
            };
        //分页获取列表
        case FETCH_PATTERNS:
            return {
                ...state,
                fetching: true,
                saved: false,
                pattern: null,//设置一下为空 防止冲突
                deletedPattern: null,//设置一下为空 防止冲突
                patterns: [],
                hasmore: true,
                error: null
            }
        case FETCH_PATTERNS_FAILED:
            return {
                ...state,
                fetching: false,
                patterns: [],
                hasmore: true,
                error: action.error
            };
        case FETCH_PATTERNS_SUCCESSFUL:
            return {
                ...state,
                fetching: false,
                patterns: action.patterns,
                hasmore: action.hasmore,
                error: null,
            };
        //删除
        case DELETE_PATTERN:
            return {
                ...state,
                deleting: true,
                saved: false,//设置一下为空 防止冲突
                patterns: [],//设置一下为空 防止冲突
                deletedPattern: null,
                error: null
            }
        case DELETE_PATTERN_FAILED:
            return {
                ...state,
                deleting: false,
                deletedPattern: null,
                error: action.error
            };
        case DELETE_PATTERN_SUCCESSFUL:
            return {
                ...state,
                deleting: false,
                deletedPattern: action.pattern,
                error: null,
            };
        case CLEAR_STATE:
            return { 
                ...initialState 
            };
        default:
            return state;
    }
}