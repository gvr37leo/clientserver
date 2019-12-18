/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/utilsx/utils.ts" />
/// <reference path="node_modules/eventsystemx/EventSystem.ts" />
/// <reference path="client.ts" />
/// <reference path="server.ts" />
/// <reference path="wire.ts" />
// https://gabrielgambetta.com/client-side-prediction-live-demo.html
// https://www.youtube.com/watch?v=W3aieHjyNvw

var clientA = new Client(0)
var clientB = new Client(1)

var server = new Server()
server.connect(clientA)
server.connect(clientB)

//client
for(var client of server.clients){
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
for(var client of server.clients){
    client.wire2server.onDataArrived.listen(e => {
        server.packetBuffer.push(e.val)
    })
}

//process and send
setTimeout(() => {
    server.processPackets()
},1000 / server.tickRateHz)


//ui
var clientcontainer = document.querySelector('#clientcontainer')
var clienttemplate = clientcontainer.firstElementChild
clienttemplate.remove()

for(var client of server.clients){
    clientcontainer.append(clienttemplate.cloneNode(true))
    
}



