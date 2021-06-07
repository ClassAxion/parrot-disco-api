import net from 'net';
import dgram from 'dgram';
import EventEmitter from 'events';

import ParrotDiscoConfig from './interfaces/ParrotDiscoConfig.interface';
import ParrotDiscoSockets from './interfaces/ParrotDiscoSockets.interface';
import ParrotDiscoNetworkFrame from 'interfaces/ParrotDiscoNetworkFrame.interface';

import { Constants } from './enums/constants.enum';
import NetworkFrameGenerator from './utils/networkFrameGenerator.util';

import networkFrameParser from './utils/networkFrameParser.util';
import commandToBuffer from './utils/commandToBuffer.util';

import MediaStreaming from 'methods/MediaStreaming.method';

export default class ParrotDisco extends EventEmitter {
    private sockets: ParrotDiscoSockets;
    private packetSendingInterval: NodeJS.Timeout;
    public networkFrameGenerator: Function = NetworkFrameGenerator();
    private pilotingData: { flag?: number; roll?: number; pitch?: number; yaw?: number; gaz?: number; psi?: number } =
        {};
    private navData: { flyingTime?: number } = {};

    public MediaStreaming: MediaStreaming;

    private defaultConfig(): void {
        this.config.ip = this.config.ip || '192.168.42.1';

        this.config.c2dPort = this.config.c2dPort || 54321;
        this.config.d2cPort = this.config.d2cPort || 9988;

        this.config.discoveryPort = this.config.discoveryPort || 44444;
        this.config.discoveryTimeout = this.config.discoveryTimeout || 5000;

        this.config.streamControlPort = this.config.streamControlPort || 55005;
        this.config.streamVideoPort = this.config.streamVideoPort || 55004;
    }

    private createSockets(): void {
        this.sockets = {
            c2d: dgram.createSocket('udp4'),
            d2c: dgram.createSocket('udp4'),
            discovery: new net.Socket(),
        };
    }

    private initializeMethods() {
        this.MediaStreaming = new MediaStreaming(this);
    }

    private async discover(): Promise<boolean> {
        this.sockets.discovery.setTimeout(this.config.discoveryTimeout);

        const self = this;

        this.sockets.discovery.connect(
            this.config.discoveryPort,
            this.config.ip,
            function () {
                self.sockets.discovery.write(
                    JSON.stringify({
                        controller_type: 'Skycontroller 2 Dummy',
                        controller_name: 'Parrot-Disco-API-V1-0',
                        d2c_port: this.config.d2cPort,
                        arstream2_client_stream_port: this.config.streamVideoPort,
                        arstream2_client_control_port: this.config.streamControlPort,
                        arstream2_supported_metadata_version: 1,
                        qos_mode: 1,
                    }),
                );
            }.bind(this),
        );

        return new Promise((callback) => {
            this.sockets.discovery.once('timeout', function () {
                self.sockets.discovery.destroy();

                callback(false);
            });

            this.sockets.discovery.on(
                'data',
                function () {
                    self.sockets.discovery.destroy();

                    callback(true);
                }.bind(this),
            );
        });
    }

    constructor(private config: ParrotDiscoConfig = {}) {
        super();

        this.defaultConfig();
        this.createSockets();
    }

    private onPacket(message) {
        const networkFrame: ParrotDiscoNetworkFrame = networkFrameParser(message);

        console.log(`Got new frame`, networkFrame);

        if (networkFrame.id === Constants.ARNETWORK_MANAGER_INTERNAL_BUFFER_ID_PING) {
            this.navData.flyingTime =
                networkFrame.data.readUInt32LE(0) + networkFrame.data.readUInt32LE(4) / 1000000000.0;

            this.sendPong(networkFrame.data);
        }
    }

    private sendPong(data: any) {
        this.sendPacket(
            this.networkFrameGenerator(
                data,
                Constants.ARNETWORKAL_FRAME_TYPE_DATA,
                Constants.ARNETWORK_MANAGER_INTERNAL_BUFFER_ID_PONG,
            ),
        );
    }

    public sendCommand(command: any[]) {
        const buffer = commandToBuffer(command[0], command[1], command[2], command[3]);

        this.sendPacket(this.networkFrameGenerator(buffer));
    }

    public sendPacket(packet) {
        this.sockets.c2d.send(packet, 0, packet.length, this.config.c2dPort, this.config.ip, function (err) {
            if (err) {
                throw err;
            }
        });
    }

    private sendPilotingData() {
        const buffer = Buffer.alloc(13);

        buffer.writeUInt8(Constants.ARCOMMANDS_ID_PROJECT_ARDRONE3, 0);
        buffer.writeUInt8(Constants.ARCOMMANDS_ID_ARDRONE3_CLASS_PILOTING, 1);
        buffer.writeUInt16LE(Constants.ARCOMMANDS_ID_ARDRONE3_PILOTING_CMD_PCMD, 2);
        buffer.writeUInt8(this.pilotingData.flag || 0, 4);
        buffer.writeInt8(this.pilotingData.roll || 0, 5);
        buffer.writeInt8(this.pilotingData.pitch || 0, 6);
        buffer.writeInt8(this.pilotingData.yaw || 0, 7);
        buffer.writeInt8(this.pilotingData.gaz || 0, 8);
        buffer.writeFloatLE(this.pilotingData.psi || 0, 9);

        this.sendPacket(this.networkFrameGenerator(buffer));
    }

    private startPacketSending(speed: number = 25) {
        this.packetSendingInterval = setInterval(
            function () {
                this.sendPilotingData();
            }.bind(this),
            speed,
        );
    }

    private stopPacketSending() {
        clearInterval(this.packetSendingInterval);
    }

    private sendAllStates() {
        const buffer = Buffer.alloc(4);

        buffer.writeUInt8(Constants.ARCOMMANDS_ID_PROJECT_COMMON, 0);
        buffer.writeUInt8(Constants.ARCOMMANDS_ID_COMMON_CLASS_COMMON, 1);
        buffer.writeUInt16LE(Constants.ARCOMMANDS_ID_COMMON_COMMON_CMD_ALLSTATES, 2);

        this.sendPacket(this.networkFrameGenerator(buffer));
    }

    async connect(): Promise<boolean> {
        const discovered = await this.discover();

        if (!discovered) return false;

        this.sockets.d2c.bind(this.config.d2cPort);
        this.sockets.d2c.on('message', this.onPacket.bind(this));

        this.startPacketSending();

        this.sendAllStates();

        this.initializeMethods();

        return true;
    }
}
