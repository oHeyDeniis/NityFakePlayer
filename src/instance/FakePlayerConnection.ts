import { Connection, Frame, Priority, Server } from "@serenityjs/raknet";

export class FakePlayerConnection extends Connection {
    constructor(server: Server) {
        super(
            server,
            {
                address: "0.0.0.0",
                family: "IPv4",
                port: 19132,
                size: 1024,
            },
            BigInt(0),
            300
        );
    }
}