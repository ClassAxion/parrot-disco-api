import ParrotDiscoApi from '../parrotDiscoApi';

export default class PictureSettings {
    constructor(private instance: ParrotDiscoApi) {}

    public setFormat(format: string) {
        this.instance.sendCommand([0, 'PictureSettings', 'PictureFormatSelection', format]);
    }

    public setWhiteBalanceMode(mode: string) {
        this.instance.sendCommand([0, 'PictureSettings', 'AutoWhiteBalanceSelection', mode]);
    }

    public setExposition(value: number) {
        this.instance.sendCommand([0, 'PictureSettings', 'ExpositionSelection', value]);
    }

    public setSaturation(value: number) {
        this.instance.sendCommand([0, 'PictureSettings', 'SaturationSelection', value]);
    }

    public setTimelapse(enabled: number, interval: number = 1) {
        this.instance.sendCommand([0, 'PictureSettings', 'TimelapseSelection', enabled, interval]);
    }

    public setStabilizationMode(mode: string) {
        this.instance.sendCommand([0, 'PictureSettings', 'VideoStabilizationMode', mode]);
    }

    public setRecordingMode(mode: string) {
        this.instance.sendCommand([0, 'PictureSettings', 'VideoRecordingMode', mode]);
    }

    public setVideoFramerate(framerate: string) {
        this.instance.sendCommand([0, 'PictureSettings', 'VideoFramerate', framerate]);
    }

    public setVideoResolutions(resolutions: string) {
        this.instance.sendCommand([0, 'PictureSettings', 'VideoResolutions', resolutions]);
    }
}
