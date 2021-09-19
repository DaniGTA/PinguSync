import { ListType } from '../../backend/controller/settings/models/provider/list-types'
import WorkerController from '../../backend/communication/ipc-renderer-controller'
import { chOnce } from '../../backend/communication/channels'
import { FailedCover } from '../../backend/controller/frontend/series/model/failed-cover'
import { chListener } from '../../backend/communication/listener-channels'
import IdListWithListType from './model/id-list-with-list-type'
import Overview from '../../backend/controller/objects/meta/overview'
import ApiRequestController from './api-request-controller'

import { SearchQuery } from '../../backend/controller/frontend/series/model/search-query'
import { Store } from '@/store'
import { SeriesListMutationTypes } from '@/store/modules/series-list/mutations-types'

export default class SeriesListViewController {
    get ids(): IdListWithListType[] {
        return this.store.state.seriesList.seriesIdList
    }

    set ids(ids: IdListWithListType[]) {
        this.store.commit(SeriesListMutationTypes.SET_SERIES_ID_LIST, ids)
    }

    get selectedListType(): ListType {
        return this.store.getters.getSelectedListType
    }

    set selectedListType(value: ListType) {
        console.log(`SetList ${value}`)
        this.store.commit(SeriesListMutationTypes.SET_SERIES_LIST_TYPE, value)
    }
    constructor(private store: Store) {}

    public async getSeriesIdsFromListTypes(listTypes: ListType[]): Promise<IdListWithListType[]> {
        console.log(`Get Series from listType: ${listTypes.length}`)
        const idListsWN: IdListWithListType[] = []
        for (const listType of listTypes) {
            const idList = await WorkerController.getOnce<string[]>(chOnce.GetSeriesIdsWithListType, listType)
            if (idList.length !== 0) {
                idListsWN.push({ ids: idList, listType: listType })
            }
        }
        return idListsWN
    }

    public async getSeriesIdsFromCurrentlySelectedListType(): Promise<IdListWithListType[]> {
        const currentSelectedType = this.selectedListType
        console.log(`GetList: ${currentSelectedType}`)
        if (currentSelectedType == ListType.ALL) {
            const allListTypesWithoutAll = Object.keys(ListType)
                .map(x => Number.parseInt(x) as ListType)
                .filter(x => x !== ListType.ALL)
                .reverse()
            this.ids = await this.getSeriesIdsFromListTypes(allListTypesWithoutAll)
        } else {
            this.ids = await this.getSeriesIdsFromListTypes([currentSelectedType])
        }
        console.log(`ListSite: ${this.ids.length}`)
        return this.ids
    }

    public async changeListSelection(newSelection: ListType): Promise<void> {
        this.selectedListType = newSelection
        await this.getSeriesIdsFromCurrentlySelectedListType()
    }

    public async search(query: SearchQuery): Promise<void> {
        if (query.searchString) {
            await this.loadSearchResultToIdList(query)
        } else {
            await this.getSeriesIdsFromCurrentlySelectedListType()
        }
    }

    public async loadSearchResultToIdList(query: SearchQuery): Promise<void> {
        const result: string[] = await WorkerController.getOnce<string[]>(chOnce.SearchSeries, query)
        this.ids = [{ ids: result, listType: ListType.SearchResult }]
    }

    public static async getSeriesCoverUrlById(id: string): Promise<string | undefined> {
        return ApiRequestController.getDataWithId(chOnce.GetPreferedCoverUrlBySeriesId, id)
    }

    public static async getSeriesNameById(id: string): Promise<string | undefined> {
        return ApiRequestController.getDataWithId(chOnce.GetPreferedNameBySeriesId, id)
    }

    public static async getSeriesDescriptionById(id: string): Promise<Overview | undefined> {
        return ApiRequestController.getDataWithId(chOnce.GetOverviewBySeriesId, id)
    }

    public static sendFailedCover(failedCover: FailedCover): void {
        WorkerController.send(chListener.OnSeriesFailedCoverImage, failedCover)
    }

    public static saveSeriesInDB(id: string): void {
        WorkerController.send(chOnce.SaveSeriesInDB, id)
    }
}
