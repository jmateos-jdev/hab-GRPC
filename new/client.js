const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Cargar el archivo .proto
const PROTO_PATH = path.join(__dirname, "service.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const exampleService = protoDescriptor.ExampleService;

// Crear cliente gRPC
const client = new exampleService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// // Unary Call
// client.UnaryCall({ message: "Hello Unary" }, (err, response) => {
//   if (err) throw err;
//   console.log("Unary Response:", response.message);
// });

// Server Streaming Call
const serverStream = client.ServerStreamingCall({
  message: "Hello Server Streaming"
});
serverStream.on("data", (response) => {
  console.log("Server Stream Response:", response.message);
});
serverStream.on("end", () => {
  console.log("Server Stream ended");
});

// Client Streaming Call
const clientStream = client.ClientStreamingCall((err, response) => {
  if (err) throw err;
  console.log("Client Stream Response:", response.message);
});
setTimeout(() => {
  clientStream.write({ message: "Client message 1" });
}, 2000);

setTimeout(() => {
  clientStream.write({ message: "Client message 2" });
}, 3000);
setTimeout(() => {
  clientStream.write({ message: "Client message 3" });
}, 4000);
setTimeout(() => {
  clientStream.end();
}, 5000);

// Bidirectional Streaming Call
const bidiStream = client.BidirectionalStreamingCall();
bidiStream.on("data", (response) => {
  console.log("Bidi Stream Response:", response.message);
});
setTimeout(() => {
  console.log("enviando 1");
  bidiStream.write({ message: "Bidi message 1" });
}, 1000);
setTimeout(() => {
  console.log("enviando 2");
  bidiStream.write({ message: "Bidi message 2" });
}, 2000);
setTimeout(() => {
  console.log("enviando 3");
  bidiStream.write({ message: "Bidi message 3" });
}, 3000);
setTimeout(() => {
  bidiStream.end();
}, 4000);
