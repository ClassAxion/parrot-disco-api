import ParrotDiscoApi from '../parrotDiscoApi';

export default class MediaRecord {
    constructor(private instance: ParrotDiscoApi) {}

    public takePicture() {
        this.instance.sendCommand([1, 'MediaRecord', 'PictureV2', 0]);
    }

    private setRecording(mode: number) {
        this.instance.sendCommand([1, 'MediaRecord', 'VideoV2', mode, 0]);
    }

    public startRecording() {
        this.setRecording(1);
    }

    public stopRecording() {
        this.setRecording(0);
    }
}
