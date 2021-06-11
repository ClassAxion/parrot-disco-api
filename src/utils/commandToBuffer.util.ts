import Types from './types.util';

const Commands = require('../statics/commands.static.json');

export function partLength(part) {
    if (part.type === 'string') {
        return part.value.length;
    }

    return Types[part.type].length;
}

export function parseCommand() {
    const args = new Array(arguments.length);

    for (var i = 0; i < args.length; ++i) {
        args[i] = arguments[i];
    }

    const commandTypeId = args[0],
        commandClassName = args[1],
        commandName = args[2];

    const returnArgs = [];

    const commandType = Commands.find((o) => o.id == commandTypeId);

    returnArgs.push({ value: commandTypeId, type: 'u8' });

    const commandClass = commandType.class.find((o) => o.name == commandClassName);
    returnArgs.push({ value: commandClass.id, type: 'u8' });

    const commandsArray: any = commandClass.cmd instanceof Array ? [...commandClass.cmd] : [commandClass.cmd];

    var command = commandsArray.find((o) => o.name == commandName);

    command.id = commandsArray.indexOf(command);

    returnArgs.push({ value: command.id, type: 'u16' });

    let offset = 3;

    if (command.arg && args.length > 3) {
        const extraArgs = [].concat(command.arg);

        for (const arg of extraArgs) {
            returnArgs.push({ value: args[offset], type: arg.type });
            offset++;
        }
    }

    return returnArgs;
}

export function writeBuffer(command) {
    let length = 0,
        offset = 0;

    command.forEach(function (part) {
        length += partLength(part);
    });

    var buffer = Buffer.alloc(length);

    command.forEach(function (part) {
        Types[part.type].write(buffer, part.value, offset);
        offset += partLength(part);
    });

    return buffer;
}

export default function (_1?: any, _2?: any, _3?: any, _4?: any, _5?: any) {
    return writeBuffer(parseCommand.apply(null, arguments));
}
