#!/bin/bash
# setup permission before execute script: chmod +x deploy-official-studio.sh

echo "############################## Choose The Network ##############################"

networks=("goerli" "sepolia")

select network in "${networks[@]}"; do
  case $network in
    "sepolia"|"goerli")
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
graph auth --studio e5187c15694526c4fa893b1cf3a9de77
graph deploy --studio $network-seacows-amm --version-label 1.1.0