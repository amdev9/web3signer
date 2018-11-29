var Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx');
const ethUtil = require('ethereumjs-util');

const API_KEY = 'https://rinkeby.infura.io/v3/046804e3dd3240b09834531326f310cf';
const API_KEY_ALEXEY = 'https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl';
// const GANACHE = 'http://127.0.0.1:7545';
let web3 = new Web3(new Web3.providers.HttpProvider(API_KEY_ALEXEY)); //

const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:16384/');
const keyname = 'test1@76dd37589a2f5d5b';
 
const toAdd = '0xE8899BA12578d60e4D0683a596EDaCbC85eC18CC';
 
const publicKey = '0x038a5bde3b24dac796c3236ada3ed9cbcf02c6450f6e233d398aa58c3cf6e7c93343242aef1c697da5ea1aa7b1123636882cc3ee0e02873a10a8a072b4a9bc18';
const fromAdd  = ethUtil.publicToAddress(publicKey).toString('hex');
console.log('fromAddress ', fromAdd);

web3.eth.getBalance(fromAdd) 
.then(console.log);


const rsv =  async (signature, chainIdHere) => {
  const ret = {};
  ret.r = `0x${signature.slice(0, 64)}`;
  ret.s = `0x${signature.slice(64, 128)}`;
  const recovery = parseInt(signature.slice(128, 130), 16);
 
  const tmpV = chainIdHere ? recovery + (chainIdHere * 2 + 35) : recovery + 27;
 
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
      "keyname": "test1@76dd37589a2f5d5b"
    }
  }
}

const publicKeyCommand = { 
  "command": "public_key",
  "params": 
  {
    "keyname": "test1@76dd37589a2f5d5b"
  }
}

ws.onopen = async () => {
  console.log('ws open');
  const raw = await buildTxSinature(
    null, // signature
    fromAdd,
    toAdd,
    '100'
  )
  sendCommand(signHexCommand(raw));
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
  console.log(rawHex);
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
  const buffer = tx.serialize()
  const hex = buffer.toString('hex')
  return hex;
}
