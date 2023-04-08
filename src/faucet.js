
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { BN } from "bn.js";
import { checkAddress } from "@polkadot/util-crypto";

export default class Faucet {

    constructor(config) {
        this.config = config;
        this.api = null;
        this.init();
    };

    async init() {


        const ws = new WsProvider(this.config.ws);
        // this.api = await ApiPromise.create({ types: types, provider: ws });
        this.api = await ApiPromise.create({
            ws,
            rpc: {
                kate: {
                    blockLength: {
                        description: "Get Block Length",
                        params: [
                            {
                                name: 'at',
                                type: 'Hash',
                                isOptional: true
                            }
                        ],
                        type: 'BlockLength'
                    },
                    queryProof: {
                        description: 'Generate the kate proof for the given `cells`',
                        params: [
                            {
                                name: 'cells',
                                type: 'Vec<Cell>'
                            },
                            {
                                name: 'at',
                                type: 'Hash',
                                isOptional: true
                            },
                        ],
                        type: 'Vec<u8>'
                    },
                    queryDataProof: {
                        description: 'Generate the data proof for the given `index`',
                        params: [
                            {
                                name: 'data_index',
                                type: 'u32'
                            },
                            {
                                name: 'at',
                                type: 'Hash',
                                isOptional: true
                            }
                        ],
                        type: 'DataProof'
                    }
                }
            },
            types: {
                AppId: 'Compact<u32>',
                DataLookupIndexItem: {
                    appId: 'AppId',
                    start: 'Compact<u32>'
                },
                DataLookup: {
                    size: 'Compact<u32>',
                    index: 'Vec<DataLookupIndexItem>'
                },
                KateCommitment: {
                    rows: 'Compact<u16>',
                    cols: 'Compact<u16>',
                    dataRoot: 'H256',
                    commitment: 'Vec<u8>'
                },
                V1HeaderExtension: {
                    commitment: 'KateCommitment',
                    appLookup: 'DataLookup'
                },
                VTHeaderExtension: {
                    newField: 'Vec<u8>',
                    commitment: 'KateCommitment',
                    appLookup: 'DataLookup'
                },
                HeaderExtension: {
                    _enum: {
                        V1: 'V1HeaderExtension',
                        VTest: 'VTHeaderExtension'
                    }
                },
                DaHeader: {
                    parentHash: 'Hash',
                    number: 'Compact<BlockNumber>',
                    stateRoot: 'Hash',
                    extrinsicsRoot: 'Hash',
                    digest: 'Digest',
                    extension: 'HeaderExtension'
                },
                Header: 'DaHeader',
                CheckAppIdExtra: {
                    appId: 'AppId'
                },
                CheckAppIdTypes: {},
                CheckAppId: {
                    extra: 'CheckAppIdExtra',
                    types: 'CheckAppIdTypes'
                },
                BlockLength: {
                    max: 'PerDispatchClass',
                    cols: 'Compact<u32>',
                    rows: 'Compact<u32>',
                    chunkSize: 'Compact<u32>'
                },
                PerDispatchClass: {
                    normal: 'u32',
                    operational: 'u32',
                    mandatory: 'u32'
                },
                DataProof: {
                    root: 'H256',
                    proof: 'Vec<H256>',
                    numberOfLeaves: 'Compact<u32>',
                    leaf_index: 'Compact<u32>',
                    leaf: 'H256'
                },
                Cell: {
                    row: 'u32',
                    col: 'u32',
                }
            },
            signedExtensions: {
                CheckAppId: {
                    extrinsic: {
                        appId: 'AppId'
                    },
                    payload: {}
                },
            },
        });
        // Retrieve the chain & node information information via rpc calls
        const [chain, nodeName, nodeVersion] = await Promise.all([
            this.api.rpc.system.chain(),
            this.api.rpc.system.name(),
            this.api.rpc.system.version(),
        ]);
        // Log these stats
        console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);

    };

    async send(address) {

        const check = checkAddress(address, this.config.address_type);

        if (check[0]) {
            const keyring = new Keyring({ type: "sr25519" });
            const sender = keyring.addFromUri(this.config.mnemonic);
            // const sender = keyring.addFromUri('//Alice');
            const padding = new BN(10).pow(new BN(this.config.decimals));
            const amount = new BN(this.config.amount).mul(padding);
            console.log(`Sending ${this.config.amount} ${this.config.symbol} to ${address}`);
            const tx = await this.api.tx.balances.transferKeepAlive(address, amount).signAndSend(sender);
            console.log("Transfer sent with hash", tx.toHex());
            return `Done! Transfer ${this.config.amount} ${this.config.symbol} to ${address} with hash ${tx.toHex()}`;
        }

        return `Invalid address! Plese use the Geek network format with address type ${this.config.address_type}! >> <https://my.geekcash.org/#/accounts>`;

    }


};