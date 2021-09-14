import { ListType } from '../../backend/controller/settings/models/provider/list-types'
import WorkerController from '../../backend/communication/ipc-renderer-controller'
import { chOnce } from '../../backend/communication/channels'
import { FailedCover } from '../../backend/controller/frontend/series/model/failed-cover'
import { chListener } from '../../backend/communication/listener-channels'
import IdListWithListType from './model/id-list-with-list-type'
import Overview from '../../backend/controller/objects/meta/overview'
import ApiRequestController from './api-request-controller'

import { SearchQuery } from '../../backend/controller/frontend/series/model/search-query'

export default class SeriesListViewController {
    static selectedListType: ListType = ListType.ALL
    static ids: IdListWithListType[] = []
    static get GET_selectedListType(): ListType {
        return this.selectedListType
    }

    public static async getSeriesIdsFromListTypes(listTypes: ListType[]): Promise<IdListWithListType[]> {
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

    static SET_selectedListType(value: ListType): void {
        console.log(`SetList ${value}`)
        this.selectedListType = value
    }

    public static async getSeriesIdsFromCurrentlySelectedListType(): Promise<IdListWithListType[]> {
        const currentSelectedType = this.selectedListType
        console.log(`GetList: ${currentSelectedType}`)
        if (currentSelectedType == ListType.ALL) {
            const allListTypesWithoutAll = Object.keys(ListType)
                .map(x => Number.parseInt(x) as ListType)
                .filter(x => x !== ListType.ALL)
                .reverse()
            this.ids = await SeriesListViewController.getSeriesIdsFromListTypes(allListTypesWithoutAll)
        } else {
            this.ids = await SeriesListViewController.getSeriesIdsFromListTypes([currentSelectedType])
        }
        console.log(`ListSite: ${this.ids.length}`)
        return this.ids
    }

    public static async changeListSelection(newSelection: ListType): Promise<void> {
        this.SET_selectedListType(newSelection)
        await this.getSeriesIdsFromCurrentlySelectedListType()
    }

    public static async getSeriesCoverUrlById(id: string): Promise<string | undefined> {
        return await ApiRequestController.getDataWithId(chOnce.GetPreferedCoverUrlBySeriesId, id)
    }

    public static async search(query: SearchQuery): Promise<void> {
        if (query.searchString) {
            await this.loadSearchResultToIdList(query)
        } else {
            await this.getSeriesIdsFromCurrentlySelectedListType()
        }
    }

    public static async loadSearchResultToIdList(query: SearchQuery): Promise<void> {
        const result: string[] = await WorkerController.getOnce<string[]>(chOnce.SearchSeries, query)
        this.ids = [{ ids: result, listType: ListType.SearchResult }]
    }

    public static async getSeriesNameById(id: string): Promise<string | undefined> {
        return await ApiRequestController.getDataWithId(chOnce.GetPreferedNameBySeriesId, id)
    }

    public static async getSeriesDescriptionById(id: string): Promise<Overview | undefined> {
        return await ApiRequestController.getDataWithId(chOnce.GetOverviewBySeriesId, id)
    }

    public static sendFailedCover(failedCover: FailedCover): void {
        WorkerController.send(chListener.OnSeriesFailedCoverImage, failedCover)
    }

    public static saveSeriesInDB(id: string): void {
        WorkerController.send(chOnce.SaveSeriesInDB, id)
    }
}
