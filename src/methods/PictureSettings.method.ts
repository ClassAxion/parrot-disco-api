import ParrotDiscoApi from '../parrotDiscoApi';

export default class PictureSettings {
    constructor(private instance: ParrotDiscoApi) {}

    public setFormat(format: string) {
        let value = 0;

        switch (format) {
            case 'raw':
                value = 0;
                break;
            case 'jpeg':
                value = 1;
                break;
            case 'snapshot':
                value = 2;
                break;
            case 'jpeg_fisheye':
                value = 3;
                break;
        }

        this.instance.sendCommand([1, 'PictureSettings', 'PictureFormatSelection', value]);
    }

    public setWhiteBalanceMode(mode: string) {
        let value = 0;

        switch (mode) {
            case 'auto':
                value = 0;
                break;
            case 'tungsten':
                value = 1;
                break;
            case 'daylight':
                value = 2;
                break;
            case 'cloudy':
                value = 3;
                break;
            case 'cool_white':
                value = 4;
                break;
        }

        this.instance.sendCommand([1, 'PictureSettings', 'AutoWhiteBalanceSelection', value]);
    }

    public setExposition(value: number) {
        this.instance.sendCommand([1, 'PictureSettings', 'ExpositionSelection', value]);
    }

    public setSaturation(value: number) {
        this.instance.sendCommand([1, 'PictureSettings', 'SaturationSelection', value]);
    }

    public setTimelapse(enabled: number, interval: number = 1) {
        this.instance.sendCommand([1, 'PictureSettings', 'TimelapseSelection', enabled, interval]);
    }

    public setStabilizationMode(mode: string) {
        let value = 0;

        switch (mode) {
            case 'roll_pitch':
                value = 0;
                break;
            case 'pitch':
                value = 1;
                break;
            case 'roll':
                value = 2;
                break;
            case 'none':
                value = 3;
                break;
        }

        this.instance.sendCommand([1, 'PictureSettings', 'VideoStabilizationMode', value]);
    }

    public setRecordingMode(mode: string) {
        let value = 0;

        switch (mode) {
            case 'quality':
                value = 0;
                break;
            case 'time':
                value = 1;
                break;
        }

        this.instance.sendCommand([1, 'PictureSettings', 'VideoRecordingMode', value]);
    }

    public setVideoFramerate(framerate: string) {
        let value = 0;

        switch (framerate) {
            case '24_FPS':
                value = 0;
                break;
            case '25_FPS':
                value = 1;
                break;
            case '30_FPS':
                value = 2;
                break;
        }

        this.instance.sendCommand([1, 'PictureSettings', 'VideoFramerate', value]);
    }

    public setVideoResolutions(resolutions: string) {
        let value = 0;

        switch (resolutions) {
            case 'rec1080_stream480':
                value = 0;
                break;
            case 'rec720_stream720':
                value = 1;
                break;
        }

        this.instance.sendCommand([1, 'PictureSettings', 'VideoResolutions', value]);
    }
}
