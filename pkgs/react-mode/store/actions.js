export const SET_BLOG = 'SET_BLOG'
export const SET_CATEGORIES = 'SET_CATEGORIES'
export const SET_CURRENT_CATEGORY = 'SET_CURRENT_CATEGORY'
export const SET_LOADING = 'SET_LOADING'
export const SET_ERROR = 'SET_ERROR'

function makeActionFunc(key, type) {
    return function(value) {
        return {
            type,
            [key]: value,
        }
    }
}

export const setBlog = makeActionFunc('blog', SET_BLOG)
export const setCategories = makeActionFunc('categories', SET_CATEGORIES)
export const setCurrentCategory = makeActionFunc('currentCategory', SET_CURRENT_CATEGORY)
export const setLoading = makeActionFunc('loading', SET_LOADING)
export const setError = makeActionFunc('error', SET_ERROR)
