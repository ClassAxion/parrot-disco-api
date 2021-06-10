import { expect } from 'chai';

import ParrotDiscoApi from '../src/parrotDiscoApi';

describe(`Basic tests`, () => {
    let drone: ParrotDiscoApi;

    it(`Create new instance`, () => {
        drone = new ParrotDiscoApi();
    });

    it(`Connect to drone`, async () => {
        const isConnected = await drone.connect();

        expect(isConnected).equal(true);
    });

    it(`Should receive any unknown events`, async () => {
        await new Promise((resolve) => drone.once('unknown', resolve));
    });

    it(`Move camera`, async () => {
        await drone.Camera.move(0, 0);
    });

    it(`Disconnect`, () => {
        drone.disconnect();
    });
});
