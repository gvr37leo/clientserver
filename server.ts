enum Change{abs,rel}

class Packet2server{
    constructor(
        public timestamp:number,
        public relvalue:number,
        public absvalue:number,
        public clientid:number,
        public entityid:number,
    ){

    }
}

class Entity{

    unconfirmedPackets:Packet2server[] = []
    constructor(
        public id:number,
        public value:number,
        public lastprocessedInputTimeStamp:number,
    ){

    }

    recalcPackets(){
        for(let i = 1; i < this.unconfirmedPackets.length; i++){
            let prev = this.unconfirmedPackets[i - 1]
            let cur = this.unconfirmedPackets[i]
            cur.absvalue = prev.absvalue + cur.relvalue
        }
    }

    getPredictedPosition(){
        if(this.unconfirmedPackets.length == 0){
            return this.value
        }else{
            return last(this.unconfirmedPackets).absvalue    
        }
    }

    applyinput(input:Packet2server){
        this.value += input.relvalue
        this.lastprocessedInputTimeStamp = input.timestamp
    }

    copy(){
        return new Entity(this.id,this.value,this.lastprocessedInputTimeStamp)
    }
}

class Server{
    packetBuffer:Packet2server[] = []
    entitys:Entity[] = []
    clients:Client[] = []
    tickRateHz:number = 20
    element: HTMLElement
    tickrateel: HTMLInputElement
    updateclientsel: HTMLElement
    entitycontainerel: HTMLElement
    packetbufferel: HTMLInputElement

    processPackets(){
        while(this.packetBuffer.length > 0){
            let packet = this.packetBuffer.shift()
            // let client = this.clients.find(c => c.id == packet.clientid)
            let entity = this.entitys.find(e => e.id == packet.entityid)
            //check for dropped packets
            //and do something if it happens maybe duplicate last send input
            entity.applyinput(packet)
        }
    }

    addpacket2buffer(packet:Packet2server){
        let entity = this.entitys.find(e => e.id == packet.entityid)
        if(entity == null){
            entity = new Entity(packet.entityid, packet.relvalue, packet.timestamp)
            this.entitys.push(entity)
        }
        this.packetBuffer.push(packet)
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

    generateUI(){
        this.element.innerHTML = ''
        this.entitycontainerel = string2html('<div class="border m p"></div>')
        this.element.append(
            createnumberinput('tickrate','tickrate'),
            createnumberinput('packetbuffer','packetbuffer'),
            createbutton('updateclients','process packets and update clients'),
            this.entitycontainerel
        )
        for(var i = 0; i < this.entitys.length; i++){
            var entity = this.entitys[i]
            var container = string2html('<div class="border m p"></div>')
            var valueel = createnumberinput('val' + i,'val')
            query(valueel,'#val' + i).valueAsNumber = entity.value
            var timestampel = createnumberinput('timestamp' + i,'timestamp')
            timestampel.querySelector('#timestamp' + i)
            query(timestampel,'#timestamp' + i).valueAsNumber = to(startuptimestamp,entity.lastprocessedInputTimeStamp) / 1000
            container.append(valueel,timestampel)
            this.entitycontainerel.append(container)
        }
        this.tickrateel = this.element.querySelector('#tickrate')
        this.packetbufferel = this.element.querySelector('#packetbuffer')
        this.updateclientsel = this.element.querySelector('#updateclients')
        this.tickrateel.valueAsNumber = this.tickRateHz
        this.packetbufferel.valueAsNumber = this.packetBuffer.length


        this.element.querySelector('#updateclients').addEventListener('click', () => {
            server.processPackets()
            server.messageClients()
            server.generateUI()
        })

        
    }


    
}

function formatTime(time){
    return to(startuptimestamp, time)
}

function query(el,id:string){
    return el.querySelector(id) as HTMLInputElement
}