
# How to make a transaction via KeyChain
1. Download and install KeyChain

For Mac Os: https://github.com/arrayio/array-io-keychain/releases/tag/0.5

2. Generate the key 

start with command `wscat -c ws://localhost:16384/`
and send command to generate key

```
{
  "command": "create",
  "params":
   {
      "keyname": "test1",
      "encrypted": true,
      "curve": "secp256k1",
      "cipher": "aes256"
  }
}
```
then request public key via
```
{ 
  "command": "public_key",
  "params": 
  {
    "keyname": "KEY_NAME"
  }
}
```
change `KEY_NAME` to yours.

3. Calculate address from publicKey

```javascript
const ethUtil = require('ethereumjs-util');
const publicKey = 'YOUR_PUBLIC_KEY';
const fromAdd = ethUtil.publicToAddress(publicKey).toString('hex');
```

4. Transfer money to the address correspond to public key

In case if you work with ropsten
https://faucet.ropsten.be/

5. Check balance for address, it should have enough ether for success transfer.

```javascript
web3.eth.getBalance(fromAdd) 
.then(console.log);

```

6. Sign transaction with the key that you generated

Example code here: https://gist.github.com/cypherpunk99/3e1314f8cc62cd675fa5c8f7bbe97923

7. Check Etherscan 

https://ropsten.etherscan.io/address/0x1ba05dad1abe91fdea3afffe9676b59076ce0ece

