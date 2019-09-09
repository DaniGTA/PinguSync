import MultiProviderResult from '../multi-provider-result';
import { Show, Type } from './models/tvmaze-model';
import Name from '../../controller/objects/meta/name';
import { NameType } from '../../controller/objects/meta/name-type';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import Cover from '../../controller/objects/meta/cover';
import { ImageSize } from '../../controller/objects/meta/image-size';
import Overview from '../../controller/objects/meta/overview';
import TVDBProvider from '../tvdb/tvdb-provider';
import TVMazeProvider from './tvmaze-provider';
import { MediaType } from '../../controller/objects/meta/media-type';

export default class TVMazeConverter {

    convertShowToResult(show: Show): MultiProviderResult {
        const pld = new InfoProviderLocalData(TVMazeProvider.instance);
        pld.addSeriesName(new Name(show.name, "en", NameType.OFFICIAL));
        if (show.image) {
            pld.covers.push(new Cover(show.image.original, ImageSize.ORIGINAL));
            pld.covers.push(new Cover(show.image.medium, ImageSize.MEDIUM));
        }
        if (show._embedded) {
            for (const aka of show._embedded.akas) {
                if (aka.country) {
                    pld.addSeriesName(new Name(aka.name, aka.country.name, NameType.OFFICIAL));
                } else {
                    pld.addSeriesName(new Name(aka.name, "", NameType.UNKNOWN));
                }
            }
        }

        pld.genre = show.genres;
        pld.mediaType = this.convertTypeToMediaType(show.type);
        pld.id = show.id;

        if (show.rating.average)
            pld.score = show.rating.average;
        if (show.runtime)
            pld.runTime = show.runtime;
        if (show.premiered)
            pld.releaseYear = new Date(show.premiered).getFullYear();
        if (show.summary)
            pld.addOverview(new Overview(show.summary, 'en'));
        const mpr = new MultiProviderResult(pld);
        if (show.externals.thetvdb) {
            const tvdbProvider = new InfoProviderLocalData(new TVDBProvider());
            tvdbProvider.fullInfo = false;
            tvdbProvider.id = show.externals.thetvdb;
            mpr.subProviders.push(tvdbProvider);
        }
        return mpr;
    }

    convertTypeToMediaType(type: Type): MediaType {
        switch (type) {
            case Type.Animation:
                return MediaType.ANIME;
            case Type.Reality:
                return MediaType.SERIES;
        }
        return MediaType.UNKOWN;
    }
} 
