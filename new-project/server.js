const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
//const path = require("path");

const pkgDefinition = protoLoader.loadSync("./service.proto");
const protoDescription = grpc.loadPackageDefinition(pkgDefinition);
const exampleService = protoDescription.ExampleService;

// Simulaciónde espera
function esperar(ms) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

//Unary Call

function UnaryCall(call, callback) {
  console.log("Llamada recibida en UnaryCall, mensaje:", call.request.message);
  const response = {
    message: "Mensaje recibo en el server: " + call.request.message
  };
  callback(null, response);
}

// InsertPersonCall

function InsertPersonCall(call, callback) {
  console.log(
    "Llamada recibida en InsertPersonCall, person name:",
    call.request.name
  );
  const response = {
    message: "Persona Insertada: " + call.request.name
  };
  callback(null, response);
}

// ServerStreamingCall

async function ServerStreamingCall(call) {
  console.log("Llamada recibida en ServerStreamingCall: ", call.request);

  for (let i = 1; i <= call.request.loops; i++) {
    const response = {
      message: "Mensaje " + i
    };
    await esperar(500);
    call.write(response);
  }

  call.end();
}

//Client Sreaming Call

function ClientStreamingCall(call, callback) {
  let mensajes = [];

  call.on("data", (req) => {
    console.log("Ingresó un llamado: ", req.message);
    mensajes.push(req.message);
  });

  call.on("end", () => {
    callback(null, {
      message: `Mensajes recibidos totales: ${mensajes.length}`
    });
  });
}

let callList = [];
let mensajes = [];
//Bidirectional Streaming Call
async function BiStreamingCall(call) {
  callList.push(call);

  mensajes.forEach((msg) => {
    if (msg.call != call && !msg.enviado) {
      call.write(msg.req);
      msg.enviado = true;
    }
  });

  call.on("data", (req) => {
    const id = mensajes.length;
    const mensaje_objeto = {
      call: call,
      req: req,
      enviado: false
    };

    mensajes.push(mensaje_objeto);

    callList.forEach((client) => {
      if (client != call && !client.writableEnded && !client.destroyed) {
        mensajes[id].enviado = true;
        client.write(req);
      }
    });
  });

  call.on("error", () => {
    call.end();
    const callIndex = callList.findIndex((c) => c == call);
    callList.splice(callIndex, 1);
    console.log("Conexión finalizada por Error");
  });

  call.on("end", () => {
    call.end();
    console.log("Conexión finalizada");
  });
}

// //Bidirectional Streaming Call CON MENSAJES DESDE EL SERVER AL CLIENTE
// async function BiStreamingCall(call) {
//   call.write({ message: "Llamada Iniciada" });

//   call.on("data", (req) => {
//     console.log(req.message);
//   });

//   for (let i = 1; i <= 10; i++) {
//     await esperar(2000);
//     call.write({ message: "Mensaje desde el server: " + i });
//   }

//   call.on("end", () => {
//     call.end();
//     console.log("Conexión finalizada");
//   });
// }

const server = new grpc.Server();
server.addService(exampleService.service, {
  UnaryCall,
  InsertPersonCall,
  ServerStreamingCall,
  ClientStreamingCall,
  BiStreamingCall
});
server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Server running at http://0.0.0.0:50051");
  }
);
