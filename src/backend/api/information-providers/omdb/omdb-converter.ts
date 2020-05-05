import Cover from '../../../controller/objects/meta/cover';
import Genre from '../../../controller/objects/meta/genre';
import { ImageSize } from '../../../controller/objects/meta/image-size';
import { MediaType } from '../../../controller/objects/meta/media-type';
import Name from '../../../controller/objects/meta/name';
import { NameType } from '../../../controller/objects/meta/name-type';
import Overview from '../../../controller/objects/meta/overview';
import { InfoProviderLocalData } from '../../../controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ProviderInfoStatus } from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';
import MultiProviderResult from '../../provider/multi-provider-result';
import { IdRequestResult } from './models/id-request-result';
import { Search } from './models/search-results';
import OMDbProvider from './omdb-provider';

export default class OMDbConverter {

    public convertSearchResult(entry: Search): MultiProviderResult {
        const pld = new InfoProviderLocalData(entry.imdbID, OMDbProvider.instance);
        pld.addSeriesName(new Name(entry.Title, 'en', NameType.OFFICIAL));
        if (entry.Poster !== 'N/A') {
            pld.covers.push(new Cover(entry.Poster, ImageSize.ORIGINAL));
        }
        pld.infoStatus = ProviderInfoStatus.BASIC_INFO;
        pld.rawEntry = entry;
        pld.releaseYear = Number(entry.Year);
        pld.mediaType = this.convertStringToType(entry.Type);

        return new MultiProviderResult(pld);
    }

    public convertIdRequest(entry: IdRequestResult): MultiProviderResult {
        const pld = new InfoProviderLocalData(entry.imdbID, OMDbProvider.instance);
        pld.addSeriesName(new Name(entry.Title, 'en', NameType.OFFICIAL));
        pld.covers.push(new Cover(entry.Poster, ImageSize.ORIGINAL));
        pld.infoStatus = ProviderInfoStatus.FULL_INFO;
        pld.country = entry.Country;
        for (const genre of entry.Genre.split(' ')) {
            pld.genres.push(new Genre(genre));
        }
        pld.releaseYear = new Date(entry.Released).getFullYear();
        pld.addOverview(new Overview(entry.Plot, 'en'));
        pld.rawEntry = entry;


        return new MultiProviderResult(pld);
    }

    private convertStringToType(mediaType: string): MediaType {
        switch (mediaType) {
            case 'movie':
                return MediaType.MOVIE;
            case 'series':
                return MediaType.SERIES;
            case 'game':
                return MediaType.UNKOWN;
            default:
                return MediaType.UNKOWN;
        }
    }
}
