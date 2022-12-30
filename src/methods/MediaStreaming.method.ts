import ParrotDiscoApi from '../parrotDiscoApi';

export default class MediaStreaming {
    constructor(private instance: ParrotDiscoApi) {}

    private setVideoStream(value: number) {
        this.instance.sendCommand([1, 'MediaStreaming', 'VideoEnable', value]);
    }

    private setVideoStreamMode(mode: string) {
        let value = 0;

        switch (mode) {
            case 'low_latency':
                value = 0;
                break;
            case 'high_reliability':
                value = 1;
                break;
            case 'high_reliability_low_framerate':
                value = 2;
                break;
        }

        this.instance.sendCommand([1, 'MediaStreaming', 'VideoStreamMode', value]);
    }

    public enableVideoStream() {
        this.setVideoStream(1);
    }

    public disableVideoStream() {
        this.setVideoStream(0);
    }
}
