# Seacows Subgraph

This repository contains the subgraphs for the Seacows Protocol.

## Get Started

```
// 0. genenrate .npmrc to store _authToken
.npmrc
registry=https://registry.npmjs.org/
@yolominds:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=<input your authToken here>

// 1. install dependencies, 
yarn install

// 2. generate subgraph.yaml from subgraph.template.yaml
yarn workspaces run prepare:dev:goerli

// 3. graph codegen and graph build
yarn workspaces run build

// 4. create subgraph node
yarn workspaces run create:dev:goerli

// 5. deploy subgraph node
yarn workspaces run deploy:dev:goerli
```

## Different Environments

local:hardhat
local graph node with local hardhat testnet

local:goerli
local graph node with goerli testnet

dev:goerli
graph node self-host in aws with goerli testnet 