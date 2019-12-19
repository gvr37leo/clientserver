class Packet2client{
    entities:Entity[]
}

class Client{
    prediction = true
    reconciliation = true
    itnerpolation = true

    versioncurrent = 0
    updateRateHz = 5
    wire2server = new Wire<Packet2server>()
    wire2client = new Wire<Packet2client>()
    packetbuffer:Packet2client[] = []
    unconfirmedPackets:Packet2server[] = []
    element:HTMLElement
    
    constructor(public id:number){

    }

    getPredictedPosition(){
        if(this.unconfirmedPackets.length == 0){
            return 0
            // return this.pos
        }else{
            return last(this.unconfirmedPackets).absvalue    
        }
    }

    messageServer(val:number,entityid:number){
        let packet = new Packet2server(this.versioncurrent++,Change.rel,val,this.getPredictedPosition() + val,this.id,entityid)
        this.sendPacket(packet)
    }

    sendPacket(packet:Packet2server){
        this.unconfirmedPackets.push(packet)
        this.wire2server.sendinput(packet)
    }

    processPackets(){
        while(this.packetbuffer.length > 0){
            let packet = this.packetbuffer.shift()
            for(let entity of packet.entities){
                if(entity.id == this.id){
                    //self prediction/reconciliation
    
                    let i = this.unconfirmedPackets.findIndex(up => up.version == entity.lastprocessedInput)
                    let confirmedpacket = this.unconfirmedPackets[i]
                    if(confirmedpacket.absvalue == entity.value){
                        this.unconfirmedPackets.splice(0,i + 1)
                    }else{
                        this.unconfirmedPackets.splice(0,i + 1)
                        confirmedpacket.absvalue = entity.value
                        this.recalcPackets()
                        //some kind of mismatch happenend, recalculate absvalue of following packages and final value
                        //happens when other clients touch your data or when client side unpredictable events cause data to change
                    }
                }else{
                    //other interpolation
                }
            }
        }
    }

    recalcPackets(){
        for(let i = 1; i < this.unconfirmedPackets.length; i++){
            let prev = this.unconfirmedPackets[i - 1]
            let cur = this.unconfirmedPackets[i]
            if(cur.type == Change.abs){
                break;//from here no desparity can be predicted
            }else if(cur.type == Change.rel){
                cur.absvalue = prev.absvalue + cur.value
            }
        }
    }

    updateUI(){
        let prediction = this.element.querySelector('#prediction') as HTMLInputElement
        let reconciliation = this.element.querySelector('#reconciliation') as HTMLInputElement
        let interpolation = this.element.querySelector('#interpolation') as HTMLInputElement
        let lag = this.element.querySelector('#lag') as HTMLInputElement
        let value = this.element.querySelector('#val') as HTMLInputElement
        let unconfirmedPackets = this.element.querySelector('#unconfirmedpackets') as HTMLInputElement

        prediction.checked = this.prediction
        reconciliation.checked = this.reconciliation
        interpolation.checked = this.itnerpolation
        lag.valueAsNumber = this.wire2client.lagms
        value.valueAsNumber = this.getPredictedPosition()
        unconfirmedPackets.valueAsNumber = this.unconfirmedPackets.length
    }
}