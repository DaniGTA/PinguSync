import { ImageSize } from './image-size';

/**
 * Big size images that can cover a background or sized like a banner.
 * You can defined it better with the Image size parameter (Default is: UNKOWN)
 */
export default class Banner {
    public url: string;
    public size: ImageSize;
    constructor(url: string, size: ImageSize = ImageSize.UNKNOWN) {
        this.url = url;
        this.size = size;
    }
}
