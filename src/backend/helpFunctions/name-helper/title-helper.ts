import Name from '../../controller/objects/meta/name';

export default class TitleHelper {
    public static getAllNamesSortedBySearchAbleScore(names: Name[]): Name[] {
        return names.sort((a, b) => Name.getSearchAbleScore(b, names) - Name.getSearchAbleScore(a, names));
    }
}
