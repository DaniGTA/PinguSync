import Cover from '../../controller/objects/meta/cover';

export default class CoverHelper {
    public static getUniqueCoverList(a: Cover[], b?: Cover[]): Cover[] {
        const uniqueCoverList: Cover[] = [];
        for (const coverA of a) {
            let coverB: Cover[] = [];
            if (!b) {
                coverB = a.filter(x => x.url);
            } else {
                coverB = b.filter(x => x.url === coverA.url);
            }
            coverA.failed = (coverA.failed || !!coverB.find((x) => x.failed));

            if (!uniqueCoverList.find(x => x.url == coverA.url)) {
                uniqueCoverList.push(coverA);
            }

        }
        return uniqueCoverList;
    }
}
