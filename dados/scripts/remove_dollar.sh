#!/bin/bash

if [ "$#" = 0 ]; then
    echo "no file given"
    exit 1
else
	FILE=$1
    sed -i 's/R\$//g' $FILE
fi
