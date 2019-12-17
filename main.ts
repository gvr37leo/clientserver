/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/utilsx/utils.ts" />
/// <reference path="node_modules/eventsystemx/EventSystem.ts" />
// https://gabrielgambetta.com/client-side-prediction-live-demo.html
// https://www.youtube.com/watch?v=W3aieHjyNvw
class Wire<T>{
    lagms:number = 500
    onDataArrived = new EventSystem<T>()

    sendinput(packet:T){
        if(Math.random() > 0){//packet loss
            setTimeout(() => {
                this.onDataArrived.trigger(packet)
            }, this.lagms)
        }
    }
}

enum Change{abs,rel}

class Packet2server{
    version:number
    type:Change
    value:number
    absvalue:number//after the value prop has been processed
    clientid:number
}

class Packet2client{
    version:number
    value:number
}

class Client{
    versioncurrent = 0
    pos = 0
    updateRateHz = 5
    wire2server = new Wire<Packet2server>()
    wire2client = new Wire<Packet2client>()
    unconfirmedPackets:Packet2server[] = []
    
    constructor(public clientid:number){

    }

    getPredictedPosition(){
        if(this.unconfirmedPackets.length == 0){
            return this.pos
        }else{
            return last(this.unconfirmedPackets).absvalue    
        }
    }

    messageServer(){
        var packet = new Packet2server()
        packet.version = this.versioncurrent++
        packet.type = Change.rel
        packet.value = 3
        packet.clientid = this.clientid
        packet.absvalue = this.getPredictedPosition() + packet.value
        this.unconfirmedPackets.push(packet)
        this.wire2server.sendinput(packet)
    }

    processPacket(packet:Packet2client){
        for(var i = 0; i < this.unconfirmedPackets.length; i++){
            var current = this.unconfirmedPackets[i]
            if(current.version == packet.version){
                if(current.absvalue == packet.value){
                    this.unconfirmedPackets.splice(0,i + 1)
                }else{
                    this.unconfirmedPackets.splice(0,i + 1)
                    current.absvalue = packet.value
                    this.recalcPackets()
                    //some kind of mismatch happenend, recalculate absvalue of following packages and final value
                    //happens when other clients touch your data or when client side unpredictable events cause data to change
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

class ClientRegistration{
    packetBuffer:Packet2server[] = []

    constructor(public clientid:number){

    }
}

class DBVal{
    val:number
    version:number
}

class ServerDB{
    posA:DBVal
    posB:DBVal
}

class Server{
    db:ServerDB
    clientrgs:ClientRegistration[] = []
    tickRateHz:number = 1

    processPackets(){
        for(var client of this.clientrgs){
            for(var i = 0; i < client.packetBuffer.length; i++){
                var packet = client.packetBuffer[i]

                //check for dropped packets
                //and do something if it happens

                if(packet.type == Change.abs){
                    client.pos = packet.value
                }else if(packet.type == Change.rel){
                    client.pos += packet.value
                }
                client.version = packet.version
            }
            client.packetBuffer.splice(0,client.packetBuffer.length)
        }
        
        this.messageClients()
    }

    messageClients(){
        for(var client of clients){
            var crgs = this.clientrgs.find(cr => cr.clientid == client.clientid)
            var packet = new Packet2client()
            packet.value = crgs.pos
            packet.version = crgs.version
            client.wire2client.sendinput(packet)
        }
    }
}


var clientA = new Client(0)
var clientB = new Client(1)

var server = new Server()
server.clientrgs = [new ClientRegistration(0)]
var clients = [clientA]//,clientB

//client
for(var client of clients){
    //send
    // setInterval(() => {
    //     client.messageServer()
    // }, 1000 / client.updateRateHz)
    client.messageServer()
    client.messageServer()
    client.messageServer()
    client.messageServer()

    //listen
    client.wire2client.onDataArrived.listen(e => {
        client.processPacket(e.val)
    })
}



//server
//listen
for(var client of clients){
    client.wire2server.onDataArrived.listen(e => {
        server.clientrgs.find(cr => cr.clientid == client.clientid).packetBuffer.push(e.val)
    })
}

//process and send
// setInterval(() => {
//     server.processPackets()
// },1000 / server.tickRateHz)
setTimeout(() => {
    server.processPackets()
},1000)






