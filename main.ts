/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/utilsx/utils.ts" />
/// <reference path="node_modules/eventsystemx/EventSystem.ts" />

class Wire{
    lagms:number = 500
    onDataArrived = new EventSystem<Packet>()

    sendinput(packet:Packet){
        if(Math.random() > 0.5){//packet loss
            setTimeout(() => {
                this.onDataArrived.trigger(packet)
            }, this.lagms)
        }
    }
}

enum Change{abs,rel}

class Packet{
    seq:number
    type:Change
    value:number
}

class Client{
    seqcurrent = 0
    pos = 0
    updateRateHz = 1
    wire2server = new Wire()
    uncofirmedPackets:Packet[] = []

    messageServer(){
        var p = new Packet()
        p.seq = this.seqcurrent++
        p.type = Change.rel
        p.value = 3
        this.wire2server.sendinput(p)
    }
}

class Server{
    pos:number[] = []
    packetBuffer:Packet[] = []
    tickRateHz:number = 5

    processPackets(){
        for(var i = 0; i < this.packetBuffer.length; i++){
            var packet = packet
        }
        this.messageClients()
    }

    messageClients(){

    }
}


var clientA = new Client()
var clientB = new Client()

var server = new Server()
var clients = [clientA,clientB]

//client
for(var client of clients){
    setInterval(() => {
        client.messageServer()
    }, 1000 / client.updateRateHz)
}



//server
for(var client of clients){
    client.wire2server.onDataArrived.listen(e => {
        server.packetBuffer.push(e.val)
    })
}
setInterval(() => {
    server.processPackets()
},1000 / server.tickRateHz)





