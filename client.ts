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