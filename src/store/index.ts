import { createStore, createLogger } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import { SeriesList } from './@types/series-list'
import { store as seriesList, SeriesListStore } from './modules/series-list'

export type RootState = {
    seriesList: SeriesList
}

export type Store = SeriesListStore<Pick<RootState, 'seriesList'>>

// Plug in logger when in development environment
const debug = process.env.NODE_ENV !== 'production'
const plugins = debug ? [createLogger({})] : []

// Plug in session storage based persistence
plugins.push(createPersistedState({ storage: window.sessionStorage }))

export const store = createStore({
    plugins,
    modules: {
        seriesList,
    },
})

export function useStore(): Store {
    return store as Store
}
