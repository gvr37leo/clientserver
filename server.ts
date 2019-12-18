enum Change{abs,rel}

class Packet2server{
    version:number
    type:Change
    value:number
    absvalue:number//after the value prop has been processed
    clientid:number
}

class Entity{
    id:number
    value:number
    lastprocessedInput:number
}

class Server{
    packetBuffer:Packet2server[] = []
    entitys:Entity[] = []
    clients:Client[] = []
    tickRateHz:number = 1

    processPackets(){
        while(this.packetBuffer.length > 0){
            var packet =this.packetBuffer.shift()
            var client = this.clients.find(c => c.id == packet.clientid)
            var entity = this.entitys.find(e => e.id == packet.clientid)
            //check for dropped packets
            //and do something if it happens

            if(packet.type == Change.abs){
                entity.value = packet.value
            }else if(packet.type == Change.rel){
                entity.value += packet.value
            }
            entity.lastprocessedInput = packet.version
                
        }
        this.packetBuffer.splice(0,this.packetBuffer.length)
        
        
        this.messageClients()
    }

    messageClients(){
        for(var client of this.clients){
            var packet = new Packet2client()

            packet.entities = this.entitys.map(e => e)
            client.wire2client.sendinput(packet)
        }
    }

    connect(client:Client){
        this.clients.push(client)
    }
}