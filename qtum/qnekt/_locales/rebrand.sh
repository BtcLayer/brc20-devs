#!/bin/sh
find . -type f -exec sed -i 's/Ethereum/QTUM/g' {} +
find . -type f -exec sed -i 's/MetaMask/Qnekt/g' {} +
find . -type f -exec sed -i 's/21000/22000/g' {} +
