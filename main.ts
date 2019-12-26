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

let clientA = new Client(0)
let clientB = new Client(1)
var testentity = new Entity(0,0,0)
clientA.entitys = [testentity]
clientB.entitys = [testentity]

let server = new Server()
server.connect(clientA)
server.connect(clientB)

//client
for(let client of server.clients){
    //send
    // setInterval(() => {
    //     client.messageServer()
    // }, 1000 / client.updateRateHz)


    //listen
    client.wire2client.onDataArrived.listen(e => {
        client.packetbuffer.push(e.val)
        // client.processPackets()
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

//process and send
// setTimeout(() => {
//     server.processPackets()
// },1000)


//ui
let clientcontainer = document.querySelector('#clientcontainer')
let clienttemplate = clientcontainer.firstElementChild
clienttemplate.remove()

for(let client of server.clients){
    client.element = clienttemplate.cloneNode(true) as any
    clientcontainer.append(client.element)
}

//testing

clientA.messageServer(3,0)
clientB.messageServer(3,0)
server.processPackets()
server.messageClients()
clientA.messageServer(3,0)
clientA.processPackets()


