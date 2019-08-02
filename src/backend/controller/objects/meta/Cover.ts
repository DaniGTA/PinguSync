import { CoverSize } from './CoverSize';

export default class Cover{
    public url: string;
    public size: CoverSize;
    constructor(url:string,size:CoverSize = CoverSize.UNKNOWN){
        this.url = url;
        this.size = size;
    }
}