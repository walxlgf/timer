import Parse, { Error } from 'parse';

import { FETCH_USER_DEVICES } from './screen'

export const SET_GAME = "SET_GAME" //编辑时模板是先把GAME设置到this.state.game.game中 

export const SET_PICKED_PATTERN = "SET_PICKED_PATTERN"

export const UPEATE_GAME = "UPEATE_GAME"
export const UPEATE_GAME_FAILED = "UPEATE_GAME_FAILED"
export const UPEATE_GAME_SUCCESSFUL = "UPEATE_GAME_SUCCESSFUL"

export const SAVE = "SAVE"
export const SAVE_FAILED = "SAVE_FAILED"
export const SAVE_SUCCESSFUL = "SAVE_SUCCESSFUL"

export const FETCH_GAMES = "FETCHS_GAMES"
export const FETCH_GAMES_FAILED = "FETCH_GAMES_FAILED"
export const FETCH_GAMES_SUCCESSFUL = "FETCH_GAMES_SUCCESSFUL"

export const DELETE_GAME = "DELETE_GAME"
export const DELETE_GAME_FAILED = "DELETE_GAME_FAILED"
export const DELETE_GAME_SUCCESSFUL = "DELETE_GAME_SUCCESSFUL"


//LiveQuery
//监听games列表
export const SGAMES_OPENED = "SGAMES_OPENED";//监听已成功打开
export const SGAMES_CLOSED = "SGAMES_CLOSED";//设置监听 取消监听
export const SGAMES_CREATED = "SGAMES_CREATED";//监听到更新
export const SGAMES_UPDATED = "SGAMES_UPDATED";//监听到更新
export const SGAMES_DELETED = "SGAMES_DELETED";//监听到删除
//监听正在view的Game
export const SGAME_OPENED = "SGAME_OPENED";//监听已成功打开
export const SGAME_CLOSED = "SGAME_CLOSED";//设置监听 取消监听
export const SGAME_UPDATED = "SGAME_UPDATED";//监听到更新
export const SGAME_DELETED = "SGAME_DELETED";//监听到删除




//监听games列表
let sgames;
export const subscribeGames = () => {
    return dispatch => {
        let query = new Parse.Query('Game');
        sgames = query.subscribe();
        sgames.on('open', () => {
            console.log(`game:sgames:opened:${JSON.stringify(sgames)}`);
            dispatch({ type: SGAMES_OPENED, sgames });
        });
        sgames.on('create', (game) => {
            console.log(`game:sgames created:${JSON.stringify(game.get('title'))}`);
            dispatch({ type: SGAMES_CREATED, game: game });
        });
        sgames.on('update', (game) => {
            console.log(`game:sgames updated1:${JSON.stringify(game.get('title'))}`);
            var queryGame = new Parse.Query('Game');
            queryGame.include('screens');
            queryGame.get(game.id)
                .then(function (game) {
                    console.log(`game:sgames updated2:${JSON.stringify(game.get('title'))}`);
                    dispatch({ type: SGAMES_UPDATED, game: game });
                })
        });

        sgames.on('enter', (game) => {
            console.log(`game:sgames:entered:${JSON.stringify(game)}`);
        });

        sgames.on('delete', (game) => {
            console.log(`game:sgames:deleted:${JSON.stringify(game)}`);
            dispatch({ type: SGAMES_DELETED, game: game });
        });

        sgames.on('close', () => {
            console.log('game:closed');
            dispatch({ type: SGAMES_CLOSED });
        });
    }
}


export const unsubscribeGames = () => {
    return dispatch => {
        if (sgames) {
            sgames.unsubscribe();
        }
    }
}



//查看game详情时监听某一个具体的game
let sgame;
export const subscribeGame = (game) => {
    return dispatch => {
        let query = new Parse.Query('Game');
        query.equalTo('objectId', game.id);
        sgame = query.subscribe();
        sgame.on('open', () => {
            console.log(`game:sgame:opened:${JSON.stringify(sgame)}`);
            dispatch({ type: SGAME_OPENED, sgame });
        });
        sgame.on('update', (game) => {
            console.log(`game:sgame updated1:${JSON.stringify(game.get('title'))}`);
            var queryGame = new Parse.Query('Game');
            queryGame.include('screens');
            queryGame.get(game.id)
                .then(function (game) {
                    console.log(`game:sgame updated2:${JSON.stringify(game.get('title'))}`);
                    dispatch({ type: SGAME_UPDATED, game: game });
                })
        });

        sgame.on('delete', (game) => {
            console.log(`game:sgame:deleted:${JSON.stringify(game)}`);
            dispatch({ type: SGAME_DELETED });
        });

        sgame.on('close', () => {
            console.log('game:closed');
            dispatch({ type: SGAME_CLOSED });
        });
    }
}


export const unsubscribeGame = () => {
    return dispatch => {
        if (sgame) {
            sgame.unsubscribe();
        }
    }
}


/**
 * 编辑模板之前把GAME设置到this.state.game.game中 
 * @param {Parse.Object.extend("Game")} game 
 */
export const setGame = (game, opt = 'view') => {
    return dispatch => {
        dispatch({ type: SET_GAME, game, opt });
    }
}


/**
 * 删除指定Game
 * @param {Parse.Object.extend("Game")} game 
 */
export const deleteGame = (game) => {
    return dispatch => {
        dispatch({ type: DELETE_GAME });
        //处理和game绑定的大屏幕
        let screens = game.get('screens');
        if (screens && screens.length > 0) {
            screens.map((device) => {
                device.set('game', null);
                device.save();
            });
        }
        //删除game
        game.destroy()
            .then(function (game) {
                dispatch({ type: DELETE_GAME_SUCCESSFUL, game });
            }, function (error) {
                dispatch({ type: DELETE_GAME_FAILED, error });
            });
    }
}

/**
 * 分页查询
 * @param {*} pageIndex 
 * @param {*} pageSize 
 */
export const fetchGames = (startIndex, pageSize) => {
    return dispatch => {
        dispatch({ type: FETCH_GAMES });
        let Game = Parse.Object.extend("Game");
        let query = new Parse.Query(Game);
        query.descending('_created_at');
        query.skip(startIndex);
        query.limit(pageSize);
        query.include('screens');
        query.find()
            .then(function (results) {
                let hasmore = true;
                startIndex = startIndex + pageSize;
                if (results.length < pageSize) {
                    hasmore = false;
                    startIndex = results.length;
                }
                dispatch({ type: FETCH_GAMES_SUCCESSFUL, pageGames: results, startIndex, hasmore });
            }, function (error) {
                dispatch({ type: FETCH_GAMES_FAILED, error });
            });

    }
}

/**
 * 新建时保存
 * @param {object} gameData 
 */
export const save = (gameData) => {
    return dispatch => {
        let Game = Parse.Object.extend("Game");
        let game = new Game();
        game.set('title', gameData.title);
        game.set('startChips', gameData.startChips);
        game.set('startTime', gameData.startTime);
        game.set('rounds', gameData.rounds);
        dispatch({ type: SAVE, game });

        //设置Acl
        let gameAcl = new Parse.ACL();
        gameAcl.setPublicReadAccess(false);
        gameAcl.setPublicWriteAccess(false);
        gameAcl.setRoleWriteAccess('admin', true);
        gameAcl.setRoleReadAccess('admin', true);
        gameAcl.setReadAccess(Parse.User.current().id, true);
        gameAcl.setWriteAccess(Parse.User.current().id, true);
        game.set('ACL', gameAcl);

        game.save()
            .then(function (game) {
                dispatch({ type: SAVE_SUCCESSFUL, game })
            }, function (error) {
                console.log(`action:game:save:error:${JSON.stringify(error)}`)
                dispatch({ type: SAVE_FAILED, game, error });
            });
    }
}



/**
 * 新建时保存
 * @param {Parse.Object.extend("Game")} game 
 */
export const updateGame = (game) => {
    return dispatch => {
        dispatch({ type: UPEATE_GAME, game });
        game.save()
            .then(function (game) {
                dispatch({ type: UPEATE_GAME_SUCCESSFUL, game });
            }, function (error) {
                console.log(`action:game:save:error:${JSON.stringify(error)}`)
                dispatch({ type: UPEATE_GAME_FAILED, game, error });
            });
    }
}



