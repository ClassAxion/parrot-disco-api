import ParrotDiscoApi from '../parrotDiscoApi';

export default class Calibration {
    constructor(private instance: ParrotDiscoApi) {}

    private setPitotTubeCalibration(value: number) {
        this.instance.sendCommand([0, 'Calibration', 'PitotCalibration', value]);
    }

    public startPitotTubeCalibration() {
        this.setPitotTubeCalibration(1);
    }

    public stopPitotTubeCalibration() {
        this.setPitotTubeCalibration(0);
    }

    private setMagnetoCalibration(value: number) {
        this.instance.sendCommand([0, 'Calibration', 'MagnetoCalibration', value]);
    }

    public startMagnetoCalibration() {
        this.setMagnetoCalibration(1);
    }

    public stopMagnetoCalibration() {
        this.setMagnetoCalibration(0);
    }
}
