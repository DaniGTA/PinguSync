import { GetterTree } from 'vuex'

import { RootState } from '@/store'

import { State } from './state'
import { ListType } from '@/backend/controller/settings/models/provider/list-types'
import IdListWithName from '../../../components/controller/model/id-list-with-list-type'

export type Getters = {
    getSeriesIdList(state: State): IdListWithName[]
    getSelectedListType(state: State): ListType
}

export const getters: GetterTree<State, RootState> = {
    getSeriesList: state => state.seriesIdList,
    getSelectedListType: state => state.selectedListType,
}
