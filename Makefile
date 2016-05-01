BINDIR?=bin

.PHONY: all
all: client server
	  @@/usr/bin/env echo "====[ BUILD COMPLETE ]====" && date

.PHONY: client
client:
	  gcc -L /usr/local/Cellar/zeromq/4.1.3/lib/ -l zmq -o ${BINDIR}/helloworld_client helloworld_client.c

.PHONY: server
server:
	  gcc -L /usr/local/Cellar/zeromq/4.1.3/lib/ -l zmq -o ${BINDIR}/helloworld_server helloworld_server.c
	  gcc -L /usr/local/Cellar/zeromq/4.1.3/lib/ -l zmq -o ${BINDIR}/helloworld_server_router helloworld_server_router.c
