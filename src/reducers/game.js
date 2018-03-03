
import {
    SET_GAME, SET_PICKED_PATTERN,
    SAVE, SAVE_FAILED, SAVE_SUCCESSFUL,
    UPEATE_GAME, UPEATE_GAME_FAILED, UPEATE_GAME_SUCCESSFUL,
    FETCH_GAMES, FETCH_GAMES_FAILED, FETCH_GAMES_SUCCESSFUL,
    DELETE_GAME, DELETE_GAME_FAILED, DELETE_GAME_SUCCESSFUL,
    SGAMES_UPDATED, SGAMES_DELETED, SGAMES_CREATED,
    SGAME_UPDATED, SGAME_DELETED,
} from '../actions/game'

import {
    CLEAR_STATE,
} from '../actions/auth'

const initialState = {

    //主要用于EditGame 和 ViewGame中  新增 编辑 
    opt: 'add',//当前操作 'add' 'edit' 'view' 
    saving: false,//正在保存
    saved: false,//保存是否成功
    game: null,//Parse对象


    //主要用于Games.jsx中  查询 删除
    fetching: false,//正在查询
    hasmore: true,//是否最后一页
    games: [],//所有的game,由一页一页的Games拼接起来
    startIndex: 0,
    deleting: false,  //删除

    //LiveQuery 
    deleted: false,//ViewGame中，当前game已经被其它用户删除

    //screen
    userbinding: false,//正在设置大屏幕
    userbinded: false,//大屏幕设置成功
    userbinderror: null,//


    error: null,
};

export function game(state = initialState, action) {
    switch (action.type) {
        //SGAMES_CREATED，SGAMES_UPDATED，SGAMES_DELETED 用在Games中，主要维护games列表
        //editGame不监听
        case SGAMES_CREATED: {
            let index = state.games.findIndex(function (value, index, arr) {
                return value.id === action.game.id;
            });
            //如果没有 说明还没有添加 添加进来
            if (index == -1) {
                state.games = [action.game, ...state.games];
                state.startIndex = state.startIndex + 1;
            }
            return {
                ...state,
            };
        }
        case SGAMES_UPDATED: {
            let index = state.games.findIndex(function (value, index, arr) {
                return value.id === action.game.id;
            });
            if (index != -1) {
                console.log(`game:SGAMES_UPDATED:game:${JSON.stringify(action.game.get('title'))}`);
                state.games.splice(index, 1, action.game);
            }
            return {
                ...state,
                //复制一份games 不然Listview.Datasource 不会触发更新 
                games: [...state.games],
            }
        }
        case SGAMES_DELETED: {
            //获取被删除game的索引
            let index = state.games.findIndex(function (value, index, arr) {
                return value.id === action.game.id;
            });
            if (index != -1) {
                //从state.games中删除
                state.games.splice(index, 1);
                state.startIndex = state.startIndex - 1;
            }
            return {
                ...state,
            }
        }
        //SGAME_UPDATED,SGAME_DELETED主要用在viewGame中
        case SGAME_UPDATED: {
            return {
                ...state,
                game: action.game,
            }
        }
        case SGAME_DELETED: {
            return {
                ...state,
                game: null,
                deleted: true,
            }
        }
        case SET_GAME:
            return {
                ...state,
                game: action.game,
                opt: action.opt,
                deleted: false,
                saved: false,
            }

        //更新时保存
        case UPEATE_GAME:
            return {
                ...state,
                saving: true,
                saved: false,
                game: action.game,
                error: null
            }
        case UPEATE_GAME_FAILED:
            return {
                ...state,
                saving: false,
                saved: false,
                game: action.game,
                error: action.error,
            };
        case UPEATE_GAME_SUCCESSFUL: {
            //不更新games，通过LiveQuery的SGAMES_UPDATED更新
            return {
                ...state,
                saving: false,
                saved: true,
                game: action.game,
                error: null,
            };
        }
        //新增时保存
        case SAVE:
            return {
                ...state,
                saving: true,
                saved: false,
                game: action.game,
                error: null
            }
        case SAVE_FAILED:
            return {
                ...state,
                saving: false,
                saved: false,
                game: action.game,
                error: action.error,
            };
        case SAVE_SUCCESSFUL:
            //不更新games，通过LiveQuery的SGAMES_CREATED更新
            return {
                ...state,
                saving: false,
                saved: true,
                game: action.game,
                startIndex: state.startIndex + 1,
                error: null,
            };
        //分页获取列表
        case FETCH_GAMES:
            return {
                ...state,
                fetching: true,
                saved: false,
                game: null,//设置一下为空 防止冲突
                hasmore: true,
                error: null
            }
        case FETCH_GAMES_FAILED:
            return {
                ...state,
                fetching: false,
                hasmore: true,
                error: action.error
            };
        case FETCH_GAMES_SUCCESSFUL:
            return {
                ...state,
                fetching: false,
                games: [...state.games, ...action.pageGames],
                startIndex: action.startIndex,//下一页的开始index
                hasmore: action.hasmore,
                error: null,
            };
        //删除
        case DELETE_GAME:
            return {
                ...state,
                deleting: true,
                saved: false,//设置一下为空 防止冲突
                error: null
            }
        case DELETE_GAME_FAILED:
            return {
                ...state,
                deleting: false,
                error: action.error
            };
        case DELETE_GAME_SUCCESSFUL: {
            //不更新games，通过LiveQuery的SGAMES_DELETED更新
            return {
                ...state,
                deleting: false,
                error: null,
            };
        }
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