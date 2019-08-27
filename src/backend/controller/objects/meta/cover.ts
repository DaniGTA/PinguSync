import { ImageSize } from './image-size';

export default class Cover {
    public url: string;
    public size: ImageSize;
    constructor(url: string, size: ImageSize = ImageSize.UNKNOWN) {
        this.url = url;
        this.size = size;
    }
}