// import { NFT, Collection, User, Pool } from "../../generated/schema";
import {
    RegisterETH as RegisterETHEvent,
    RegisterToken as RegisterTokenEvent,
    RegisterNFTs as RegisterNFTsEvent,
    WithdrawETH as WithdrawETHEvent,
    WithdrawToken as WithdrawTokenEvent,
    WithdrawNFTs as WithdrawNFTsEvent,
} from "../../generated/SpeedBump/SpeedBump";
import { SpeedBumpPosition, SpeedBumpToken, SpeedBumpCollection, SpeedBumpCollectionTokenID } from "../../generated/schema";
import { ONE_BI, BI_18, ZERO_BI } from "../constants";

export function handleRegisterETH(event: RegisterETHEvent): void {

    const _owner = event.params.owner.toHexString().toLowerCase();
    const _amount = event.params.amount;
  
    let speedBumpPosition = SpeedBumpPosition.load(_owner);
    if (speedBumpPosition == null) {
      speedBumpPosition = new SpeedBumpPosition(_owner);
      speedBumpPosition.value = ZERO_BI;
    }

    speedBumpPosition.value = speedBumpPosition.value.plus(_amount);
    speedBumpPosition.save();
}

export function handleRegisterToken(event: RegisterTokenEvent): void {
    const _owner = event.params.owner.toHexString().toLowerCase();
    const _token = event.params.token.toHexString().toLowerCase();
    const _amount = event.params.amount;
  
    let speedBumpPosition = SpeedBumpPosition.load(_owner);
    if (speedBumpPosition == null) {
      speedBumpPosition = new SpeedBumpPosition(_owner);
      speedBumpPosition.value = ZERO_BI;
    }
  
    let speedBumpToken = SpeedBumpToken.load(_owner + "-" + _token);
    if (speedBumpToken == null) {
      speedBumpToken = new SpeedBumpToken(_owner + "-" + _token);
      speedBumpToken.amount = ZERO_BI;
      speedBumpToken.position = speedBumpPosition.id;
    }
    
    speedBumpToken.amount = speedBumpToken.amount.plus(_amount);
    speedBumpToken.save();
    speedBumpPosition.save();
}

export function handleRegisterNFTs(event: RegisterNFTsEvent): void {
    const _owner = event.params.owner.toHexString().toLowerCase();
    const _collection = event.params.collection.toHexString().toLowerCase();
    const _tokenIds = event.params.tokenIds;
  
    let speedBumpPosition = SpeedBumpPosition.load(_owner);
    if (speedBumpPosition == null) {
      speedBumpPosition = new SpeedBumpPosition(_owner);
      speedBumpPosition.value = ZERO_BI;
    }
  
    let speedBumpCollection = SpeedBumpCollection.load(_owner + "-" + _collection);
    if (speedBumpCollection == null) {
        speedBumpCollection = new SpeedBumpCollection(_owner + "-" + _collection);
        speedBumpCollection.position = speedBumpPosition.id;
    }

    for (let i = 0; i < _tokenIds.length; i++) {
        let speedBumpCollectionTokenID = SpeedBumpCollectionTokenID.load(_owner + "-" + _collection + "-" + _tokenIds[i].toString());
        if (speedBumpCollectionTokenID == null) {
            speedBumpCollectionTokenID = new SpeedBumpCollectionTokenID(_owner + "-" + _collection + "-" + _tokenIds[i].toString());
            speedBumpCollectionTokenID.tokenId = _tokenIds[i];
        }   
        speedBumpCollectionTokenID.collection = speedBumpCollection.id;
        speedBumpCollectionTokenID.save();
    }

    speedBumpCollection.save();
    speedBumpPosition.save();
}

export function handleWithdrawETH(event: WithdrawETHEvent): void {
    const _sender = event.params.sender.toHexString().toLowerCase();
    const _amount = event.params.amount;
  
    let speedBumpPosition = SpeedBumpPosition.load(_sender);
    if (speedBumpPosition == null) {
      return;
    }

    speedBumpPosition.value = speedBumpPosition.value.minus(_amount);
    speedBumpPosition.save();
}

export function handleWithdrawNFTs(event: WithdrawNFTsEvent): void {

  const _sender = event.params.sender.toHexString().toLowerCase();
  const _collection = event.params.collection.toHexString().toLowerCase();
  const _tokenIds = event.params.tokenIds;

  let speedBumpPosition = SpeedBumpPosition.load(_sender);
  if (speedBumpPosition == null) {
    return;
  }

  let speedBumpCollection = SpeedBumpCollection.load(_sender + "-" + _collection);
  if (speedBumpCollection == null) {
    return;
  }

  for (let i = 0; i < _tokenIds.length; i++) {
    let speedBumpCollectionTokenID = SpeedBumpCollectionTokenID.load(_sender + "-" + _collection + "-" + _tokenIds[i].toString());
    if (speedBumpCollectionTokenID == null) {
        continue;
    } else {
        speedBumpCollectionTokenID.tokenId = null;
        speedBumpCollectionTokenID.save();
    }  
  }

  speedBumpCollection.save();
  speedBumpPosition.save();
} 

export function handleWithdrawToken(event: WithdrawTokenEvent): void {
  const _sender = event.params.sender.toHexString().toLowerCase();
  const _token = event.params.token.toHexString().toLowerCase();
  const _amount = event.params.amount;

  let speedBumpPosition = SpeedBumpPosition.load(_sender);
  if (speedBumpPosition == null) {
    return;
  }

  let speedBumpToken = SpeedBumpToken.load(_sender + "-" + _token);
  if (speedBumpToken == null) {
    return
  }

  speedBumpToken.amount = speedBumpToken.amount.minus(_amount);
  speedBumpToken.save();
  speedBumpPosition.save();
}
