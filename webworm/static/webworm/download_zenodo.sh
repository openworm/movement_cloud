#!/bin/bash

if [ "$#" -ne 2 ]; 
then 
    echo "download_zenodo.sh <data list file> <download folder>";
    exit -1;
fi

input="$1"
output="$2"

mkdir -p "$output"
# fname is used instead of url because the current links in database appears
#   to be invalid. The actual links can be reconstructed from the zenodo id
#   and the filename however.
while read id fname
do
  echo $id $fname
  newdir="$output/$id"
  url="https://zenodo.org/record/$id/files/$fname"
  mkdir -p $newdir
  pushd $newdir
  wget -t0 -c $url
  popd
done < "$input"
