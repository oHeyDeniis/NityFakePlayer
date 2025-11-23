import { CommandResponse, EntityInteractMethod, EntityTrait, ModalForm, Player, World } from "@serenityjs/core";
import { DataPacket, Gamemode, ScoreboardIdentity } from "@serenityjs/protocol";
import { log } from "console";

export class FakePlayerInstance extends Player {


    protected fakeLogger: string[] = [];

    isAlive: boolean = true;
    get gamemode(): Gamemode {
        return Gamemode.Survival
    }
    set gamemode(value: Gamemode) {

    }
    sendLogForm(player: Player) {
        const form = new ModalForm("FakePlayer Log");

        form.title = "§6[FP] " + this.username + "";
        for (const line of this.fakeLogger) {
            form.label(line);
        }
        form.show(player);

    }
    interact(origin: Player, method: EntityInteractMethod): void {
        if (origin.isSneaking && origin.isOp) {
            this.sendLogForm(origin);
        }
    }
    send(...packets: Array<DataPacket>): void {
        for (const packet of packets) {
        }

    }
    sendImmediate(..._packets: Array<DataPacket>): void {

    }
    sendMessage(message: string): void {
        this.serenity.logger.info("§6[CHAT][FP][" + this.username + "]: §7" + message);
        this.fakeLogger.unshift("§6[CHAT][" + this.username + "]: §7" + message);

    }
    executeCommand<T = unknown>(command: string): CommandResponse<T> {
        this.serenity.logger.info("§6[CMD][FP][" + this.username + "]: §7" + command);
        this.fakeLogger.unshift("§6[CMD][" + this.username + "]: §7" + command);
        return super.executeCommand(command);
    }
    executeCommandAsync<T = unknown>(command: string): Promise<CommandResponse<T>> {
        this.serenity.logger.info("§6[CMD][FP][" + this.username + "]: §7" + command);
        this.fakeLogger.unshift("§6[CMD][" + this.username + "]: §7" + command);
        return super.executeCommandAsync(command);
    }
    isPlayer(): this is Player {
        return true;
    }
    public loadDataEntry(
        world: World,
        entry: any,
        overwrite = true
    ): void {
        try {
            // Check that the identifier matches the entity's identifier
            if (entry.identifier !== this.type.identifier) {
                log(
                    "Failed to load entity entry as the identifier does not match the entity's identifier!"
                );
                return;
            }


            // Set the entity's position and rotation
            this.position.x = entry.position[0];
            this.position.y = entry.position[1];
            this.position.z = entry.position[2];
            this.rotation.yaw = entry.rotation[0];
            this.rotation.pitch = entry.rotation[1];
            this.rotation.headYaw = entry.rotation[2];



            // Add the traits to the entity
            for (const trait of entry.traits) {
                // Check if the palette has the trait
                const traitType = world.entityPalette.traits.get(trait);
                log("FP: trait: " + trait);
                // Check if the trait exists in the palette
                if (!traitType) {
                    world.logger.error(
                        `Failed to load trait "${trait}" for entity "${this.type.identifier}:${this.uniqueId}" as it does not exist in the palette`
                    );

                    continue;
                }

                // Attempt to add the trait to the entity
                this.addTrait(traitType as typeof EntityTrait);
            }
        } catch {
            // Log the error to the console
            this.world.logger.error(
                `Failed to load entity entry for entity "${this.type.identifier}:${this.uniqueId}" in dimension "${this.dimension.identifier}". Entity data will be reset for this entity.`
            );
        }
    }

}