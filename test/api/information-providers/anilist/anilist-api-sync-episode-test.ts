import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import AniListProvider from '../../../../src/backend/api/information-providers/anilist/anilist-provider';
import Episode from '../../../../src/backend/controller/objects/meta/episode/episode';

describe('', () => {
    const aniListInstance = ProviderList.getProviderInstanceByClass(AniListProvider);
    it('should mark episode as watched test', async () => {
        const episode1 = new Episode(1);
        const episode2 = new Episode(2);
        const episode3 = new Episode(3);

        await aniListInstance.markEpisodeAsWatched([episode1, episode2, episode3]);
    });
});