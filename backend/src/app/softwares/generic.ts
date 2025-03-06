import { SoftwareAction } from "@/lib/types/software.type";
import { removeFromObject } from "@/lib/helpers";
import GameException from "@/lib/exceptions/game.exception";

const defaultSoftware = {
  preDownload: async (software, computer, executor) => {
    if (!software.software) throw new Error("software class not loaded");

    let size = 0;
    executor.software.forEach((software) => {
      size += software?.software?.size || 0;
    });

    // if the executor is full do not download
    if (
      size + software.software.size >
        executor.getCombinedHardwareStrength("HDD")
    ) {
      return false;
    }

    // if that exact software already exists
    if (
      executor.software.find(
        (that) =>
          that.software?.level === software.level &&
          that.type === software.type &&
          (that.data.title || "Unknown " + that.type).toLowerCase() ===
            (software.data.title || "Unknown " + software.type).toLowerCase(),
      )
    ) {
      throw new GameException("Exact match of software found on computer");
    }

    return true;
  },
  preUpload: async (software, computer, executor) => {
    if (!software.software) throw new Error("software class not loaded");
    if (software.computer?.computerId === executor.computerId) return false;

    let size = 0;
    computer.software.forEach((software) => {
      size += software?.software?.size || 0;
    });

    // if the computer is full do not download
    if (
      size + software.software.size >
        computer.getCombinedHardwareStrength("HDD")
    ) {
      return false;
    }

    // if that exact software already exists
    if (
      computer.software.find(
        (that) =>
          that.software?.level === software.level &&
          that.type === software.type &&
          (that.data.title || "Unknown " + that.type).toLowerCase() ===
            (software.data.title || "Unknown " + software.type).toLowerCase(),
      )
    ) {
      throw new GameException("Exact match of software found on computer");
    }

    return true;
  },
  upload: async (software, computer, executor) => {
    if (!software.software) throw new Error("software class not loaded");

    await computer.addSoftware({
      ...removeFromObject(software.software, [
        "userId",
        "computerId",
        "gameId",
        "id",
      ]),
      installed: false,
      data: {},
      user: {
        connect: {
          id: executor?.computer?.userId,
        },
      },
      computer: {
        connect: {
          id: executor.computerId,
        },
      },
      game: {
        connect: {
          id: process.env.CURRENT_GAME_ID,
        },
      },
    });

    computer.log(
      `software remotely uploaded => ${software.toString()}`,
      executor,
    );
    executor.log(
      `software uploaded remotely => ${software.toString()}`,
      computer,
    );
  },
  download: async (software, computer, executor) => {
    if (!software.software) throw new Error("software class not loaded");
    if (software.computer?.computerId === executor.computerId) return false;

    await executor.addSoftware({
      ...removeFromObject(software.software, [
        "userId",
        "computerId",
        "gameId",
        "id",
      ]),
      installed: false,
      data: {},
      user: {
        connect: {
          id: executor?.computer?.userId,
        },
      },
      computer: {
        connect: {
          id: executor.computerId,
        },
      },
      game: {
        connect: {
          id: process.env.CURRENT_GAME_ID,
        },
      },
    });

    computer.log(
      `software remotely downloaded => ${software.toString()}`,
      executor,
    );
    executor.log(
      `software downloaded remotely => ${software.toString()}`,
      computer,
    );
  },
  uninstall: async (software, computer, executor) => {
    computer.log(
      `software remotely uninstalled => ${software.toString()}`,
      executor,
    );
    executor.log(
      `software uninstalled remotely => ${software.toString()}`,
      computer,
    );

    await software.uninstall();
  },
  preInstall: async (software, computer, executor) => {
    let size = 0;
    executor.software.forEach((software) => {
      size += software?.software?.size || 0;
    });

    // if the computer RAM is full do not download
    if (
      size + (software?.software?.size || 0) >
        executor.getCombinedHardwareStrength("RAM")
    ) {
      return false;
    }

    return true;
  },
  install: async (software, computer, executor) => {
    computer.log(
      `software remotely installed => ${software.toString()}`,
      executor,
    );
    executor.log(
      `software installed remotely => ${software.toString()}`,
      computer,
    );

    await software.install();
  },
  delete: async (software, computer, executor) => {
    computer.log(
      `software remotely deleted => ${software.toString()}`,
      executor,
    );
    executor.log(
      `software deleted removely => ${software.toString()}`,
      computer,
    );

    await software.delete();
  },
} satisfies SoftwareAction;

export default defaultSoftware;
