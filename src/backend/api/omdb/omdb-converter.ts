import MultiProviderResult from '../multi-provider-result';
import { Search } from './models/search-results';
import Name from '../../controller/objects/meta/name';
import { NameType } from '../../controller/objects/meta/name-type';
import OMDbProvider from './omdb-provider';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import { ImageSize } from '../../controller/objects/meta/image-size';
import { IdRequestResult } from './models/id-request-result';
import Overview from '../../controller/objects/meta/overview';
import Cover from '../../controller/objects/meta/cover';
import Genre from '../../controller/objects/meta/genre';

export default class OMDbConverter {

    convertSearchResult(entry: Search): MultiProviderResult {
        const pld = new InfoProviderLocalData(OMDbProvider.instance);
        pld.addSeriesName(new Name(entry.Title, "en", NameType.OFFICIAL));
        pld.covers.push(new Cover(entry.Poster, ImageSize.ORIGINAL));
        pld.id = entry.imdbID;
        pld.hasFullInfo = false;
        pld.rawEntry = entry;

        return new MultiProviderResult(pld);
    }

    convertIdRequest(entry: IdRequestResult): MultiProviderResult {
        const pld = new InfoProviderLocalData(OMDbProvider.instance);
        pld.addSeriesName(new Name(entry.Title, "en", NameType.OFFICIAL));
        pld.covers.push(new Cover(entry.Poster, ImageSize.ORIGINAL));
        pld.id = entry.imdbID;
        pld.hasFullInfo = true;
        pld.country = entry.Country;
        for (const genre of entry.Genre.split(' ')) {
            pld.genres.push(new Genre(genre));
        }
        pld.releaseYear = new Date(entry.Released).getFullYear();
        pld.addOverview(new Overview(entry.Plot, 'en'));
        pld.rawEntry = entry;


        return new MultiProviderResult(pld);
    }
} 
