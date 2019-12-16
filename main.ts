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
    absvalue:number//after the value prop has been processed
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
    unconfirmedPackets:Packet2server[] = []

    messageServer(){
        var p = new Packet2server()
        p.seq = this.seqcurrent++
        p.type = Change.rel
        p.value = 3
        this.wire2server.sendinput(p)
    }

    processPacket(packet:Packet2client){
        for(var i = 0; i < this.unconfirmedPackets.length; i++){
            var current = this.unconfirmedPackets[i]
            if(current.seq == packet.seq){
                if(current.absvalue == packet.value){
                    this.unconfirmedPackets.splice(0,i)
                }else{
                    this.unconfirmedPackets.splice(0,i)
                    current.absvalue = packet.value
                    this.recalcPackets()
                    //some kind of mismatch happenend, recalculate absvalue of following packages and final value
                }
                break
            }
        }
    }

    recalcPackets(){
        for(var i = 1; i < this.unconfirmedPackets.length; i++){
            var prev = this.unconfirmedPackets[i - 1]
            var cur = this.unconfirmedPackets[i]
            if(cur.type == Change.abs){
                break;//from here no desparity can be predicted
            }else if(cur.type == Change.rel){
                cur.absvalue = prev.absvalue + cur.value
            }
        }
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
    //send
    setInterval(() => {
        client.messageServer()
    }, 1000 / client.updateRateHz)

    //listen
    client.wire2client.onDataArrived.listen(e => {
        client.processPacket(e.val)
    })
}



//server
//listen
for(var client of clients){
    client.wire2server.onDataArrived.listen(e => {
        server.packetBuffer.push(e.val)
    })
}

//process and send
setInterval(() => {
    server.processPackets()
},1000 / server.tickRateHz)





