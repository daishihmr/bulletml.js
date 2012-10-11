#!/bin/sh

java -jar ${0%/*}/web-server.jar -d ${0%/*}
