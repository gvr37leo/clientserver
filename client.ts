class Packet2client{
    entities:Entity[]
}

class Client{
    prediction = true
    reconciliation = true
    itnerpolation = true

    updateRateHz = 5
    wire2server = new Wire<Packet2server>()
    wire2client = new Wire<Packet2client>()
    packetbuffer:Packet2client[] = []
    element:HTMLElement
    entitys:Entity[] = []
    
    constructor(public id:number){

    }

    

    messageServer(val:number,entityid:number){
        var entity = this.entitys.find(e => e.id == entityid)
        let packet = new Packet2server(getClock(),val,entity.getPredictedPosition() + val,this.id,entityid)
        this.sendPacket(packet)
    }

    sendPacket(packet:Packet2server){
        var entity = this.entitys.find(e => e.id == packet.entityid)
        entity.unconfirmedPackets.push(packet)
        this.wire2server.sendinput(packet)
    }

    processPackets(){
        while(this.packetbuffer.length > 0){
            let packet = this.packetbuffer.shift()
            for(let serverentity of packet.entities){
                var localentity = this.entitys.find(e => e.id == serverentity.id)
                if(localentity == null){
                    localentity = serverentity.copy()
                    this.entitys.push(localentity)
                }
                localentity.value = serverentity.value
                //self prediction/reconciliation

                let i = localentity.unconfirmedPackets.findIndex(up => up.timestamp > serverentity.lastprocessedInputTimeStamp)
                
                if(i == -1){
                    //all the way up to date
                    localentity.unconfirmedPackets.splice(0,localentity.unconfirmedPackets.length)
                }else{
                    localentity.unconfirmedPackets.splice(0,i)
                    let oldestunconfirmedpacket = first(localentity.unconfirmedPackets)
                    
                    if(oldestunconfirmedpacket.absvalue == serverentity.value + oldestunconfirmedpacket.relvalue){
                        
                        //all went right
                    }else{
                        oldestunconfirmedpacket.absvalue = serverentity.value + oldestunconfirmedpacket.relvalue
                        localentity.recalcPackets()
                        //some kind of mismatch happenend, recalculate absvalue of following packages and final value
                        //happens when other clients touch your data or when client side unpredictable events cause data to change
                    }
                }
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
        var ownentity = this.entitys[this.id]
        value.valueAsNumber = ownentity.getPredictedPosition()
        unconfirmedPackets.valueAsNumber = ownentity.unconfirmedPackets.length
    }
}