import net from 'net';
import dgram from 'dgram';
import EventEmitter from 'events';

import ParrotDiscoConfig from './interfaces/ParrotDiscoConfig.interface';
import ParrotDiscoSockets from './interfaces/ParrotDiscoSockets.interface';
import ParrotDiscoNetworkFrame from 'interfaces/ParrotDiscoNetworkFrame.interface';

import { ParrotDiscoConstans } from './enums/ParrotDiscoConstans.enum';
import { ParrotDiscoFlyingState } from './enums/ParrotDiscoFlyingState.enum';

import NetworkFrameGenerator from './utils/networkFrameGenerator.util';
import types from './utils/types.util';
import networkFrameParser from './utils/networkFrameParser.util';
import commandToBuffer from './utils/commandToBuffer.util';

import MediaStreaming from './methods/MediaStreaming.method';
import Camera from './methods/Camera.method';
import Piloting from './methods/Piloting.method';
import Mavlink from './methods/Mavlink.method';
import GPSSettings from './methods/GPSSettings.method';

const Commands = require('./statics/commands.static.json');

export default class ParrotDisco extends EventEmitter {
    private sockets: ParrotDiscoSockets;

    private packetSendingInterval: NodeJS.Timeout;
    private aliveCheckingInterval: NodeJS.Timeout;

    private lastPacketReceivedAt: Date;
    private connectionTimeout = 5000;

    public networkFrameGenerator: Function = NetworkFrameGenerator();

    public pilotingData: { flag?: number; roll?: number; pitch?: number; yaw?: number; gaz?: number; psi?: number } =
        {};
    public navData: { flyingTime?: number; battery?: number; flyingState?: ParrotDiscoFlyingState } = {};

    public MediaStreaming: MediaStreaming;
    public Camera: Camera;
    public Piloting: Piloting;
    public Mavlink: Mavlink;
    public GPSSettings: GPSSettings;

    private defaultConfig(): void {
        this.config.ip = this.config.ip || '192.168.42.1';

        this.config.c2dPort = this.config.c2dPort || 54321;
        this.config.d2cPort = this.config.d2cPort || 9988;

        this.config.discoveryPort = this.config.discoveryPort || 44444;
        this.config.discoveryTimeout = this.config.discoveryTimeout || 5000;

        this.config.streamControlPort = this.config.streamControlPort || 55005;
        this.config.streamVideoPort = this.config.streamVideoPort || 55004;

        this.config.debug = this.config.debug || false;
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
        this.Camera = new Camera(this);
        this.Piloting = new Piloting(this);
        this.Mavlink = new Mavlink(this);
        this.GPSSettings = new GPSSettings(this);
    }

    public async discover(): Promise<boolean> {
        try {
            this.sockets.discovery.connect(this.config.discoveryPort, this.config.ip, () => {
                this.sockets.discovery.write(
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
            });

            this.sockets.discovery.setTimeout(this.config.discoveryTimeout);

            return new Promise((callback) => {
                this.sockets.discovery.once('timeout', () => {
                    this.sockets.discovery.destroy();

                    callback(false);
                });

                this.sockets.discovery.once('data', () => {
                    this.sockets.discovery.destroy();

                    this.emit('connected');

                    callback(true);
                });

                this.sockets.discovery.once('error', () => {
                    this.sockets.discovery.destroy();

                    callback(false);
                });
            });
        } catch {
            this.sockets.discovery.destroy();

            return false;
        }
    }

    constructor(private config: ParrotDiscoConfig = {}) {
        super();

        this.defaultConfig();
        this.createSockets();
    }

    public isAlive(): boolean {
        return !this.lastPacketReceivedAt
            ? true
            : Date.now() - this.lastPacketReceivedAt.getTime() < this.connectionTimeout;
    }

    private onPacket(message) {
        this.lastPacketReceivedAt = new Date();

        const networkFrame: ParrotDiscoNetworkFrame = networkFrameParser(message);

        if (networkFrame.type === ParrotDiscoConstans.ARNETWORKAL_FRAME_TYPE_DATA_WITH_ACK) {
            this.sendAck(networkFrame);

            //console.debug(`Sent back ACK..`);
        }

        if (networkFrame.id === ParrotDiscoConstans.ARNETWORK_MANAGER_INTERNAL_BUFFER_ID_PING) {
            this.navData.flyingTime =
                networkFrame.data.readUInt32LE(0) + networkFrame.data.readUInt32LE(4) / 1000000000.0;

            this.sendPong(networkFrame.data);

            //console.debug(`Sent back Pong..`);
        }

        if (
            networkFrame.id === ParrotDiscoConstans.BD_NET_DC_EVENT_ID ||
            networkFrame.id === ParrotDiscoConstans.BD_NET_DC_NAVDATA_ID
        ) {
            const commandProject = networkFrame.data.readUInt8(0),
                commandClass = networkFrame.data.readUInt8(1),
                commandId = networkFrame.data.readUInt16LE(2);

            var offset = 4;
            var args = {};
            var event = null;

            try {
                event = Commands.find((o) => o.id == commandProject).class.find((o) => o.id == commandClass).cmd;
            } catch (err) {
                this.emit('unknown', networkFrame.data);

                //console.debug(`Got unknown frame`, networkFrame);
            }

            if (event) {
                if (event instanceof Array) {
                    event = event[commandId];

                    if (!event) {
                        this.emit('unknown', networkFrame.data);

                        //console.debug(`Got unknown frame`, networkFrame);

                        return;
                    }
                }

                try {
                    if (typeof event.arg !== 'undefined') {
                        if (event.arg instanceof Array) {
                            event.arg.forEach((arg) => {
                                if (types.hasOwnProperty(arg.type)) {
                                    args[arg.name] = types[arg.type].read(networkFrame.data, offset, arg);

                                    offset += types[arg.type].length;
                                }
                            });
                        } else if (event.arg instanceof Object) {
                            if (types.hasOwnProperty(event.arg.type)) {
                                args[event.arg.name] = types[event.arg.type].read(networkFrame.data, offset, event.arg);
                            }
                        }
                    }

                    this.emit(event.name, args);

                    if (this.config.debug) {
                        console.log(`Got`, event.name, JSON.stringify(args));
                    }
                } catch (_) {
                    console.error(`Parsing of ${event.name} failed`);
                }
            }

            switch (commandProject) {
                case ParrotDiscoConstans.ARCOMMANDS_ID_PROJECT_COMMON:
                    switch (commandClass) {
                        case ParrotDiscoConstans.ARCOMMANDS_ID_COMMON_CLASS_COMMONSTATE:
                            switch (commandId) {
                                case ParrotDiscoConstans.ARCOMMANDS_ID_COMMON_COMMONSTATE_CMD_BATTERYSTATECHANGED:
                                    this.navData.battery = networkFrame.data.readUInt8(4);

                                    this.emit('battery', this.navData.battery);
                                    break;
                            }
                            break;
                    }
                    break;
                case ParrotDiscoConstans.ARCOMMANDS_ID_PROJECT_ARDRONE3:
                    switch (commandClass) {
                        case ParrotDiscoConstans.ARCOMMANDS_ID_ARDRONE3_CLASS_PILOTINGSTATE:
                            switch (commandId) {
                                case ParrotDiscoConstans.ARCOMMANDS_ID_ARDRONE3_PILOTINGSTATE_CMD_FLATTRIMCHANGED:
                                    break;
                                case ParrotDiscoConstans.ARCOMMANDS_ID_ARDRONE3_PILOTINGSTATE_CMD_FLYINGSTATECHANGED:
                                    switch (networkFrame.data.readInt32LE(4)) {
                                        case ParrotDiscoConstans.ARCOMMANDS_ARDRONE3_PILOTINGSTATE_FLYINGSTATECHANGED_STATE_LANDED:
                                            this.navData.flyingState = ParrotDiscoFlyingState.LANDED;

                                            this.emit('landed');

                                            break;
                                        case ParrotDiscoConstans.ARCOMMANDS_ARDRONE3_PILOTINGSTATE_FLYINGSTATECHANGED_STATE_TAKINGOFF:
                                            this.navData.flyingState = ParrotDiscoFlyingState.TAKING_OFF;

                                            this.emit('takingOff');

                                            break;
                                        case ParrotDiscoConstans.ARCOMMANDS_ARDRONE3_PILOTINGSTATE_FLYINGSTATECHANGED_STATE_HOVERING:
                                            this.navData.flyingState = ParrotDiscoFlyingState.HOVERING;

                                            this.emit('hovering');

                                            break;
                                        case ParrotDiscoConstans.ARCOMMANDS_ARDRONE3_PILOTINGSTATE_FLYINGSTATECHANGED_STATE_FLYING:
                                            this.navData.flyingState = ParrotDiscoFlyingState.FLYING;

                                            this.emit('flying');

                                            break;
                                        case ParrotDiscoConstans.ARCOMMANDS_ARDRONE3_PILOTINGSTATE_FLYINGSTATECHANGED_STATE_LANDING:
                                            this.navData.flyingState = ParrotDiscoFlyingState.LANDING;

                                            this.emit('landing');

                                            break;
                                        case ParrotDiscoConstans.ARCOMMANDS_ARDRONE3_PILOTINGSTATE_FLYINGSTATECHANGED_STATE_EMERGENCY:
                                            this.navData.flyingState = ParrotDiscoFlyingState.EMERGENCY;

                                            this.emit('emergency');

                                            break;
                                    }

                                    this.emit('flyingState', { flyingState: this.navData.flyingState });

                                    break;
                            }
                            break;
                    }
                    break;
            }
        }
    }

    private sendPong(data: any) {
        this.sendPacket(
            this.networkFrameGenerator(
                data,
                ParrotDiscoConstans.ARNETWORKAL_FRAME_TYPE_DATA,
                ParrotDiscoConstans.ARNETWORK_MANAGER_INTERNAL_BUFFER_ID_PONG,
            ),
        );
    }

    private sendAck(networkFrame: ParrotDiscoNetworkFrame) {
        const buffer = Buffer.alloc(1);

        buffer.writeUInt8(networkFrame.seq, 0);

        const id = networkFrame.id + ParrotDiscoConstans.ARNETWORKAL_MANAGER_DEFAULT_ID_MAX / 2;

        this.sendPacket(this.networkFrameGenerator(buffer, ParrotDiscoConstans.ARNETWORKAL_FRAME_TYPE_ACK, id));
    }

    public sendCommand(command: any[]) {
        const buffer = commandToBuffer(command[0], command[1], command[2], command[3], command[4]);

        this.sendPacket(this.networkFrameGenerator(buffer));
    }

    public sendPacket(packet) {
        this.sockets.c2d.send(packet, 0, packet.length, this.config.c2dPort, this.config.ip, (err) => {
            if (err) {
                throw err;
            }
        });
    }

    private sendPilotingData() {
        const buffer = Buffer.alloc(13);

        buffer.writeUInt8(ParrotDiscoConstans.ARCOMMANDS_ID_PROJECT_ARDRONE3, 0);
        buffer.writeUInt8(ParrotDiscoConstans.ARCOMMANDS_ID_ARDRONE3_CLASS_PILOTING, 1);
        buffer.writeUInt16LE(ParrotDiscoConstans.ARCOMMANDS_ID_ARDRONE3_PILOTING_CMD_PCMD, 2);
        buffer.writeUInt8(this.pilotingData.flag || 0, 4);
        buffer.writeInt8(this.pilotingData.roll || 0, 5);
        buffer.writeInt8(this.pilotingData.pitch || 0, 6);
        buffer.writeInt8(this.pilotingData.yaw || 0, 7);
        buffer.writeInt8(this.pilotingData.gaz || 0, 8);
        buffer.writeFloatLE(this.pilotingData.psi || 0, 9);

        this.sendPacket(this.networkFrameGenerator(buffer));
    }

    private startPacketSending(speed: number = 25) {
        this.packetSendingInterval = setInterval(() => {
            this.sendPilotingData();
        }, speed);
    }

    private stopPacketSending() {
        clearInterval(this.packetSendingInterval);
    }

    private lastDisconnectedEventAt: number = null;

    public startAliveChecking(speed: number = 2000) {
        this.aliveCheckingInterval = setInterval(() => {
            if (!this.isAlive()) {
                if (!this.lastDisconnectedEventAt || Date.now() - this.lastDisconnectedEventAt > 3000) {
                    this.emit('disconnected');

                    this.lastDisconnectedEventAt = Date.now();
                }
            }
        }, speed);
    }

    public stopAliveChecking() {
        clearInterval(this.aliveCheckingInterval);
    }

    private sendAllStates() {
        const buffer = Buffer.alloc(4);

        buffer.writeUInt8(ParrotDiscoConstans.ARCOMMANDS_ID_PROJECT_COMMON, 0);
        buffer.writeUInt8(ParrotDiscoConstans.ARCOMMANDS_ID_COMMON_CLASS_COMMON, 1);
        buffer.writeUInt16LE(ParrotDiscoConstans.ARCOMMANDS_ID_COMMON_COMMON_CMD_ALLSTATES, 2);

        this.sendPacket(this.networkFrameGenerator(buffer));
    }

    async connect(waitForDisco: boolean = false): Promise<boolean> {
        while (true) {
            const discovered = await this.discover();

            if (!discovered) {
                if (waitForDisco) {
                    continue;
                } else {
                    return false;
                }
            }

            break;
        }

        this.sockets.d2c.bind(this.config.d2cPort);
        this.sockets.d2c.on('message', this.onPacket.bind(this));

        this.startPacketSending();
        this.startAliveChecking();

        this.sendAllStates();

        this.initializeMethods();

        return true;
    }

    disconnect(): boolean {
        this.stopPacketSending();
        this.stopAliveChecking();

        this.sockets.c2d.close();
        this.sockets.d2c.close();

        return true;
    }
}
