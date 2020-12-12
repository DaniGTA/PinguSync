import Banner from '../../../src/backend/controller/objects/meta/banner';
import Cover from '../../../src/backend/controller/objects/meta/cover';
import Episode from '../../../src/backend/controller/objects/meta/episode/episode';
import Genre from '../../../src/backend/controller/objects/meta/genre';
import { ImageSize } from '../../../src/backend/controller/objects/meta/image-size';
import Season from '../../../src/backend/controller/objects/meta/season';
import { ProviderInfoStatus } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import { ListType } from '../../../src/backend/controller/settings/models/provider/list-types';
import WatchHistory from '../../../src/backend/controller/objects/meta/episode/episode-watch-history';

describe('listProviderLocalData tests', () => {
    test('should merge two', () => {
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

        const merged = ListProviderLocalData.mergeProviderInfos(a, b);
        expect(merged.covers.length).toBe(1);
        expect(merged.episodes).toBe(14);
        expect(merged.publicScore).toBe(20);
        expect(merged.score).toBe(40);
        expect(merged.infoStatus).toBe(ProviderInfoStatus.FULL_INFO);
        expect(merged.watchStatus).toBe(ListType.COMPLETED);
        return;
    });

    test('should merge three', () => {
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


        const merged = ListProviderLocalData.mergeProviderInfos(a, b, c);
        expect(merged.covers.length).toBe(2);
        expect(merged.episodes).toBe(15);
        expect(merged.publicScore).toBe(20);
        expect(merged.lastUpdate.getTime()).toBe(new Date(20000).getTime());
        return;
    });
    test('should merge provider watchHistory', () => {
        const a = new ListProviderLocalData(1);
        a['detailEpisodeInfo'].push(new Episode(1));

        const b = new ListProviderLocalData(1);
        const bEp = new Episode(1);
        bEp.watchHistory.push(new WatchHistory());
        b['detailEpisodeInfo'].push(bEp);

        const merged = ListProviderLocalData.mergeProviderInfos(a, b);

        expect(merged['detailEpisodeInfo'][0].watchHistory.length).not.toBe(0);
    });

    test('should not merge same cover', () => {
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


        const merged = ListProviderLocalData.mergeProviderInfos(c, b, a);
        expect(merged.covers.length).toBe(1);
        expect(merged.episodes).toBe(15);
        expect(merged.publicScore).toBe(25);
        expect(merged.lastUpdate.getTime()).toBe(2);
        expect(merged.score).toBe(40);
        expect(merged.isNSFW).toBe(true);
        return;
    });

    test('should not dublicate lists', () => {
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


        const merged = ListProviderLocalData.mergeProviderInfos(b, a);
        expect(merged.covers.length).toBe(1);
        expect(merged.episodes).toBe(13);
        expect(merged.publicScore).toBe(20);
        expect(merged.lastUpdate.getTime()).toBe(1);
        expect(merged.score).toBe(20);
        expect(merged.alternativeIds.length).toBe(1);
        expect(merged.banners.length).toBe(2);
        expect(merged.genres.length).toBe(1);
        expect(merged['detailEpisodeInfo'].length).toBe(1);
        expect(merged.prequelIds.length).toBe(1);
        expect(merged.sequelIds.length).toBe(1);
        return;
    });
});
