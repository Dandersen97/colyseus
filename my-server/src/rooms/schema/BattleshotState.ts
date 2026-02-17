import { ArraySchema, MapSchema, CollectionSchema, Schema, type } from "@colyseus/schema";


export class ShipData extends Schema {
    @type("number") x: number;
    @type("number") y: number;
    @type("number") id: number;
    @type("string") idText: string;
    @type("string") hit: string = "false";
}

export class GameBoard extends Schema {
    //@type("number") width: number;
    //@type("number") height: number;
    //@type("ShipData") ship: ShipData;
    //@type( ["ShipData"] ) ships: ShipData[];  // = new ArraySchema<ShipData>();  //Works but doesn't fill data
    //@type({ collection: ShipData}) ships = new CollectionSchema<ShipData>();
    @type({map: ShipData}) ships2 = new MapSchema<ShipData>();
    //@type([ "PlayerData" ]) Players = new ArraySchema<PlayerData>();
}


class PlayerData {
    @type("string") id: string;
    @type("number") x: number;
    @type("number") y: number;
    @type([ "ShipData" ]) Ships = new ArraySchema<ShipData>();
}



export class Player extends Schema {
    @type("string") name: string;
    @type(GameBoard) board: GameBoard = new GameBoard();
    @type("string") ready: string = "false";
}
 
export class MyState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
    @type("number") width: number;
    @type("number") height: number;
    @type({map: ShipData}) requiredShips = new MapSchema<ShipData>();
}

