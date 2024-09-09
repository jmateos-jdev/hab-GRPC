const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const pkgDefinition = protoLoader.loadSync("./service.proto");
const protoDescription = grpc.loadPackageDefinition(pkgDefinition);
const exampleService = protoDescription.ExampleService;

const client = new exampleService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

const request = {
  name: "Joaquin Mateos"
};

// Unary Call
client.InsertPersonCall(request, (err, response) => {
  if (err) throw err;
  console.log(response);
});
