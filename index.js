const bip39 = require('bip39')
const ethers = require('ethers');
const minstd = require('@stdlib/random-base-minstd');
const { messagePrefix } = require('@ethersproject/hash');
const { randomBytes } = require('ethers/lib/utils');
const {BigQuery} = require('@google-cloud/bigquery');
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/a56217fd59d249ce8e7572cb04d4513d");
const mnemonic = bip39.generateMnemonic();
const entropy = bip39.mnemonicToEntropy(mnemonic);
const i = "0x" + entropy;
const datasetId = "bigquery-public-data.crypto_ethereum";
const tableId = "balances";
let addresses = {};

(async () => {
    for (let index = 0; index < 100000; index++) {
        const mnemonic = bip39.entropyToMnemonic(ethers.utils.hexZeroPad(ethers.BigNumber.from(i).add(index), 16).substring(2));
        if (bip39.validateMnemonic(mnemonic) == false) {
            console.log(mnemonic);
        }

        const address = ethers.utils.HDNode.fromMnemonic(mnemonic).address;
        addresses[address] = mnemonic;

        if (index % 100 == 0 && index != 0) {
            console.log(index);
            const bigquery = new BigQuery();

            const query = `select *
            from \`bigquery-public-data.crypto_ethereum.balances\`
            where eth_balance > 0 AND 
            address IN ('${Object.keys(addresses).join("','")}')`;
      
          // Create table reference.
          const dataset = bigquery.dataset(datasetId);
          const destinationTable = dataset.table(tableId);
      
          // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#jobconfigurationquery
          const queryOptions = {
            query: query,
          };
      
          // Run the query as a job
          const [job] = await bigquery.createQueryJob(queryOptions);
      
          // Wait for the job to finish.
          const [rows] = await job.getQueryResults();

          rows.forEach(row => {
            console.log(`address: ${row.address}, eth_balance: ${row.eth_balance.toString()}, mnemonic: ${addresses[row.address]}`);
          });

          addresses = {};
        }
    }
})();