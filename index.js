const bip39 = require('bip39')
const ethers = require('ethers');
const minstd = require('@stdlib/random-base-minstd');
const { messagePrefix } = require('@ethersproject/hash');
const { randomBytes } = require('ethers/lib/utils');

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/a56217fd59d249ce8e7572cb04d4513d");
const mnemonic = bip39.generateMnemonic();
const entropy = bip39.mnemonicToEntropy(mnemonic);
const i = "0x" + entropy;

(async () => {
    for (let index = 0; index < 100000; index++) {
        const mnemonic = bip39.entropyToMnemonic(ethers.utils.hexZeroPad(ethers.BigNumber.from(i).add(index), 16).substring(2));

        const wallet = ethers.Wallet.fromMnemonic(mnemonic);

        balance = await provider.getBalance(wallet.address)
        console.log(mnemonic, wallet.address, balance.toString());
    }
})();