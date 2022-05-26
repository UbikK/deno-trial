import { Logger } from "../deps.ts";
import { Joke } from "./model.ts";

export const insert = async (
  data: string,
): Promise<Joke> => {
  Logger.info(data);
  try {
    return await Joke.create({ id: globalThis.crypto.randomUUID(), joke: data });

  } catch(e){
    Logger.error(e)
    throw e;
  }
};
