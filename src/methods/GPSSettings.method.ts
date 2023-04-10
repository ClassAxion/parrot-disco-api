import ParrotDiscoApi from '../parrotDiscoApi';

export default class GPSSettings {
    constructor(private instance: ParrotDiscoApi) {}

    public setHomeType(type: number) {
        this.instance.sendCommand([1, 'GPSSettings', 'HomeType', type]);
    }

    public setHomeLocation(lat: number, lng: number, alt: number = 0) {
        this.instance.sendCommand([1, 'GPSSettings', 'SetHome', lat, lng, alt]);
    }

    public sendControllerGPS(
        lat: number,
        lng: number,
        altitude: number,
        horizontalAccuracy: number = 3.0,
        verticalAccuracy: number = 3.0,
    ) {
        this.instance.sendCommand([
            1,
            'GPSSettings',
            'SendControllerGPS',
            lat,
            lng,
            altitude,
            horizontalAccuracy,
            verticalAccuracy,
        ]);
    }

    public resetHome() {
        this.instance.sendCommand([1, 'GPSSettings', 'ResetHome']);
    }

    public setMinAltitude(altitude: number = 100) {
        this.instance.sendCommand([1, 'GPSSettings', 'ReturnHomeMinAltitude', altitude]);
    }
}
