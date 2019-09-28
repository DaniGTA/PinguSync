
import { InfoProviderLocalData } from '../../src/backend/controller/objects/info-provider-local-data';
import { ListProviderLocalData } from '../../src/backend/controller/objects/list-provider-local-data';
import Episode from '../../src/backend/controller/objects/meta/episode/episode';
import Series from '../../src/backend/controller/objects/series';
import EpisodeMappingHelper from '../../src/backend/helpFunctions/episode-mapping-helper/episode-mapping-helper';
import { strictEqual, fail } from 'assert';
import ListController from '../../src/backend/controller/list-controller';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import MainListLoader from '../../src/backend/controller/main-list-manager/main-list-loader';
import ProviderList from '../../src/backend/controller/provider-manager/provider-list';
import TestProvider from '../controller/objects/testClass/testProvider';

describe('episode mapping helper tests', () => {
    var lc = new ListController(true);

    before(() => {
        MainListManager['listLoaded'] = true;
        MainListLoader['loadData'] = () => { return [] };
        MainListLoader['saveData'] = async () => { };
    })
    beforeEach(() => {
        ProviderList['loadedListProvider'] = [new TestProvider("Test"), new TestProvider("")];
        ProviderList['loadedInfoProvider'] = [];
        MainListManager['mainList'] = [];
    })
    it('should map same episodes length from different providers', async () => {
         const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('testA'); 
        aProvider.targetSeason = 1;
        aProvider.detailEpisodeInfo.push(new Episode(1));
        aProvider.detailEpisodeInfo.push(new Episode(2));
        aProvider.detailEpisodeInfo.push(new Episode(3));
        
        aSeries.addProviderDatas(aProvider);
        
        // B Site
        
        const bProvider = new ListProviderLocalData('testB');
        bProvider.targetSeason = 1;
        bProvider.detailEpisodeInfo.push(new Episode(1, 1));
        bProvider.detailEpisodeInfo.push(new Episode(2, 1));
        bProvider.detailEpisodeInfo.push(new Episode(3, 1));
        
        aSeries.addProviderDatas(bProvider);

        // Testing
        
        const episodeMappingInstance = new EpisodeMappingHelper();
        const result = await episodeMappingInstance.generateEpisodeMapping(aSeries);

        // Extract results.

        const aEpisodeInfo1 = result.find(x => x.id == aProvider.detailEpisodeInfo[0].id);
        const aEpisodeInfo2 = result.find(x => x.id == aProvider.detailEpisodeInfo[1].id);
        const aEpisodeInfo3 = result.find(x => x.id == aProvider.detailEpisodeInfo[2].id);

        const bEpisodeInfo1 = result.find(x => x.id == bProvider.detailEpisodeInfo[0].id);
        const bEpisodeInfo2 = result.find(x => x.id == bProvider.detailEpisodeInfo[1].id);
        const bEpisodeInfo3 = result.find(x => x.id == bProvider.detailEpisodeInfo[2].id);
        
        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(aEpisodeInfo1.mappedTo[0].id, bEpisodeInfo1.id);
            strictEqual(aEpisodeInfo2.mappedTo[0].id, bEpisodeInfo2.id);
            strictEqual(aEpisodeInfo3.mappedTo[0].id, bEpisodeInfo3.id);

            strictEqual(bEpisodeInfo1.mappedTo[0].id, aEpisodeInfo1.id);
            strictEqual(bEpisodeInfo2.mappedTo[0].id, aEpisodeInfo2.id);
            strictEqual(bEpisodeInfo3.mappedTo[0].id, aEpisodeInfo3.id);
        }
    });

});
