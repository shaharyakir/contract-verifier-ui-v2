# contract-verifier

A UI app to display verified contract proofs and to submit Ton smart contract sources for on-chain verification.

## Related repositories

This repo is a part of the following:

1. [contract-verifier-contracts](https://github.com/ton-community/contract-verifier-contracts) - Sources registry contracts which stores an on-chain proof per code cell hash.
2. [contract-verifier-backend](https://github.com/ton-community/contract-verifier-backend) - Backend for compiling FunC and returning a signature over a message containing the resulting code cell hash.
3. [contract-verifier-sdk](https://github.com/ton-community/contract-verifier-sdk) - A UI component to fetch and display sources from Ton blockchain and IPFS, including FunC code highlighting.
4. contract-verifier (this repo) - A UI app to interact with the backend, contracts and publish an on-chain proof.

## Deployment

This app is deployed via github actions on github pages for this repository.

### Environment variables

- `VITE_VERIFIER_ID` - id of the verifier registered with the verifier registry
- `VITE_SOURCES_REGISTRY` / `VITE_SOURCES_REGISTRY_TESTNET` - sources registry to fetch data from
- `VITE_BACKEND_URL` / `VITE_BACKEND_URL_TESTNET` - urls for backend (split by comma)

## Running

- `npm install`
- `npm run dev`

## Appendix: Adding new FunC versions

1. Add the wasm binding in package json, as such:

```
"func-js-bin-0.4.3": "npm:@ton-community/func-js-bin@^0.4.3",
```

2. Add the version to https://github.com/ton-community/contract-verifier-config
3. Redeploy backend https://github.com/ton-community/contract-verifier-backend

## License

MIT
