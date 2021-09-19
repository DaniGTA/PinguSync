import { MutationTree } from 'vuex'

import { State } from './state'
import { SeriesListMutationTypes } from './mutations-types'
import { ListType } from '@/backend/controller/settings/models/provider/list-types'
import IdListWithName from '../../../components/controller/model/id-list-with-list-type'

export type Mutations<S = State> = {
    [SeriesListMutationTypes.SET_SERIES_ID_LIST](state: S, seriesIdList: IdListWithName[]): void
    [SeriesListMutationTypes.SET_SERIES_LIST_TYPE](state: S, listType: ListType): void
}

export const mutations: MutationTree<State> = {
    [SeriesListMutationTypes.SET_SERIES_ID_LIST](state: State, seriesIdList: IdListWithName[]) {
        state.seriesIdList = seriesIdList
    },
    [SeriesListMutationTypes.SET_SERIES_LIST_TYPE](state: State, listType: ListType) {
        state.selectedListType = listType
    },
}
