import ParrotDiscoApi from '../src/parrotDiscoApi';

describe(`Connecting`, () => {
    it(`Default constructor`, async () => {
        const drone: ParrotDiscoApi = new ParrotDiscoApi();

        await drone.connect();
    });
});
