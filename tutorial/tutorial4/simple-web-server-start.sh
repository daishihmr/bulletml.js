#!/bin/sh

java -jar ${0%/*}/simple-web-server.jar -d ${0%/*}
