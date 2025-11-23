import { ClientSystemInfo, EntityIdentifier, Player, PlayerChunkRenderingTrait, PlayerEntityRenderingTrait, PlayerJoinSignal, PlayerLevelStorage, Serenity } from "@serenityjs/core";
import { FakePlayerConnection } from "./FakePlayerConnection";
import { ByteTag, CompoundTag, StringTag } from "@serenityjs/nbt";
import { Vector3f } from "@serenityjs/protocol";
import { FakePlayerInstance } from "./FakePlayerInstance";

export class FakePlayerManager {

    static FAKE_PLAYER_RUNTIME_ID: number = 99988;

    constructor(
        public serenity: Serenity
    ) {

    }
    static create(player: Player, name: string, serenity: Serenity) {
        player.sendMessage("§eCriando fake player: §6" + name);
        const dimension = player.dimension;
        const connection = new FakePlayerConnection(serenity.network.raknet);

        const storage = new CompoundTag();
        storage.set("username", new StringTag("username", name));
        const xuid = FakePlayerManager.generateXuid();
        storage.set("xuid", new StringTag("xuid", xuid));

        let uuid = FakePlayerManager.generateUUID();
        storage.set("uuid", new StringTag("uuid", uuid));

        const pp = new PlayerLevelStorage(player, storage);

        pp.setPosition(new Vector3f(player.position.x, player.position.y, player.position.z));
        pp.setUniqueId(BigInt(FakePlayerManager.FAKE_PLAYER_RUNTIME_ID++));
        pp.setIdentifier(EntityIdentifier.Player);
        pp.setRotation(player.rotation);

        const fakeplayer = new FakePlayerInstance(dimension, connection, {
            username: name,
            xuid: xuid,
            uuid: uuid,
            skin: player.skin.getSerialized(),
            clientSystemInfo: ClientSystemInfo.empty(),
            storage: pp

        });

        fakeplayer.spawn();
        for (const otrait of player.traits.values()) {
            fakeplayer.addTrait(otrait);
        }
        player.attributes.getAllAttributes().forEach((value, key) => fakeplayer.attributes.setAttribute(value));
        const trait = fakeplayer.addTrait(PlayerEntityRenderingTrait);

        const chu = fakeplayer.getTrait(PlayerChunkRenderingTrait);
        chu.viewDistance = 8;

        const originTrait = player.getTrait(PlayerEntityRenderingTrait);
        originTrait.addEntity(fakeplayer);

        serenity.players.set(connection, fakeplayer);
        fakeplayer.setStorageEntry("isFakePlayer", new ByteTag(1, "isFakePlayer"));
        const signal = new PlayerJoinSignal(fakeplayer).emit();
        player.sendMessage("§eFake player criado com sucesso.");
    }
    static isFakePlayer(player: Player): boolean {
        return player.hasStorageEntry("isFakePlayer");
    }
    static generateXuid(stringSize: number = 19) {
        let xuid = "";
        for (let i = 0; i < stringSize; i++) {
            xuid += Math.floor(Math.random() * 10).toString();
        }
        return xuid;
    }
    static generateUUID(): string {

        function randomHex(length: number): string {
            return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        }

        const part1 = randomHex(8);
        const part2 = randomHex(4);
        const part3 = randomHex(4);
        const part4 = randomHex(4);
        const part5 = randomHex(12);

        return `${part1}-${part2}-${part3}-${part4}-${part5}`;
    }
}