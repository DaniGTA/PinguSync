import { ListType } from '../../backend/controller/settings/models/provider/list-types';
import WorkerController from '../../backend/communication/ipc-renderer-controller';
import { chOnce } from '../../backend/communication/channels';
import { FailedCover } from '../../backend/controller/frontend/series/model/failed-cover';
import { chListener } from '../../backend/communication/listener-channels';
import IdListWithListType from './model/id-list-with-list-type';
import Overview from '../../backend/controller/objects/meta/overview';
import ApiRequestController from './api-request-controller';
import { Action, Module, Mutation, MutationAction, VuexModule } from 'vuex-module-decorators';
import store from '../../store';
import { SearchQuery } from '../../backend/controller/frontend/series/model/search-query';

@Module({
    dynamic: true,
    name: 'seriesListViewController',
    store
})
export default class SeriesListViewController extends VuexModule {

    selectedListType: ListType = ListType.ALL;
    ids: IdListWithListType[] = [];
    get GET_selectedListType(): ListType {
        return this.selectedListType;
    }

    @Mutation
    SET_selectedListType(value: ListType) {
        console.log('SetList' + value);
        this.selectedListType = value;
    }

    @Mutation
    public async getSeriesIdsFromCurrentlySelectedListType(): Promise<IdListWithListType[]> {
        const currentSelectedType = this.GET_selectedListType;
        console.log('GetList: ' + currentSelectedType);
        if (currentSelectedType == ListType.ALL) {
            const allListTypesWithoutAll = Object.keys(ListType).map(x => Number.parseInt(x) as ListType).filter(x => x !== ListType.ALL).reverse();
            return await SeriesListViewController.getSeriesIdsFromListTypes(allListTypesWithoutAll);
        } else {
            return SeriesListViewController.getSeriesIdsFromListTypes([currentSelectedType]);
        }
    }
    public static async getSeriesIdsFromListTypes(listTypes: ListType[]): Promise<IdListWithListType[]> {
        console.log('Get Series from listType: ' + listTypes);
        const idListsWN: IdListWithListType[] = [];
        for (const listType of listTypes) {
            const idList = await WorkerController.getOnce<string[]>(chOnce.GetSeriesIdsWithListType, listType);
            if (idList.length !== 0) {
                idListsWN.push({ ids: idList, listType: listType });
            }
        }
        return idListsWN;
    }
    @Action
    public async getSeriesCoverUrlById(id: string): Promise<string | undefined> {
        return await ApiRequestController.getDataWithId(chOnce.GetPreferedCoverUrlBySeriesId, id);
    }
    @Mutation
    public async search(query: SearchQuery): Promise<void> {
        if (query.searchString) {
            const result: string[] = await WorkerController.getOnce<string[]>(chOnce.SearchSeries, query);
            this.ids = [{ ids: result, listType: ListType.SearchResult }];
        } else {
            this.getSeriesIdsFromCurrentlySelectedListType();
        }
    }

    @Action
    public async getSeriesNameById(id: string): Promise<string | undefined> {
        return await ApiRequestController.getDataWithId(chOnce.GetPreferedNameBySeriesId, id);
    }
    @Action
    public async getSeriesDescriptionById(id: string): Promise<Overview | undefined> {
        return await ApiRequestController.getDataWithId(chOnce.GetOverviewBySeriesId, id);
    }
    @Action
    public sendFailedCover(failedCover: FailedCover): void {
        WorkerController.send(chListener.OnSeriesFailedCoverImage, failedCover);
    }
}
