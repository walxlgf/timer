import Parse, { Error } from 'parse';

//绑定大屏幕到用户操作
export const BIND_DEVICE_TO_USER = "BIND_DEVICE_TO_USER"
export const BIND_DEVICE_TO_USER_FAILED = "BIND_DEVICE_TO_USER_FAILED"
export const BIND_DEVICE_TO_USER_SUCCESSFUL = "BIND_DEVICE_TO_USER_SUCCESSFUL"
export const BIND_DEVICE_TO_USER_RESET = "BIND_DEVICE_TO_USER_RESET"


export const UNBIND_DEVICE_TO_USER = "UNBIND_DEVICE_TO_USER"
export const UNBIND_DEVICE_TO_USER_FAILED = "UNBIND_DEVICE_TO_USER_FAILED"
export const UNBIND_DEVICE_TO_USER_SUCCESSFUL = "UNBIND_DEVICE_TO_USER_SUCCESSFUL"
export const UNBIND_DEVICE_TO_USER_RESET = "UNBIND_DEVICE_TO_USER_RESET"


export const BIND_DEVICE_TO_GAME = "BIND_DEVICE_TO_GAME"
export const BIND_DEVICE_TO_GAME_FAILED = "BIND_DEVICE_TO_GAME_FAILED"
export const BIND_DEVICE_TO_GAME_SUCCESSFUL = "BIND_DEVICE_TO_GAME_SUCCESSFUL"
export const BIND_DEVICE_TO_GAME_RESET = "BIND_DEVICE_TO_GAME_RESET"

export const FETCH_USER_DEVICES = "FETCHS_DEVICE_USER"
export const FETCH_USER_DEVICES_FAILED = "FETCH_USER_DEVICES_FAILED"
export const FETCH_USER_DEVICES_SUCCESSFUL = "FETCH_USER_DEVICES_SUCCESSFUL"

//大屏幕

/**
 * 绑定大屏幕到用户
 * @param {*} uuid 
 */
export const bindDeviceToUser = (uuid) => {
    return dispatch => {
        dispatch({ type: BIND_DEVICE_TO_USER });
        console.log(`game: bindDeviceToUser:uuid:${uuid}`);
        let _device;
        let query = new Parse.Query('Device');
        query.equalTo('uuid', uuid);
        query.first()
            //判断这个大屏幕是不是存在
            .then(function (device) {
                console.log(`game: bindDeviceToUser:device:${device}`);
                if (!device) {
                    return Parse.Promise.error("这个大屏幕不存在。");
                } else {
                    _device = device;
                    let query = new Parse.Query('DeviceUser');
                    query.equalTo('device', device);
                    return query.first();
                }
            })
            //判断这个大屏幕是否已经和用绑定
            .then(function (deviceUser) {
                //如果为空 新建绑定
                if (!deviceUser) {
                    let DeviceUser = Parse.Object.extend("DeviceUser");
                    let deviceUser = new DeviceUser();
                    deviceUser.set('user', Parse.User.current());
                    deviceUser.set('device', _device);
                    return deviceUser.save();
                }
                //不为空 说明已经绑定
                else {
                    return Parse.Promise.error("这个大屏幕已经绑定。");
                }
            })
            .then(function (deviceUser) {
                console.log(`game: bindDeviceToUser:game:${JSON.stringify(deviceUser)}`);
                dispatch({ type: BIND_DEVICE_TO_USER_SUCCESSFUL });
            }, function (error) {
                console.log(`game: bindDeviceToUser:error:${error}`);
                dispatch({ type: BIND_DEVICE_TO_USER_FAILED, error });
            })
    }
}


/**
 * 绑定大屏幕到用户
 * @param {*} uuid 
 */
export const unbindDeviceToUser = (uuid) => {
    return dispatch => {
        dispatch({ type: UNBIND_DEVICE_TO_USER });
        console.log(`game: unbindDeviceToUser:uuid:${uuid}`);
        let _device;
        let query = new Parse.Query('Device');
        query.equalTo('uuid', uuid);
        query.first()
            //判断这个大屏幕是不是存在
            .then(function (device) {
                console.log(`game: unbindDeviceToUser:device:${device}`);
                if (!device) {
                    return Parse.Promise.error("这个大屏幕不存在。");
                } else {
                    _device = device;
                    let query = new Parse.Query('DeviceUser');
                    query.equalTo('device', device);
                    query.include('device');
                    return query.first();
                }
            })
            //判断这个大屏幕是否已经和用户绑定
            .then(function (deviceUser) {
                //如果为空 新建绑定
                if (!deviceUser) {
                    return Parse.Promise.error("这个大屏幕没有和您绑定。");
                }
                //不为空 说明已经绑定 
                else {
                    //判断这个device是否绑定了GAME
                    if (_device.get('game')) {
                        return Parse.Promise.error("这个大屏幕绑定了Game，无法解绑。");
                    } else {
                        deviceUser.destroy();
                    }
                }
            })
            .then(function (deviceUser) {
                console.log(`game: unbindDeviceToUser:game:${JSON.stringify(deviceUser)}`);
                dispatch({ type: UNBIND_DEVICE_TO_USER_SUCCESSFUL });
            }, function (error) {
                console.log(`game: unbindDeviceToUser:error:${error}`);
                dispatch({ type: UNBIND_DEVICE_TO_USER_FAILED, error });
            })
    }
}

/**
 * 当绑定成功后 把state复原
 */
export const resetBindDeviceToUser = () => {
    return dispatch => {
        dispatch({ type: BIND_DEVICE_TO_USER_RESET });
    }
}


/**
 * 绑定大屏幕到Game
 * @param {*} game 
 * @param {*} uuid 
 */
export const bindDeviceToGame = (game, uuid) => {
    return dispatch => {
        dispatch({ type: BIND_DEVICE_TO_GAME });
        let query = new Parse.Query('Device');
        query.equalTo('uuid', uuid);
        query.first()
            .then(function (device) {
                //一个大屏幕只能被一个game使用。
                let oldGame = device.get('game');
                if (oldGame) {
                    console.log(`game: bindDeviceToGame:oldGame:${oldGame}`);
                    let screens = oldGame.get('screens');
                    console.log(`game: bindDeviceToGame:oldGame:screens:${screens}`);
                    if (screens && screens.length > 0) {
                        //看看存不存在
                        let index = screens.findIndex(function (value, index, arr) {
                            return value.id === device.id;
                        });

                        console.log(`game: bindDeviceToGame:oldGame:index:${index}`);
                        //如果存在 删除后保存
                        if (index != -1) {
                            screens.splice(index, 1);
                            oldGame.set('screens', screens);
                            //判断还有没有screens 如果已经没有了 删除screen（角色)读取此game的权限
                            if (!screens || screens.length === 0) {
                                let gameAcl = oldGame.get('ACL');
                                gameAcl.setRoleReadAccess('screen', false);
                                gameAcl.setRoleWriteAccess('screen', false);
                            }
                            oldGame.save();
                        }
                    }
                }
                device.set('game', game);
                return device.save();
            })
            //如果保存成功
            //设置game的ACL,让screen（角色）能访问这个game
            //并且设置screens
            .then(function (device) {
                console.log(`game: bindDeviceToGame:device1:${device}`);
                //处理acl
                let gameAcl = game.get('ACL');
                gameAcl.setRoleReadAccess('screen', true);
                gameAcl.setRoleWriteAccess('screen', false);
                //处理Screens
                let screens = game.get('screens');
                if (!screens) {
                    screens = [];
                    screens.push(device);
                } else {
                    //看看存不存在
                    let index = screens.findIndex(function (value, index, arr) {
                        return value.id === device.id;
                    });
                    //存在替换 不存在push
                    if (index !== -1)
                        screens.splice(index, 1, device);
                    else
                        screens.push(device);
                }
                console.log(`game: bindDeviceToGame:screens:${screens}`);
                game.set('screens', screens);
                return game.save();
            })
            //
            .then(function (game) {
                console.log(`game: bindDeviceToGame:game:${JSON.stringify(game)}`);
                dispatch({ type: BIND_DEVICE_TO_GAME_SUCCESSFUL });
            }, function (error) {
                console.log(`game: bindDeviceToGame:error:${error}`);

                dispatch({ type: BIND_DEVICE_TO_GAME_FAILED, error });
            })
    }
}




/**
 * 取消绑定大屏幕到Game
 * @param {*} game 
 * @param {*} uuid 
 */
export const unbindDeviceToGame = (game, device) => {
    return dispatch => {
        console.log(`game: unbindDeviceToGame:device1:${JSON.stringify(device)}`);
        device.set('game', null);
        device.save()
            .then(function (device) {
                // console.log(`game: unbindDeviceToGame:device2:${JSON.stringify(device)}`);
                let screens = game.get('screens');
                if (screens) {
                    //看看存不存在
                    let index = screens.findIndex(function (value, index, arr) {
                        return value.id === device.id;
                    });
                    //如果存在 删除后保存
                    if (index != -1) {
                        screens.splice(index, 1);
                        game.set('screens', screens);
                        //判断还有没有screens 如果已经没有了 删除screen（角色)读取此game的权限
                        let gameAcl = game.get('ACL');
                        gameAcl.setRoleReadAccess('screen', false);
                        gameAcl.setRoleWriteAccess('screen', false);
                        return game.save();
                    }
                }
            })
            .then(function (game) {
                console.log(`game: unbindDeviceToGame:game:${JSON.stringify(game)}`);
            }, function (error) {
                console.log(`game: unbindDeviceToGame:error:${error}`);
            })
    }
}

/**
 * 查询和当前用户绑定的Devices
 */
export const fetchUserDevices = () => {
    return dispatch => {
        dispatch({ type: FETCH_USER_DEVICES });
        let DeviceUser = Parse.Object.extend("DeviceUser");
        let query = new Parse.Query(DeviceUser);
        query.equalTo('user', Parse.User.current());
        query.include('device');
        query.find()
            .then(function (deviceUsers) {
                console.log(`game: fetchUserDevices:deviceUsers:${deviceUsers}`);
                let devices = [];
                if (deviceUsers) {
                    for (let du of deviceUsers) {
                        devices.push(du.get('device'));
                        console.log(`game: fetchUserDevices:device:${du.get('device')}`);
                    }
                }
                console.log(`game: fetchUserDevices:devices:${JSON.stringify(devices)}`);
                dispatch({ type: FETCH_USER_DEVICES_SUCCESSFUL, devices });
            }, function (error) {
                dispatch({ type: FETCH_USER_DEVICES_FAILED, error });
            });

    }
}
