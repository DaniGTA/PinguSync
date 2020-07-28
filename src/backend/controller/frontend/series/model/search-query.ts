import { SearchFilter } from './search-filter';

export interface SearchQuery {
    searchString: string;
    filter?: SearchFilter;
}