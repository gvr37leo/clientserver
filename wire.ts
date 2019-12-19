class Wire<T>{
    lagms:number = 500
    onDataArrived = new EventSystem<T>()
    packetlossrate = 0
    insant = true

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
