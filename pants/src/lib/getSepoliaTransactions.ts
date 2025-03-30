import { ethers } from "ethers";

async function getSepoliaTransactions(address: string) {
    const provider = new ethers.JsonRpcProvider(
        'https://site1.moralis-nodes.com/sepolia/9efa625d2a0d4ec2b8f138ecce8da119'
    );

    const response = await provider.send("eth_getTransactions", [
        {
            address: address, 
        },
    ])
    return response;
}

console.log(getSepoliaTransactions('0x9e1747D602cBF1b1700B56678F4d8395a9755235'));