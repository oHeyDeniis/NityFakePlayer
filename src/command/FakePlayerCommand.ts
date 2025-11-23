import { CustomEnum, Player, Serenity, StringEnum } from "@serenityjs/core";
import { FakePlayerManager } from "../instance/FakePlayerManager";

export class FakePlayerCommand {

    constructor(
        public serenity: Serenity
    ) {
        for (const aliases of ["fakeplayer", "fp"])
            serenity.commandPalette.register(
                aliases,
                "FakePlayer commands",
                (registry) => {
                    registry.overload({
                        subcommand: [FakePlayerEnum, true],
                        fakeplayer: [StringEnum, true],
                        args: [StringEnum, true],
                    },
                        (command) => {
                            if (command.origin instanceof Player) {
                                this.onCommand(command.origin, [command.subcommand.result, command.fakeplayer.result, command.args.result]);
                            }
                        });
                },
                () => { }
            );
    }
    onCommand(player: Player, args: any[]) {
        if (!player.isOp) {
            player.sendMessage("Voce nao tem permissao para executar esse comando!");
            return;
        }
        switch (args[0]) {
            case "list":
                let listfp: string[] = [];
                for (const p of this.serenity.players.values()) {
                    if (FakePlayerManager.isFakePlayer(p)) {
                        listfp.push(p.username);
                    }
                }
                player.sendMessage("§eFakePlayers online: §6" + (listfp.length > 0 ? listfp.join(", ") : "nenhum"));
                break;
            case "remove":
            case "r":
                let rfplayer: Player | null = null;
                for (const p of this.serenity.players.values()) {
                    if (p.username.toLowerCase() == args[1].toLowerCase() && FakePlayerManager.isFakePlayer(p)) {
                        rfplayer = p;
                    }
                }
                if (!rfplayer) {
                    player.sendMessage("§cFakePlayer " + args[1] + " nao encontrado!");
                    return;
                }
                rfplayer.despawn();
                this.serenity.players.delete(rfplayer.connection);
                player.sendMessage("§eFakePlayer §6" + args[1] + " §eremovido com sucesso!");
                break;
            case "create":
            case "c":
                FakePlayerManager.create(player, args[1] ?? "FakePlayer", this.serenity);
                break;
            case "cmd":
            case "command":
                if (!args[1] || !args[2]) {
                    player.sendMessage("Use: /fakeplayer command <player> <command>");
                    return;
                }
                let fplayer: Player | null = null;
                for (const p of this.serenity.players.values()) {
                    if (p.username.toLowerCase() == args[1].toLowerCase() && FakePlayerManager.isFakePlayer(p)) {
                        fplayer = p;
                    }
                }
                if (!fplayer) {
                    player.sendMessage("§cFakePlayer " + args[1] + " nao encontrado!");
                    return;
                }
                const cmd = args[2].replaceAll(".", " ");
                try {
                    fplayer.executeCommand(cmd);
                } catch (e) {
                    player.sendMessage("Erro ao executar o comando: " + e);
                    return;
                }
                player.sendMessage("§eComando: §6" + cmd + " §eexecutado com sucesso!");
                break;

        }
    }
}
class FakePlayerEnum extends CustomEnum {

    static options: string[] = [
        "create",
        "remove",
        "list",
        "cmd",
    ];
    static strict: boolean = false;

    validate(error?: boolean): boolean {
        return true;
    }
}