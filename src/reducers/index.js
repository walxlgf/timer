
import { auth } from './auth'
import { pattern } from './pattern'
import { game } from './game'
import { screen } from './screen'
import { combineReducers } from 'redux'

export default combineReducers({
    auth,
    pattern,
    game,
    screen,
})