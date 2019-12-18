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
