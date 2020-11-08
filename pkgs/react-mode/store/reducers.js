import { combineReducers } from 'redux'

function makeReducerFunc(key) {
    return function(state = null, action) {
        if (action[key] !== undefined) {
            return action[key]
        }

        return state
    }
}

export const blog = makeReducerFunc('blog')
export const categories = makeReducerFunc('categories')
export const currentCategory = makeReducerFunc('currentCategory')
export const loading = makeReducerFunc('loading')
export const error = makeReducerFunc('error')

export default combineReducers({
    blog,
    categories,
    currentCategory,
    loading,
    error,
})
