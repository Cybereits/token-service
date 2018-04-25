geth --dev --ws --wsport 8545 --wsaddr 127.0.0.1 --wsorigins "*" --wsapi "personal,web3,eth,shh,debug,admin" --datadir "./geth-node" console 2>>./geth-node/geth.log
