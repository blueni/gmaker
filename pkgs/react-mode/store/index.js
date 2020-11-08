import { createStore } from 'redux'
import reducer from './reducers'

const defaultState = {
    blog: null,
    categories: [],
    currentCategory: '',
    loading: false,
    error: '',
}

export default createStore(reducer, defaultState)
