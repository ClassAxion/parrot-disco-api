import ParrotDiscoApi from '../parrotDiscoApi';

export default class PilotingSettings {
    constructor(private instance: ParrotDiscoApi) {}

    public setMaxAltitude(altitude: number) {
        this.instance.sendCommand([1, 'PilotingSettings', 'MaxAltitude', altitude]);
    }

    public setMinAltitude(altitude: number) {
        this.instance.sendCommand([1, 'PilotingSettings', 'MinAltitude', altitude]);
    }

    public setMaxDistance(meters: number) {
        this.instance.sendCommand([1, 'PilotingSettings', 'MaxDistance', meters]);
    }

    public setGeofence(shouldNotFlyOver: number) {
        this.instance.sendCommand([1, 'PilotingSettings', 'NoFlyOverMaxDistance', shouldNotFlyOver]);
    }

    public setCirclingRadius(meters: number) {
        this.instance.sendCommand([1, 'PilotingSettings', 'CirclingRadius', meters]);
    }

    public setCirclingAltitude(meters: number) {
        this.instance.sendCommand([1, 'PilotingSettings', 'CirclingAltitude', meters]);
    }

    public setMotionDetection(enable: boolean) {
        this.instance.sendCommand([1, 'PilotingSettings', 'SetMotionDetectionMode', enable ? 1 : 0]);
    }
}
