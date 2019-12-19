enum Change{abs,rel}

class Packet2server{
    constructor(
        public version:number,
        public type:Change,
        public value:number,
        public absvalue:number,
        public clientid:number,
        public entityid:number,
    ){

    }
}

class Entity{

    constructor(
        public id:number,
        public value:number,
        public lastprocessedInput:number,
    ){

    }

    applyinput(input:Packet2server){
        if(input.type == Change.abs){
            this.value = input.value
        }else if(input.type == Change.rel){
            this.value += input.value
        }
        if(input.version != this.lastprocessedInput){
            //mismatch happened, multiple clients updated this entity simultaneously
        }
        this.lastprocessedInput++
    }

    copy(){
        return new Entity(this.id,this.value,this.lastprocessedInput)
    }
}

class Server{
    packetBuffer:Packet2server[] = []
    entitys:Entity[] = []
    clients:Client[] = []
    tickRateHz:number = 1

    processPackets(){
        while(this.packetBuffer.length > 0){
            let packet =this.packetBuffer.shift()
            // let client = this.clients.find(c => c.id == packet.clientid)
            let entity = this.entitys.find(e => e.id == packet.entityid)
            if(entity == null){
                entity = new Entity(packet.entityid, packet.value, packet.version)
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