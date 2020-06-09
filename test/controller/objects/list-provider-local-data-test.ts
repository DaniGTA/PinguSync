import { strictEqual } from 'assert';
import Banner from '../../../src/backend/controller/objects/meta/banner';
import Cover from '../../../src/backend/controller/objects/meta/cover';
import Episode from '../../../src/backend/controller/objects/meta/episode/episode';
import Genre from '../../../src/backend/controller/objects/meta/genre';
import { ImageSize } from '../../../src/backend/controller/objects/meta/image-size';
import Season from '../../../src/backend/controller/objects/meta/season';
import WatchProgress from '../../../src/backend/controller/objects/meta/watch-progress';
import { ProviderInfoStatus } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import { ListType } from '../../../src/backend/controller/settings/models/provider/list-types';

describe('listProviderLocalData tests', () => {
    test('should merge two', async () => {
        const a = new ListProviderLocalData(1);
        a.episodes = 13;
        a.publicScore = 20;
        a.lastUpdate = new Date(0);
        a.watchStatus = ListType.CURRENT;
        const b = new ListProviderLocalData(1);
        b.episodes = 14;
        b.publicScore = 20;
        b.score = 40;
        b.infoStatus = ProviderInfoStatus.FULL_INFO;
        b.watchStatus = ListType.COMPLETED;
        b.covers.push(new Cover(''));

        const merged = await ListProviderLocalData.mergeProviderInfos(a, b);
        strictEqual(merged.covers.length, 1, 'Cover merge failed');
        strictEqual(merged.episodes, 14, 'Episodes merge failed');
        strictEqual(merged.publicScore, 20, 'Public score merge failed');
        strictEqual(merged.score, 40, 'Score merge failed');
        strictEqual(merged.infoStatus, ProviderInfoStatus.FULL_INFO, 'Should add latest hasFullInfo');
        strictEqual(merged.watchStatus, ListType.COMPLETED, 'Should add latest watch status');
        return;
    });

    test('should merge three', async () => {
        const a = new ListProviderLocalData(1);
        a.episodes = 13;
        a.publicScore = 20;
        a.lastUpdate = new Date(0);
        a.covers.push(new Cover('c'));
        const b = new ListProviderLocalData(1);
        b.episodes = 14;
        b.publicScore = 20;
        b.lastUpdate = new Date(1);
        const c = new ListProviderLocalData(1);
        c.episodes = 15;
        c.publicScore = 20;
        c.lastUpdate = new Date(20000);
        c.covers.push(new Cover('x'));


        const merged = await ListProviderLocalData.mergeProviderInfos(a, b, c);
        strictEqual(merged.covers.length, 2, 'Cover merge failed');
        strictEqual(merged.episodes, 15, 'Episodes merge failed');
        strictEqual(merged.publicScore, 20, 'Public score merge failed');
        strictEqual(merged.lastUpdate.getTime(), new Date(20000).getTime(), 'Last update merge failed');
        return;
    });

    test('should not merge same cover', async () => {
        const a = new ListProviderLocalData(1);
        a.episodes = 13;
        a.publicScore = 20;
        a.isNSFW = true;
        a.lastUpdate = new Date(0);
        a.covers.push(new Cover('c'));
        const b = new ListProviderLocalData(1);
        b.episodes = 14;
        b.publicScore = 25;
        b.lastUpdate = new Date(1);
        const c = new ListProviderLocalData(1);
        c.episodes = 15;
        c.score = 40;
        c.lastUpdate = new Date(2);
        c.covers.push(new Cover('c'));


        const merged = await ListProviderLocalData.mergeProviderInfos(c, b, a);
        strictEqual(merged.covers.length, 1);
        strictEqual(merged.episodes, 15);
        strictEqual(merged.publicScore, 25);
        strictEqual(merged.lastUpdate.getTime(), 2);
        strictEqual(merged.score, 40);
        strictEqual(merged.isNSFW, true);
        return;
    });

    test('should not dublicate lists', async () => {
        const a = new ListProviderLocalData(1);
        a.episodes = 13;
        a.publicScore = 20;
        a.score = 20;
        a.lastUpdate = new Date(0);
        a.covers.push(new Cover('c'));
        a.alternativeIds.push(5);
        a.banners.push(new Banner('x', ImageSize.LARGE));
        a.banners.push(new Banner('d', ImageSize.LARGE));
        a.genres.push(new Genre('Action', 100));
        a.prequelIds.push(1);
        a.sequelIds.push(1);
        const episode = new Episode(5, new Season([1]));
        a.addDetailedEpisodeInfos(episode);
        const b = Object.assign(new ListProviderLocalData(1), a);
        b.lastUpdate = new Date(1);
        b.addDetailedEpisodeInfos(new Episode(5, new Season([1])));


        const merged = await ListProviderLocalData.mergeProviderInfos(b, a);
        strictEqual(merged.covers.length, 1);
        strictEqual(merged.episodes, 13);
        strictEqual(merged.publicScore, 20);
        strictEqual(merged.lastUpdate.getTime(), 1);
        strictEqual(merged.score, 20);
        strictEqual(merged.alternativeIds.length, 1);
        strictEqual(merged.banners.length, 2);
        strictEqual(merged.genres.length, 1);
        strictEqual(merged.detailEpisodeInfo.length, 1);
        strictEqual(merged.prequelIds.length, 1);
        strictEqual(merged.sequelIds.length, 1);
        return;
    });
});
