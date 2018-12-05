 
At first create unsigned transaction via `hashEncode` method https://gist.github.com/cypherpunk99/3e1314f8cc62cd675fa5c8f7bbe97923#file-sendtransaction-js-L126

``` 
{ 
  nonce: 19,
  gasPrice: 1000000000,
  to: '0xE8899BA12578d60e4D0683a596EDaCbC85eC18CC',
  value: 100,
  data: '',
  chainId: 3,
  gasLimit: 21000 
}
```

Transaction without signatures hex: `e313843b9aca0082520894e8899ba12578d60e4d0683a596edacbc85ec18cc6480038080`
 
Send to keychain for signing:

```javascript
const ws = new WebSocket('ws://localhost:16384/');
ws.send(JSON.stringify(command));
```
Where `command` defined as: 
``` 
{ 
  command: 'sign_hex',
  params: { 
    transaction: 'e313843b9aca0082520894e8899ba12578d60e4d0683a596edacbc85ec18cc6480038080',
    blockchain_type: 'ethereum',
    keyname: 'test1@6de493f01bf590c0' 
  } 
}
```

Keychain response:

`998abc60c269f9982dd16f50816abaf3f434543116a70f00f1e2df4d4c28ffd3013f5eb07a0b4617cba89c42b9c1db4d0e47eadfcd8986905d5c31bd42154e3901`

Build transaction with signatures from keychain response:

```javascript
const rsv = (signature, chainIdHere) => {
  const ret = {};
  ret.r = `0x${signature.slice(0, 64)}`;
  ret.s = `0x${signature.slice(64, 128)}`;
  const recovery = parseInt(signature.slice(128, 130), 16);
  let tmpV = recovery + 27;
  if (chainIdHere > 0) {
    tmpV += chainIdHere * 2 + 8;
  }
  ret.v = tmpV;
  return ret;
}

const ret = rsv(signature, chainIdHere);
txParams = { ...txParams,
  ...ret
};
  
```

Result `txParams`:
```
{ 
  nonce: 19,
  gasPrice: 1000000000,
  to: '0xE8899BA12578d60e4D0683a596EDaCbC85eC18CC',
  value: 100,
  data: '',
  chainId: 3,
  gasLimit: 21000,
  r: '0x998abc60c269f9982dd16f50816abaf3f434543116a70f00f1e2df4d4c28ffd3',
  s: '0x013f5eb07a0b4617cba89c42b9c1db4d0e47eadfcd8986905d5c31bd42154e39',
  v: 42 
}
```

Validate signed transaction via `ethereumjs-tx` library https://github.com/ethereumjs/ethereumjs-tx

```javascript
console.log("validate sign transaction status: ", tx.validate() ? "SUCCESS" : "FAILURE");
```

Result:
```
validate sign transaction status: SUCCESS
```

Signed and ready to broadcast transaction hex: 
 `f86313843b9aca0082520894e8899ba12578d60e4d0683a596edacbc85ec18cc64802aa0998abc60c269f9982dd16f50816abaf3f434543116a70f00f1e2df4d4c28ffd3a0013f5eb07a0b4617cba89c42b9c1db4d0e47eadfcd8986905d5c31bd42154e39`
 
Let's decode transaction before broadcast to check it contents (library `ethereum-tx-decoder` https://github.com/GFJHogue/ethereum-tx-decoder):  
```
{ 
  nonce: 19,
  gasPrice: BigNumber { _bn: <BN: 3b9aca00> },
  gasLimit: BigNumber { _bn: <BN: 5208> },
  to: '0xe8899ba12578d60e4d0683a596edacbc85ec18cc',
  value: BigNumber { _bn: <BN: 64> },
  data: '0x',
  v: 42,
  r: '0x998abc60c269f9982dd16f50816abaf3f434543116a70f00f1e2df4d4c28ffd3',
  s: '0x013f5eb07a0b4617cba89c42b9c1db4d0e47eadfcd8986905d5c31bd42154e39' 
}
```