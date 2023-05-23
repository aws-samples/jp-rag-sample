#!/bin/bash
finch build -t rag-sample-server-image .
finch run -it --rm --name rag-sample-server -p 80:80 rag-sample-server-image
