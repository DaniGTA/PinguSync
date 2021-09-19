import { ListType } from '@/backend/controller/settings/models/provider/list-types'
import IdListWithName from '../../../components/controller/model/id-list-with-list-type'

export type State = {
    seriesIdList: IdListWithName[]
    selectedListType: ListType
}

export const state: State = {
    seriesIdList: [],
    selectedListType: ListType.UNKOWN,
}
