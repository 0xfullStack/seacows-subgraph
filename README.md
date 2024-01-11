# Seacows Subgraph

This repository contains the subgraphs for the Seacows Protocol.

## Get Started
### Genenrate .npmrc to store _authToken
```
.npmrc
registry=https://registry.npmjs.org/
@yolominds:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=<input your authToken here>
```

### Install dependencies, 
`yarn install`

### Generate subgraph.yaml from subgraph.template.yaml
`yarn workspaces run prepare:dev:goerli`

### Graph codegen and graph build
`yarn workspaces run build`

### Create subgraph node
`yarn workspaces run create:dev:goerli`

### Deploy subgraph node
`yarn workspaces run deploy:dev:goerli`