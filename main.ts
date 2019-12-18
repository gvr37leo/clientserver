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
    field:string
    absvalue:number//after the value prop has been processed
    clientid:number
}

class Entity{
    id:number
    value:number
    lastprocessedInput:number
}

class Packet2client{
    entities:Entity[]
}

class Client{
    versioncurrent = 0
    updateRateHz = 5
    wire2server = new Wire<Packet2server>()
    wire2client = new Wire<Packet2client>()
    unconfirmedPackets:Packet2server[] = []
    
    constructor(public id:number){

    }

    getPredictedPosition(){
        if(this.unconfirmedPackets.length == 0){
            // return this.pos
        }else{
            return last(this.unconfirmedPackets).absvalue    
        }
    }

    messageServer(){
        var packet = new Packet2server()
        packet.version = this.versioncurrent++
        packet.type = Change.rel
        packet.value = 3
        packet.field = 'posA'
        packet.clientid = this.id
        packet.absvalue = this.getPredictedPosition() + packet.value
        this.unconfirmedPackets.push(packet)
        this.wire2server.sendinput(packet)
    }

    processPacket(packet:Packet2client){
        for(var entity of packet.entities){
            if(entity.id == client.id){
                //self prediction/reconciliation

                for(var i = 0; i < this.unconfirmedPackets.length; i++){
                    var current = this.unconfirmedPackets[i]
                    packet.entities
                    if(current.version == entity.lastprocessedInput){
                        if(current.absvalue == entity.value){
                            this.unconfirmedPackets.splice(0,i + 1)
                        }else{
                            this.unconfirmedPackets.splice(0,i + 1)
                            current.absvalue = entity.value
                            this.recalcPackets()
                            //some kind of mismatch happenend, recalculate absvalue of following packages and final value
                            //happens when other clients touch your data or when client side unpredictable events cause data to change
                        }
                        break
                    }
                }

            }else{
                //other interpolation
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
    constructor(public clientid:number, public client:Client){

    }
}


class Server{
    packetBuffer:Packet2server[] = []
    entitys:Entity[] = []
    clients:Client[] = []
    tickRateHz:number = 1

    processPackets(){

        for(var packet of this.packetBuffer){
            var client = this.clients.find(c => c.id == packet.clientid)
                
            //check for dropped packets
            //and do something if it happens

            if(packet.type == Change.abs){
                client.client.val = packet.value
            }else if(packet.type == Change.rel){
                field.val += packet.value
            }
            field.version = packet.version
                
        }
        this.packetBuffer.splice(0,this.packetBuffer.length)
        
        
        this.messageClients()
    }

    messageClients(){
        for(var client of clients){
            var packet = new Packet2client()

            packet.entities = this.entitys.map(e => )
            client.wire2client.sendinput(packet)
        }
    }

    connect(client:Client){
        this.clients.push(client)
    }
}


var clientA = new Client(0)
var clientB = new Client(1)

var server = new Server()
server.clients = [new ClientRegistration(0)]
var clients = [clientA,clientB]//

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
        server.packetBuffer.push(e.val)
    })
}

//process and send
// setInterval(() => {
//     server.processPackets()
// },1000 / server.tickRateHz)
setTimeout(() => {
    server.processPackets()
},1000)

var clientcontainer = document.querySelector('#clientcontainer')
var clienttemplate = clientcontainer.firstElementChild
clienttemplate.remove()

for(var client of clients){
    clientcontainer.append(clienttemplate.cloneNode(true))
    
}



