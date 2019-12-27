class Wire<T>{
    lagms:number = 250
    onDataArrived = new EventSystem<T>()
    packetlossrate = 0
    insant = false

    sendinput(packet:T){
        if(Math.random() > this.packetlossrate){//packet loss
            if(this.insant){
                this.onDataArrived.trigger(packet)
            }else{
                setTimeout(() => {
                    this.onDataArrived.trigger(packet)
                }, this.lagms)
            }
        }
    }
}
