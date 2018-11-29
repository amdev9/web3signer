var Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx');
const ethUtil = require('ethereumjs-util');
const rlp = require('rlp');

const HACK = false;

const API_KEY = 'https://rinkeby.infura.io/v3/046804e3dd3240b09834531326f310cf';
const API_KEY_ALEXEY = 'https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl';
// const GANACHE = 'http://127.0.0.1:7545';
let web3 = new Web3(new Web3.providers.HttpProvider(API_KEY)); //

const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:16384/');
const keyname = 'test1@6de493f01bf590c0';
 
const toAdd = '0xE8899BA12578d60e4D0683a596EDaCbC85eC18CC';
 
const publicKey = '0x6a99ea8d33b64610e1c9ff689f3e95b6959a0cc039621154c7b69c019f015f4521bb9f3fc36a4d447002787d4d408da968185fc5116b8ffd385e8ad3196812e2';
const privKey = '1552e84aa697185f06bbd8287725c63362b287bb45d0814308f409ba189f03ba'
const fromAdd  = ethUtil.publicToAddress(publicKey).toString('hex');
console.log('fromAddress ', fromAdd);

web3.eth.getBalance(fromAdd) 
.then(console.log);


const rsv =  async (signature, chainIdHere) => {
  const ret = {};
  ret.r = `0x${signature.slice(0, 64)}`;
  ret.s = `0x${signature.slice(64, 128)}`;
  const recovery = parseInt(signature.slice(128, 130), 16);
 
  let tmpV = chainIdHere ? recovery + (chainIdHere * 2 + 35) : recovery + 27;
  
  if (chainIdHere > 0) {
    tmpV += chainIdHere * 2 + 8;
  }

  ret.v = `0x${tmpV}`;
  return ret;
}

const publishTx = async (rawhex) => {
  return web3.eth.sendSignedTransaction(rawhex)
}

const signHexCommand = (hexraw) => {
  return {
    "command": "sign_hex",
    "params": {
      "transaction": hexraw,
      "blockchain_type": "ethereum",
      "keyname": keyname
    }
  }
}

const publicKeyCommand = { 
  "command": "public_key",
  "params": 
  {
    "keyname": keyname
  }
}

ws.onopen = async () => {
  console.log('ws open');
  const rawHex = await buildTxSinature(
    null, // signature
    fromAdd,
    toAdd,
    '100'
  )
  console.log('sign tx:',rawHex);
  if (HACK) {
    const res = await publishTx(`0x${rawHex}`);
    console.log("result transaction: ", res);
  } else {
  
    sendCommand(signHexCommand(rawHex));
  }

}

function sendCommand(command) {
  ws.send(JSON.stringify(command));  
  console.log('command:', command);
}

ws.on('message', async (response) => {
  const data = JSON.parse(response);
  console.log(data.result); // signature

  const rawHex = await buildTxSinature(
    data.result, // signature
    fromAdd,
    toAdd,
    '100'
  )
  console.log('keychain tx:',rawHex);
  // const rlpHex = rlp.encode(rawHex).toString('hex');
  try {
    await publishTx(`0x${rawHex}`);
  } catch(e) { 
    console.log(e);
  }
  ws.close();
});

const buildTxSinature = async (signature, fromAddress, to, value, data = '') => {
  console.log('buildTxSinature')
  const nonce = await web3.eth.getTransactionCount(fromAddress);
  const gasPrice = await web3.eth.getGasPrice().then(wei => Number(wei))
  const chainIdHere = 4;

  const draftTxParams = {
    nonce,
    gasPrice,
    to,
    value,
    data,
    // EIP 155 chainId - mainnet: 1, ropsten: 3, rinkeby: 4
    chainId: chainIdHere
  }

  const gasLimit = 21000; // await web3.eth.estimateGas(draftTxParams) ||

  let txParams = {
    ...draftTxParams,
    gasLimit
  }

  if (signature) {
    const ret = await rsv(signature, chainIdHere);
    txParams = { ...txParams, ...ret };
  }

  console.log('tx keychain params', txParams)
  const tx = new EthereumTx(txParams)

  if (HACK) {
    const privateKey = Buffer.from(privKey, 'hex');
    tx.sign(privateKey);
    return tx.serialize().toString('hex');   
  } else {
    const buffer = tx.serialize()
    const hex = buffer.toString('hex')
    return hex;  
  }
}
 