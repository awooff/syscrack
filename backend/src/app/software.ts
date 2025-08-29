import { Prisma, Software as Table } from "~/db/client";
import { Computer } from "./computer";
import { server } from "~/index";
import { SoftwareAction } from "~/lib/types/software.type";
import softwares, { SoftwareType } from "./softwares";
import settings from "~/settings";
import GameException from "~/lib/exceptions/game.exception";

export type SoftwareData = {
  title?: string;
};

export class Software {
  public software?: Table;
  public computer?: Computer;
  public readonly softwareId: string;
  public action: SoftwareAction = softwares.generic;
  public constructor(
    softwareId: string,
    software?: Table,
    computer?: Computer,
  ) {
    this.softwareId = softwareId;
    if (software) {
      this.software = software;
    }
    if (computer) {
      this.computer = computer;
    }
  }

  public get data() {
    return this.software?.data as SoftwareData;
  }

  public async uninstall() {
    await this.update({
      installed: false,
    });
  }

  public async install() {
    await this.update({
      installed: true,
    });
  }

  public getExecutionCost(action: keyof SoftwareAction): number {
    if (!this.action) throw new Error("no software actions present");
    if (!this.computer) throw new Error("needs computer");

    let baseCost = (settings.actionDelay as any)[action] || 10;
    baseCost = baseCost * (this.action.settings?.complexity || 1);
    baseCost = Math.floor(baseCost * settings.actionNerf);

    if (action === "delete" || action === "uninstall" || action === "view") {
      baseCost =
        Math.floor(baseCost * settings.hddNerf) -
        this.computer.getCombinedHardwareStrength("HDD") / 84;
    }

    if (action === "install" || action === "uninstall") {
      baseCost =
        (Math.floor(baseCost * settings.ramNerf) -
          this.computer.getCombinedHardwareStrength("RAM") / 12) *
        Math.max(1, this.software?.size || 1);
    }

    return ((baseCost * 1000) / 2) * this.level;
  }

  public async preExecute(
    action: keyof SoftwareAction,
    executor?: Computer,
    data?: any,
  ): Promise<boolean> {
    const computer = executor == null ? this.computer : executor;

    if (!computer) throw new Error("invalid executor");

    switch (action) {
      case "install":
        if (this.action?.preInstall == null) {
          return true;
        }
        return await this.action.preInstall(
          this,
          this.computer || computer,
          computer,
          data,
        );
      case "uninstall":
        if (this.action?.preUninstall == null) {
          return true;
        }
        return await this.action.preUninstall(
          this,
          this.computer || computer,
          computer,
          data,
        );
      case "execute":
        if (this.action?.preExecute == null) {
          return true;
        }
        return await this.action.preExecute(
          this,
          this.computer || computer,
          computer,
          data,
        );
      case "view":
        if (this.action?.preView == null) {
          return true;
        }
        return await this.action.preView(
          this,
          this.computer || computer,
          computer,
          data,
        );
      case "delete":
        if (this.action?.preDelete == null) {
          return true;
        }
        return await this.action.preDelete(
          this,
          this.computer || computer,
          computer,
          data,
        );
      case "upload":
        if (this.action?.preUpload == null) {
          return true;
        }
        return await this.action.preUpload(
          this,
          this.computer || computer,
          computer,
          data,
        );
      case "download":
        if (this.action?.preDownload == null) {
          return true;
        }
        return await this.action.preDownload(
          this,
          this.computer || computer,
          computer,
          data,
        );
      default:
        throw new GameException("invalid action");
    }
  }

  public async execute(
    action: keyof SoftwareAction,
    executor?: Computer,
    data?: any,
  ) {
    const computer = executor == null ? this.computer : executor;

    if (!computer) throw new Error("invalid executor");

    switch (action) {
      case "install":
        if (this.action?.install == null) {
          return null;
        }
        return await this.action.install(
          this,
          this.computer || computer,
          computer,
          data,
        );
      case "uninstall":
        if (this.action?.uninstall == null) {
          return null;
        }
        return await this.action.uninstall(
          this,
          this.computer || computer,
          computer,
          data,
        );
      case "execute":
        if (this.action?.execute == null) {
          return null;
        }
        return await this.action.execute(
          this,
          this.computer || computer,
          computer,
          data,
        );
      case "view":
        if (this.action?.view == null) {
          return null;
        }
        return await this.action.view(
          this,
          this.computer || computer,
          computer,
          data,
        );
      case "delete":
        if (this.action?.delete == null) {
          return null;
        }
        return await this.action.delete(
          this,
          this.computer || computer,
          computer,
          data,
        );
      case "upload":
        if (this.action?.upload == null) {
          return true;
        }
        return await this.action.upload(
          this,
          this.computer || computer,
          computer,
          data,
        );
      case "download":
        if (this.action?.download == null) {
          return true;
        }
        return await this.action.download(
          this,
          this.computer || computer,
          computer,
          data,
        );
      default:
        throw new GameException("invalid action");
    }
  }

  public get level() {
    if (!this.software) throw new Error("no software");

    return this.software.level;
  }

  public get installed() {
    if (!this.software) throw new Error("no software");

    return this.software.installed;
  }

  public async delete() {
    await server.prisma.software.delete({
      where: {
        id: this.softwareId,
        gameId: process.env.CURRENT_GAME_ID,
      },
    });

    if (this.computer) {
      this.computer.software = this.computer.software.filter(
        (that) => that.softwareId !== this.softwareId,
      );
    }
  }

  public async update(data: Prisma.SoftwareUpdateInput) {
    await server.prisma.software.update({
      where: {
        id: this.softwareId,
        gameId: process.env.CURRENT_GAME_ID,
      },
      data,
    });
    await this.load();
  }

  public get type() {
    if (!this.software) throw new Error("no software");

    return this.software.type as SoftwareType;
  }

  public toString() {
    if (!this.software) throw new Error("no software");

    return `[${this.software.type}] (${this.software.level})`;
  }

  public async load(data?: Table) {
    this.software =
      data ||
      (await server.prisma.software.findFirstOrThrow({
        where: {
          id: this.softwareId,
          gameId: process.env.CURRENT_GAME_ID,
        },
      }));

    if (!this.computer) {
      this.computer = new Computer(this.software.computerId);
      await this.computer.load();
    } else {
      this.computer.software = this.computer.software.map((software) => {
        if (software.softwareId === this.softwareId) {
          return this;
        }
        return software;
      });

      if (
        !this.computer.software.find(
          (val) => val.softwareId === this.softwareId,
        )
      ) {
        this.computer.software.push(this);
      }
    }

    // the actions (install, etc) to do for this software
    this.action = (softwares as any)?.[this.software.type];

    // if no actions for this software, use generic
    if (!this.action) {
      this.action = softwares.generic;
    } else {
      // if any missing actions, take them from generic
      Object.keys(softwares.generic).forEach((key) => {
        if (key === "settings") {
          return;
        }

        if (!(this.action as any)[key]) {
          (this.action as any)[key] = (softwares.generic as any)[key];
        }
      });
    }

    return this.software;
  }
}