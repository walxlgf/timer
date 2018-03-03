import Parse from 'parse';

export const SET_PATTERN = "SET_PATTERN" //编辑时模板是选PATTERN设置 this.state.pattern.pattern中 

export const UPEATE_PATTERN = "UPEATE_PATTERN"
export const UPEATE_PATTERN_FAILED = "UPEATE_PATTERN_FAILED"
export const UPEATE_PATTERN_SUCCESSFUL = "UPEATE_PATTERN_SUCCESSFUL"

export const SAVE = "SAVE"
export const SAVE_FAILED = "SAVE_FAILED"
export const SAVE_SUCCESSFUL = "SAVE_SUCCESSFUL"

export const FETCH_PATTERNS = "FETCHS_PATTERNS"
export const FETCH_PATTERNS_FAILED = "FETCH_PATTERNS_FAILED"
export const FETCH_PATTERNS_SUCCESSFUL = "FETCH_PATTERNS_SUCCESSFUL"

export const DELETE_PATTERN = "DELETE_PATTERN"
export const DELETE_PATTERN_FAILED = "DELETE_PATTERN_FAILED"
export const DELETE_PATTERN_SUCCESSFUL = "DELETE_PATTERN_SUCCESSFUL"


/**
 * 编辑模板之前把PATTERN设置到this.state.pattern.pattern中 
 * @param {Parse.Object.extend("Pattern")} pattern 
 */
export const setPattern = (pattern, readonly = false) => {
    return dispatch => {
        dispatch({ type: SET_PATTERN, pattern, readonly });
    }
}


/**
 * 删除指定Pattern
 * @param {Parse.Object.extend("Pattern")} pattern 
 */
export const deletePattern = (pattern) => {
    return dispatch => {
        dispatch({ type: DELETE_PATTERN });
        pattern.destroy()
            .then(function (pattern) {
                dispatch({ type: DELETE_PATTERN_SUCCESSFUL, pattern });
            }, function (error) {
                dispatch({ type: DELETE_PATTERN_FAILED, error });
            });

    }
}
/**
 * 分页查询
 * @param {*} pageIndex 
 * @param {*} pageSize 
 */
export const fetchPatterns = (startIndex, pageSize) => {
    return dispatch => {
        dispatch({ type: FETCH_PATTERNS });
        let Pattern = Parse.Object.extend("Pattern");
        let query = new Parse.Query(Pattern);
        query.descending('_created_at');
        query.skip(startIndex);
        query.limit(pageSize);
        query.find()
            .then(function (results) {
                let hasmore = true;
                if (results.length < pageSize)
                    hasmore = false;
                dispatch({ type: FETCH_PATTERNS_SUCCESSFUL, patterns: results, hasmore });
            }, function (error) {
                dispatch({ type: FETCH_PATTERNS_FAILED, error });
            });

    }
}

/**
 * 新建时保存
 * @param {object} patternData 
 */
export const save = (patternData) => {
    return dispatch => {
        let Pattern = Parse.Object.extend("Pattern");
        let pattern = new Pattern();
        pattern.set('title', patternData.title);
        pattern.set('rounds', patternData.rounds);
        dispatch({ type: SAVE, pattern });
        pattern.save()
            .then(function (pattern) {
                dispatch({ type: SAVE_SUCCESSFUL, pattern });
            }, function (error) {
                console.log(`action:pattern:save:error:${JSON.stringify(error)}`)
                dispatch({ type: SAVE_FAILED, pattern, error });
            });
    }
}



/**
 * 新建时保存
 * @param {Parse.Object.extend("Pattern")} pattern 
 */
export const updatePattern = (pattern) => {
    return dispatch => {
        dispatch({ type: UPEATE_PATTERN, pattern });
        pattern.save()
            .then(function (pattern) {
                dispatch({ type: UPEATE_PATTERN_SUCCESSFUL, pattern });
            }, function (error) {
                console.log(`action:pattern:save:error:${JSON.stringify(error)}`)
                dispatch({ type: UPEATE_PATTERN_FAILED, pattern, error });
            });
    }
}

