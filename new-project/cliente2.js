const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const pkgDefinition = protoLoader.loadSync("./service.proto");
const protoDescription = grpc.loadPackageDefinition(pkgDefinition);
const exampleService = protoDescription.ExampleService;
const clientMetadata = new grpc.Metadata();
clientMetadata.add("client-id", "Cliente 2");

const client2 = new exampleService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

//Bidirectional Streaming

const biStream = client2.BiStreamingCall(clientMetadata);

biStream.on("data", (res) => {
  console.log(res.message);
});

for (let i = 1; i < 11; i++) {
  setTimeout(() => {
    // biStream.write({ message: "Mensaje desde el cliente2 número: " + i });
  }, i * 10000);
}
