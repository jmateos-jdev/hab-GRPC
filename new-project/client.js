const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const pkgDefinition = protoLoader.loadSync("./service.proto");
const protoDescription = grpc.loadPackageDefinition(pkgDefinition);
const exampleService = protoDescription.ExampleService;
const clientMetadata = new grpc.Metadata();
clientMetadata.add("client-id", "Cliente 1");

const client = new exampleService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

//Bidirectional Streaming

const biStream = client.BiStreamingCall(clientMetadata);

biStream.on("data", (res) => {
  console.log(res.message);
});

for (let i = 1; i < 11; i++) {
  setTimeout(() => {
    biStream.write({ message: "Mensaje desde el cliente1 número: " + i });
  }, i * 1000);
}

// // Client Streaming
// const clientStream = client.ClientStreamingCall((err, response) => {
//   if (err) throw err;
//   console.log(response.message);
// });
// setTimeout(() => {
//   clientStream.write({ message: "Mensaje 1" });
// }, 1000);

// setTimeout(() => {
//   clientStream.write({ message: "Mensaje 2" });
// }, 2000);

// setTimeout(() => {
//   clientStream.write({ message: "Mensaje 3" });
// }, 3000);

// setTimeout(() => {
//   clientStream.write({ message: "Mensaje 4" });
// }, 4000);

// setTimeout(() => {
//   clientStream.write({ message: "Mensaje 5" });
// }, 5000);
// setTimeout(() => {
//   clientStream.write({ message: "Mensaje 6" });
// }, 6000);

// setTimeout(() => {
//   clientStream.end();
// }, 7000);

// // ServerStreaming

// const serverStream = client.ServerStreamingCall({
//   loops: 20
// });

// serverStream.on("data", (response) => {
//   console.log(response.message);
// });

// serverStream.on("end", () => {
//   console.log("Server Streaming Finish");
// });

// // Unary Call

// const request = {
//   message: "Bienvenido al curso de gRPC"
// };

// client.UnaryCall(request, (err, response) => {
//   if (err) throw err;
//   console.log(response);
// });
