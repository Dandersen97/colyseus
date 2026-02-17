import { Room, Client, CloseCode } from "colyseus";
import { GameBoard, MyState, Player, ShipData } from "./schema/BattleshotState.js";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export class BattleshipRoom extends Room{
    maxClients = 2;
    //state = new GameBoard();
    state = new MyState();


    messages = {
        "ready-up": (client: Client, data: any) => {
            const player = this.state.players.get(client.sessionId);
            player.ready = data.ready;


            for (let i: number = 0; i <= data.ships.length - 1; i++) {
                player.board.ships2.set(i.toString(), new ShipData(data.ships[i]));
            }  
        },
        "set-board":(client: Client, data: any) => {
            const player = this.state.players.get(client.sessionId);
            let boardInstance: GameBoard = Object.assign(new GameBoard(), data);

            //player.board = boardInstance;
            //for (let i: number = 0; i <= data.ships.length - 1; i++) {
            //    player.board.ships2.set(i.toString(), new ShipData(data.ships[i]));
            //}   
        },
        "strike":(client: Client, data: any) => {
            const p1 = this.state.players.get(client.sessionId);
            const p2 = this.state.players.get(data.opponentId);


            for (let [key, value] of p2.board.ships2.entries()) {
                if (value.id === data.tileId && value.hit == "false") {
                    p2.board.ships2.get(key).hit = "true";
                }
            }
            //p1.board.ships2.get(data.tileId).hit = "true";
            
       
        }
    }
    

    // The channel where we register the room IDs.
    // This can be anything you want, it doesn't have to be `$mylobby`.
    LOBBY_CHANNEL = "$mylobby"
 
    // Generate a single 4 capital letter room ID.
    generateRoomIdSingle(): string {
        let result = '';
        for (var i = 0; i < 4; i++) {
            result += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
        }
        return result;
    }
 
    // 1. Get room IDs already registered with the Presence API.
    // 2. Generate room IDs until you generate one that is not already used.
    // 3. Register the new room ID with the Presence API.
    async generateRoomId(): Promise<string> {
        const currentIds = await this.presence.smembers(this.LOBBY_CHANNEL);
        let id;
        do {
            id = this.generateRoomIdSingle();
        } while (currentIds.includes(id));
 
        await this.presence.sadd(this.LOBBY_CHANNEL, id);
        return id;
    }
 
    // Set `this.roomId` to the newly generated and registered room ID.
    async onCreate(options: any) {
        this.roomId = await this.generateRoomId();
        this.state.width = options.width || 10;
        this.state.height = options.height || 10;
        for (let i: number = 0; i <= options.requiredShips.length - 1; i++) {
            this.state.requiredShips.set(i.toString(), new ShipData(options.requiredShips[i]));
        }  
    }

    onJoin (client: Client, options: any) {
    /**
     * Called when a client joins the room.
     */
    this.state.players.set(client.sessionId, new Player());
    this.state.players.get(client.sessionId).name = options.name;
    }
 
    // Free up the roomId that this room used.
    async onDispose() {
        this.presence.srem(this.LOBBY_CHANNEL, this.roomId);
    }

    async onDrop(client: Client, code: number){
        this.allowReconnection(client, 30);
    }

    async onReconnect(client: Client){
        console.log(`Client ${client.sessionId} reconnected!`);
    }
}
