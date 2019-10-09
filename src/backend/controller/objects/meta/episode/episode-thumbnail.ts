import { ImageSize } from '../image-size';

export default class EpisodeThumbnail {
    fullLink: string;
    size: ImageSize = ImageSize.UNKNOWN;
    constructor(fullLink: string, size: ImageSize = ImageSize.UNKNOWN) {
        this.fullLink = fullLink;
        this.size = size;

    }
}
