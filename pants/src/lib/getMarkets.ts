import { EchelonClient } from "@echelonmarket/echelon-sdk";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";


async function getMarkets() {

    // create the aptos instance
    const aptos = new Aptos(
        new AptosConfig({
            network: Network.MAINNET,
            fullnode: "https://api.mainnet.aptoslabs.com/v1",
        })
    );

    const client = new EchelonClient(aptos, "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba");

    // // get all markets
    const markets = await client.getAllMarkets();
    const market = markets[0]; // use the first market as an example
    return market;
}

getMarkets()
    .then(market => {
        console.log("First market details:", market);
        // Do something with the market data here
    })
    .catch(error => {
        console.error("Error fetching markets:", error);
    });
