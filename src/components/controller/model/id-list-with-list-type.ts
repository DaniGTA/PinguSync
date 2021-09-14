import { ListType } from '@backend/controller/settings/models/provider/list-types'

export default interface IdListWithListType {
    ids: string[]
    listType: ListType
}
