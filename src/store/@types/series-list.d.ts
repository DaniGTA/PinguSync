import { ListType } from '@/backend/controller/settings/models/provider/list-types'

export type SeriesList = {
    seriesIdList: IdListWithName[]
    selectedListType: ListType
}
