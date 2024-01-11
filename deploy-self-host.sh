#!/bin/bash
# setup permission before execute script: chmod +x deploy-self-host.sh

echo "############################## Choose The Network ##############################"

networks=("mainnet" "polygon" "goerli" "sepolia" "mumbai")

select network in "${networks[@]}"; do
  case $network in
    "mainnet"|"polygon")
      environment="prod"
      break
      ;;
    "sepolia"|"goerli"|"mumbai")
      environment="dev"
      break
      ;;
    *)
      echo "Invalid option. Please select a valid network."
      ;;
  esac
done

echo "You choose the $network network..."
echo "Environment set to: $environment"

# directories
seacows_amm_directory="./packages/seacows-amm"
cd "$seacows_amm_directory"

npx mustache config/$environment/$network.json subgraph.template.yaml > subgraph.yaml
graph codegen
graph build
graph create --node https://subgraph-$network-$environment.seacows.io/deploy seacows/seacows-amm-subgraph
graph deploy --node https://subgraph-$network-$environment.seacows.io/deploy --ipfs https://ipfs-dev.seacows.io seacows/seacows-amm-subgraph --version-label 1.1.0