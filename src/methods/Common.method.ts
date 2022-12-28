import ParrotDiscoApi from '../parrotDiscoApi';

export default class Common {
    constructor(private instance: ParrotDiscoApi) {}

    public triggerAllStates() {
        this.instance.sendCommand([0, 'Common', 'AllStates']);
    }
}
