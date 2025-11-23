import { Plugin, PluginEvents } from "@serenityjs/plugins";
import { FakePlayerManager } from "./instance/FakePlayerManager";
import { FakePlayerCommand } from "./command/FakePlayerCommand";

class NityFakePlayer extends Plugin implements PluginEvents {


  public constructor() {
    super("NityFakePlayer", "1.0.0");
  }

  public onInitialize(): void {

    new FakePlayerManager(this.serenity);
    new FakePlayerCommand(this.serenity);
  }
}

export default new NityFakePlayer();
