import { Computer, getComputer } from "~/app/computer";
import { Request } from "express";

export const removeFromObject = (obj: any, keys: any[]) => {
  const newObj = {} as any;
  Object.keys(obj)
    .filter((key) => !keys.includes(key))
    .forEach((key) => {
      newObj[key] = obj[key];
    });
  return newObj;
};

export const isConnectedToMachine = (
  req: Request,
  computer: Computer,
  targetComputer: Computer,
) => {
  if (!req.session?.logins?.[computer.computerId]) return false;

  let result = req.session.logins[computer.computerId].find(
    (that) => that.id === targetComputer.computerId,
  );

  if (!result) return false;

  //if the target ip has changed
  if (targetComputer.ip !== result.ip) {
    req.session.logins[computer.computerId] = req.session.logins[
      computer.computerId
    ].filter((val) => val.id !== computer.computerId);
    return false;
  }

  return true;
};