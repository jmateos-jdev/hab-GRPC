const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Cargar el archivo .proto
const PROTO_PATH = path.join(__dirname, "service.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const exampleService = protoDescriptor.ExampleService;

// Implementar los servicios
function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function UnaryCall(call, callback) {
  console.log("Unary call:", call.request.message);
  callback(null, { message: "Unary response: " + call.request.message });
}

async function ServerStreamingCall(call) {
  console.log("Server streaming call:", call.request.message);
  for (let i = 0; i < 5; i++) {
    await esperar(3000);
    call.write({
      message: `Stream response ${i + 1} for: ${call.request.message}`
    });
  }
  call.end();
}

function ClientStreamingCall(call, callback) {
  let messages = [];
  call.on("data", (request) => {
    console.log("Client streaming data:", request.message);
    messages.push(request.message);
  });

  call.on("end", () => {
    callback(null, {
      message: "Client streaming response: " + messages.join(", ")
    });
  });
}

async function BidirectionalStreamingCall(call) {
  await esperar(6000);
  call.on("data", (request) => {
    console.log("Bidirectional streaming data:", request.message);
    call.write({ message: "Bidirectional response: " + request.message });
  });

  call.on("end", () => {
    call.end();
  });
}

function ChatBidireccional(call) {
  const clientesConectados = []; // Array para almacenar clientes

  call.on("data", (mensaje) => {
    // Retransmitir el mensaje a otros clientes
    clientesConectados.forEach((cliente) => {
      if (cliente !== call) {
        cliente.write(mensaje);
      }
    });
  });

  call.on("end", () => {
    // Manejar desconexión del cliente
    const index = clientesConectados.indexOf(call);
    if (index > -1) {
      clientesConectados.splice(index, 1);
    }
  });

  // Agregar el nuevo cliente al array
  clientesConectados.push(call);
}

// Iniciar el servidor gRPC

const server = new grpc.Server();
server.addService(exampleService.service, {
  UnaryCall,
  ServerStreamingCall,
  ClientStreamingCall,
  BidirectionalStreamingCall,
  ChatBidireccional
});
server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Server running at http://0.0.0.0:50051");
    server.start();
  }
);
