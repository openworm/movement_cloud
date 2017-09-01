#!/bin/bash

input="$1"

while read id url
do
  echo $id $url
done < "$input"
