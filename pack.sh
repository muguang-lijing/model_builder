#!/bin/bash
mypath=/tmp/app
rm -rf ${mypath} app app.asar
mkdir ${mypath}
cp -a ./* ${mypath}
mv ${mypath} ./
asar pack app app.asar
echo "==ok=="
# nautilus .