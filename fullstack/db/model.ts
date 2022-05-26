import { DataTypes, Model, getManager } from "../deps.ts";

export class Joke extends Model {
    static table = 'jokes';

    static timestamps = true;

    static fields = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID
        },
        joke: DataTypes.STRING
    }
}

getManager().link([Joke]);
