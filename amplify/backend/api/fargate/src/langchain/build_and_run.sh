#!/bin/bash
docker build -t langchain:1.0 .
docker run -it --rm --name langchain -p 8080:8080 --env-file=.env langchain:1.0
