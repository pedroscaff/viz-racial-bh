#!/bin/bash

if [ "$#" < 2 ]; then
    echo "not enough arguments given"
    exit 1
else
	SOURCE=$1
    DEST=$2
    cp $SOURCE $DEST
fi
