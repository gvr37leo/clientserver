/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/utilsx/utils.ts" />
/// <reference path="node_modules/eventsystemx/EventSystem.ts" />

class Wire<T>{
    lagms:number = 500
    onDataArrived = new EventSystem<T>()

    sendinput(packet:T){
        if(Math.random() > 0.5){//packet loss
            setTimeout(() => {
                this.onDataArrived.trigger(packet)
            }, this.lagms)
        }
    }
}

enum Change{abs,rel}

class Packet2server{
    seq:number
    type:Change
    value:number
}

class Packet2client{
    seq:number
    value:number
}

class Client{
    seqcurrent = 0
    pos = 0
    updateRateHz = 1
    wire2server = new Wire<Packet2server>()
    wire2client = new Wire<Packet2client>()
    uncofirmedPackets:Packet2server[] = []

    messageServer(){
        var p = new Packet2server()
        p.seq = this.seqcurrent++
        p.type = Change.rel
        p.value = 3
        this.wire2server.sendinput(p)
    }
}

class Server{
    pos:number[] = []
    packetBuffer:Packet2server[] = []
    tickRateHz:number = 5

    processPackets(){
        for(var i = 0; i < this.packetBuffer.length; i++){
            var packet = packet
        }
        this.messageClients()
    }

    messageClients(){
        for(var client of clients){
            client.wire2client.sendinput(new Packet2client())
        }
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

    client.wire2client.onDataArrived.listen(val => {

    })
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





