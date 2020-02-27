import AniListProvider from '../../../src/backend/api/anilist/anilist-provider';
import TraktProvider from '../../../src/backend/api/trakt/trakt-provider';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import Episode from '../../../src/backend/controller/objects/meta/episode/episode';
import Season from '../../../src/backend/controller/objects/meta/season';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import TestProvider from '../../controller/objects/testClass/testProvider';
import TestHelper from '../../test-helper';

describe('Episode rated equality helper tests | Difference calc only', () => {
    beforeEach(() => {
        TestHelper.mustHaveBefore();
        ProviderList['loadedListProvider'] = [new TestProvider('Test'), new TestProvider('')];
        ProviderList['loadedInfoProvider'] = [];
        MainListManager['mainList'] = [];
    });

    test('should filter unnecessery episodes out', async () => {
        // Provider: a (ep: 2)
        const aProvider = new ListProviderLocalData('-1', AniListProvider);
        const aEp1 = new Episode(1);
        const aEp2 = new Episode(2);
        aProvider.addDetailedEpisodeInfos(aEp1, aEp2);
        // Provider: a end

        // Provider: b (ep: 4, seasons: 2)
        const bProvider = new ListProviderLocalData('-1', TraktProvider);
        const bEp1s1 = new Episode(1, new Season(1));
        const bEp2s1 = new Episode(2, new Season(1));
        const bEp1s2 = new Episode(1, new Season(2));
        const bEp2s2 = new Episode(2, new Season(2));
        bProvider.addDetailedEpisodeInfos(bEp1s1, bEp2s1, bEp1s2, bEp2s2);
        // Provider: b end

        
    });

});