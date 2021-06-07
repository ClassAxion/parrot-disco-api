import ParrotDiscoApi from '../parrotDiscoApi';

export default class MediaStreaming {
    constructor(private instance: ParrotDiscoApi) {}

    private setVideoStream(value: number) {
        this.instance.sendCommand([1, 'MediaStreaming', 'VideoEnable', value]);
    }

    enableVideoStream() {
        this.setVideoStream(1);
    }

    disableVideoStream() {
        this.setVideoStream(0);
    }
}
