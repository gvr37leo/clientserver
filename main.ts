/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/utilsx/utils.ts" />
/// <reference path="node_modules/eventsystemx/EventSystem.ts" />
/// <reference path="client.ts" />
/// <reference path="server.ts" />
/// <reference path="wire.ts" />
// https://gabrielgambetta.com/client-side-prediction-live-demo.html
// https://www.youtube.com/watch?v=W3aieHjyNvw

//clientside
//prediction
// apply inputs even before server confirms it
//reconciliation
// instead of overwriting current state with result from server replay all unconfirmed inputs from last acknowlegd input


var fakeclockcounter = 0
function fakeclock(){
    return fakeclockcounter
}
var startuptimestamp = fakeclock()
let clientA = new Client(0)
let clientB = new Client(1)
clientA.entitys = [new Entity(0,0,0)]
clientB.entitys = [new Entity(0,0,0),new Entity(1,0,0)]

let server = new Server()
server.connect(clientA)
server.connect(clientB)

//ui
let clientcontainer = document.querySelector('#clientcontainer')
let clienttemplate = clientcontainer.firstElementChild
clienttemplate.remove()

for(let client of server.clients){
    client.element = clienttemplate.cloneNode(true) as any
    clientcontainer.append(client.element)
}
server.element = document.querySelector('#server')

//client
for(let client of server.clients){
    //send

    client.element.querySelector('#sendsuccess').addEventListener('click', () => {
        client.messageServer(3, client.id)
        client.updateUI()
    })
    // setInterval(() => {
    //     var target = (<HTMLInputElement>client.element.querySelector('#val')).valueAsNumber
    //     var current = client.entitys[client.id].getPredictedPosition()
    //     client.messageServer(to(current,target), client.id)
    // }, 1000 / client.updateRateHz)


    //listen
    client.wire2client.onDataArrived.listen(e => {
        client.packetbuffer.push(e.val)
        client.processPackets()
        client.updateUI()
    })
}

//server
//listen
for(let client of server.clients){
    client.wire2server.onDataArrived.listen(e => {
        server.packetBuffer.push(e.val)
    })
}

// process and send
setInterval(() => {
    server.processPackets()
    server.messageClients()
    server.updateUI()
},1000 / server.tickRateHz)




//testing
// clientA.messageServer(3,0)
// fakeclockcounter++
// clientB.messageServer(3,0)
// fakeclockcounter++
// clientB.messageServer(8,1)
// server.processPackets()
// server.messageClients()
// clientA.messageServer(3,0)

// clientA.processPackets()
// clientB.processPackets()

// server.updateUI()
// clientA.updateUI()
// clientB.updateUI()

