import ParrotDiscoApi from '../parrotDiscoApi';

export default class MediaStreaming {
    constructor(private instance: ParrotDiscoApi) {}

    private setVideoStream(value: number) {
        this.instance.sendCommand([1, 'MediaStreaming', 'VideoEnable', value]);
    }

    public enableVideoStream() {
        this.setVideoStream(1);
    }

    public disableVideoStream() {
        this.setVideoStream(0);
    }
}
