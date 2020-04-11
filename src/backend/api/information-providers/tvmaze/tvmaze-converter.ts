import Cover from '../../../controller/objects/meta/cover';
import Genre from '../../../controller/objects/meta/genre';
import { ImageSize } from '../../../controller/objects/meta/image-size';
import { MediaType } from '../../../controller/objects/meta/media-type';
import Name from '../../../controller/objects/meta/name';
import { NameType } from '../../../controller/objects/meta/name-type';
import Overview from '../../../controller/objects/meta/overview';
import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import ProviderLocalDataWithSeasonInfo from '../../../helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import MultiProviderResult from '../../provider/multi-provider-result';
import TVDBProvider from '../tvdb/tvdb-provider';
import { Show, Type } from './models/tvmaze-model';
import TVMazeProvider from './tvmaze-provider';

export default class TVMazeConverter {

    public convertShowToResult(show: Show): MultiProviderResult {
        const pld = new InfoProviderLocalData(show.id, TVMazeProvider.instance);
        pld.addSeriesName(new Name(show.name, 'en', NameType.OFFICIAL));
        if (show.image) {
            pld.covers.push(new Cover(show.image.original, ImageSize.ORIGINAL));
            pld.covers.push(new Cover(show.image.medium, ImageSize.MEDIUM));
        }
        if (show._embedded) {
            for (const aka of show._embedded.akas) {
                if (aka.country) {
                    pld.addSeriesName(new Name(aka.name, aka.country.name, NameType.OFFICIAL));
                } else {
                    pld.addSeriesName(new Name(aka.name, '', NameType.UNKNOWN));
                }
            }
        }
        for (const genere of show.genres) {
            pld.genres.push(new Genre(genere));
        }

        pld.mediaType = this.convertTypeToMediaType(show.type);
        pld.rawEntry = show;


        if (show.rating.average) {
            pld.score = show.rating.average;
        }
        if (show.runtime) {
            pld.runTime = show.runtime;
        }
        if (show.premiered) {
            pld.releaseYear = new Date(show.premiered).getFullYear();
        }
        if (show.summary) {
            pld.addOverview(new Overview(show.summary, 'en'));
        }
        const mpr = new MultiProviderResult(pld);
        if (show.externals.thetvdb) {
            const tvdbProvider = new InfoProviderLocalData(show.externals.thetvdb, TVDBProvider.Instance);
            mpr.subProviders.push(new ProviderLocalDataWithSeasonInfo(tvdbProvider));
        }
        return mpr;
    }

    public convertTypeToMediaType(type: Type): MediaType {
        switch (type) {
            case Type.Animation:
                return MediaType.ANIME;
            case Type.Reality:
                return MediaType.SERIES;
        }
        return MediaType.UNKOWN;
    }
}
