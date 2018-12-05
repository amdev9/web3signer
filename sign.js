var Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx');
const ethUtil = require('ethereumjs-util');
const rlp = require('rlp');
var txDecoder = require('ethereum-tx-decoder');


// const API_KEY = 'https://rinkeby.infura.io/v3/046804e3dd3240b09834531326f310cf';
const API_KEY = 'https://ropsten.infura.io/v3/046804e3dd3240b09834531326f310cf';
const API_KEY_ALEXEY = 'https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl';
// const GANACHE = 'http://127.0.0.1:7545';
let web3 = new Web3(new Web3.providers.HttpProvider(API_KEY)); //

const toAdd = '0xE8899BA12578d60e4D0683a596EDaCbC85eC18CC';

const publicKey = '0x6a99ea8d33b64610e1c9ff689f3e95b6959a0cc039621154c7b69c019f015f4521bb9f3fc36a4d447002787d4d408da968185fc5116b8ffd385e8ad3196812e2';
const privKey = '1552e84aa697185f06bbd8287725c63362b287bb45d0814308f409ba189f03ba'
const fromAdd = ethUtil.publicToAddress(publicKey).toString('hex');


console.log('fromAddress ', fromAdd);

// web3.eth.getBalance(fromAdd) 
// .then(console.log);

const publishTx = async (rawhex) => {
  var decodedTx = txDecoder.decodeTx(rawhex);
  console.log('decodedTx: ', decodedTx);
  return web3.eth.sendSignedTransaction(rawhex)
}

const main = async () => {

  const buildTxSinature = async (signature, fromAddress, to, value, data = '') => {
    console.log('buildTxSinature')
    const nonce = await web3.eth.getTransactionCount(fromAddress);
    const gasPrice = await web3.eth.getGasPrice().then(wei => Number(wei))
    const chainIdHere = 3;

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

    const privateKey = Buffer.from(privKey, 'hex');
    tx.sign(privateKey);
    console.log("validate sign transaction ", tx.validate() ? "SUCCESSFULL" : "FAILURE");
    return tx.serialize().toString('hex');

  }

  const rawHex = await buildTxSinature(
    null, // signature
    fromAdd,
    toAdd,
    100
  )
  console.log('sign tx:', rawHex);

  const res = await publishTx(`0x${rawHex}`);
  console.log("result transaction: ", res);

}
main();