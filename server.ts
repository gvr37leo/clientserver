enum Change{abs,rel}

class Packet2server{
    constructor(
        public timestamp:number,
        public relvalue:number,
        public absvalue:number,
        public clientid:number,
        public entityid:number,
    ){

    }
}

class Entity{

    unconfirmedPackets:Packet2server[] = []
    constructor(
        public id:number,
        public value:number,
        public lastprocessedInputTimeStamp:number,
    ){

    }

    recalcPackets(){
        for(let i = 1; i < this.unconfirmedPackets.length; i++){
            let prev = this.unconfirmedPackets[i - 1]
            let cur = this.unconfirmedPackets[i]
            cur.absvalue = prev.absvalue + cur.relvalue
        }
    }

    getPredictedPosition(){
        if(this.unconfirmedPackets.length == 0){
            return this.value
        }else{
            return last(this.unconfirmedPackets).absvalue    
        }
    }

    applyinput(input:Packet2server){
        this.value += input.relvalue
        this.lastprocessedInputTimeStamp = input.timestamp
    }

    copy(){
        return new Entity(this.id,this.value,this.lastprocessedInputTimeStamp)
    }
}

class Server{
    packetBuffer:Packet2server[] = []
    entitys:Entity[] = []
    clients:Client[] = []
    tickRateHz:number = 1

    processPackets(){
        while(this.packetBuffer.length > 0){
            let packet = this.packetBuffer.shift()
            // let client = this.clients.find(c => c.id == packet.clientid)
            let entity = this.entitys.find(e => e.id == packet.entityid)
            if(entity == null){
                entity = new Entity(packet.entityid, packet.relvalue, packet.timestamp)
                this.entitys.push(entity)
            }else{
                //check for dropped packets
                //and do something if it happens maybe duplicate last send input
                entity.applyinput(packet)
            }
        }
        
    }



    messageClients(){
        for(let client of this.clients){
            let packet = new Packet2client()
            //optionally filter packets
            packet.entities = this.entitys.map(e => e.copy())
            client.wire2client.sendinput(packet)
        }
    }

    connect(client:Client){
        this.clients.push(client)
    }
}