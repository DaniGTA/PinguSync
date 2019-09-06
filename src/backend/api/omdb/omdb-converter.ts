import MultiProviderResult from '../multi-provider-result';
import { Search } from './models/search-results';
import Name from '../../controller/objects/meta/name';
import { NameType } from '../../controller/objects/meta/name-type';
import OMDbProvider from './omdb-provider';
import { InfoProviderLocalData } from '../../controller/objects/info-provider-local-data';
import Cover from '../../controller/objects/meta/Cover';
import { ImageSize } from '../../controller/objects/meta/image-size';
import { IdRequestResult } from './models/id-request-result';
import Overview from '../../controller/objects/meta/overview';

export default class OMDbConverter {

    convertSearchResult(entry: Search): MultiProviderResult {
        const pld = new InfoProviderLocalData(OMDbProvider.instance);
        pld.addSeriesName(new Name(entry.Title, "en", NameType.OFFICIAL));
        pld.covers.push(new Cover(entry.Poster, ImageSize.ORIGINAL));
        pld.id = entry.imdbID;
        pld.fullInfo = false;

        return new MultiProviderResult(pld);
    }

    convertIdRequest(entry: IdRequestResult): MultiProviderResult {
        const pld = new InfoProviderLocalData(OMDbProvider.instance);
        pld.addSeriesName(new Name(entry.Title, "en", NameType.OFFICIAL));
        pld.covers.push(new Cover(entry.Poster, ImageSize.ORIGINAL));
        pld.id = entry.imdbID;
        pld.fullInfo = true;
        pld.country = entry.Country;
        pld.genre = entry.Genre.split(' ');
        pld.releaseYear = new Date(entry.Released).getFullYear();
        pld.addOverview(new Overview(entry.Plot, 'en'));

        return new MultiProviderResult(pld);
    }
} 
