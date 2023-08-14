const ethers = require('ethers');
const chainA_contractABI = require('./abi/contract_abi_A.json');
const chainB_contractABI = require('./abi/contract_abi_B.json');

require("dotenv").config();

const chainA_contract_address = process.env.CONTRACT_ADDRESS_CHAIN_A;
const chainB_contract_address = process.env.CONTRACT_ADDRESS_CHAIN_B;

const provider_A = new ethers.WebSocketProvider(process.env.ALCHEMY_WEBSOCKET_CHAIN_A);
const admin_wallet_A = new ethers.Wallet(process.env.PRIVATE_KEY_WALLET, provider_A);
const contract_A = new ethers.Contract(chainA_contract_address, chainA_contractABI, admin_wallet_A);


const provider_B= new ethers.WebSocketProvider(process.env.ALCHEMY_WEBSOCKET_CHAIN_B);
const admin_wallet_B = new ethers.Wallet(process.env.PRIVATE_KEY_WALLET, provider_B);
const contract_B = new ethers.Contract(chainB_contract_address, chainB_contractABI, admin_wallet_B);

//=========================== EVENT HANDLERS =========================

async function LockedEventHandler_ChainA( amount, sender, date, event) {

  try {
    console.log("Emitted Locked Event")

    const gasfee = BigInt(2) * amount/ BigInt(100);
    const transaction = await contract_B.TransferOnChain(BigInt(amount) , sender, gasfee)
    console.log(transaction)

  }catch(e){
    console.log(e)
  }
}


async function ReleasedEventHandler_ChainA(amount, owner, date, event) {
  console.log("Emitted Released Event")
  //call 
}

async function TransferToUserEventHandler_ChainB(amount, owner, date, event) {
  console.log("Emitted TransferToUser Event")

}

async function TransferToContractEventHandler_ChainB(amount, sender, date, event) {
  //call release function on contract A
   try {
    console.log("Emitted TransferToContract Event")

    const gasfee = BigInt(2) * amount/ BigInt(100);
    const transaction = await contract_A.Release(BigInt(amount) , sender, gasfee)
    console.log(transaction)
  }catch(e){
    console.log(e)
  }
}



//=========================== MAIN FUNCTION =========================
async function main() {

    try {
      
      contract_A.on('Locked', (amount, owner, date, event) => {
        setTimeout(()=> {
          LockedEventHandler_ChainA( amount, owner, date, event)
        }, 30000)
    })

    contract_A.on('Released', (amount, owner, date, event) => {
      setTimeout(()=> {
        ReleasedEventHandler_ChainA(amount, owner, date, event)
      }, 30000)
  })

    
    contract_B.on('TransferToUser', (amount, owner, date, event) => {
          setTimeout(()=> {
            TransferToUserEventHandler_ChainB(amount, owner, date, event)
          }, 30000)
      })
      
      contract_B.on('TransferToContract', (amount, owner, date, event) => {
        setTimeout(()=> {
          TransferToContractEventHandler_ChainB(amount, owner, date, event)
        }, 30000)
    })

    } catch(e) {
        console.log(e)
    }
 }

main();