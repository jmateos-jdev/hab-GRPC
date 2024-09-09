import grpc
import service_pb2
import service_pb2_grpc
import atexit

nombre_usuario = input("Para iniciar el chat debe ingresar su nombre: ")

def generador_mensajes():
    while True:
        mesanje_del_usuario = input("")
        yield service_pb2.Mensaje(usuario=nombre_usuario ,message=mesanje_del_usuario)

def run():
    canal = grpc.insecure_channel('localhost:50051')
    example_service_stub = service_pb2_grpc.ExampleServiceStub(canal)

    request_iterator = generador_mensajes()

    call = example_service_stub.BiStreamingCall(request_iterator)

    def limpieza():
        print("Cerrando conexion")
        call.cancel()

    atexit.register(limpieza)

    def recibir_mensaje():
        for mensaje in call:
            print(f"{mensaje.usuario}: {mensaje.message}")
    
    import threading
    threading.Thread(target=recibir_mensaje()).start()



if __name__ == "__main__":
    run()
