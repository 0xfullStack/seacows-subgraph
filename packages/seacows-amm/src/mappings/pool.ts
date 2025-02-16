import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { Burn, Collection, Mint, Pool, Swap, Token } from "../../generated/schema";
import {
  Swap as SwapEvent,
  Burn as BurnEvent,
  Mint as MintEvent,
  Pool as PoolContract
} from "../../generated/templates/Pool/Pool";
import { ONE_BI, BI_18, ZERO_BD, ONE_BD, PERCENTAGE_PRECISION } from "../constants";
import {
  convertTokenToDecimal,
  loadTransaction,
  convertTokenToInt,
  updatePoolDayData,
  updatePoolWeekData,
  updatePoolYearData,
  getCurrentPrice,
  updateAPR
} from "../utils";

export function handleSwap(event: SwapEvent): void {
  let poolAddress = event.address;
  let pool = Pool.load(poolAddress.toHexString()) as Pool;

  let token = Token.load(pool.token) as Token;
  let collection = Collection.load(pool.collection) as Collection;

  let tokenAmount = convertTokenToDecimal(event.params.tokenIn.minus(event.params.tokenOut), token.decimals);
  let nftAmount = convertTokenToInt(event.params.nftIn.minus(event.params.nftOut), BI_18);

  // daily data
  let poolDayData = updatePoolDayData(event);
  // weekly data
  let poolWeekData = updatePoolWeekData(event);
  // yearly data
  let poolYearData = updatePoolYearData(event);

  // update token data
  token.txCount = token.txCount.plus(ONE_BI);

  // update collection data
  collection.txCount = collection.txCount.plus(ONE_BI);

  // update pool data
  let poolContract = PoolContract.bind(poolAddress);
  pool.txCount = pool.txCount.plus(ONE_BI);
  pool.liquidity = poolContract.totalSupply();

  let transaction = loadTransaction(event);
  let swap = new Swap(transaction.id.toString() + "#" + pool.txCount.toString());
  swap.transaction = transaction.id;
  swap.timestamp = transaction.timestamp;
  swap.pool = pool.id;
  swap.token = pool.token;
  swap.sender = event.params.sender;
  swap.origin = event.transaction.from;
  swap.collection = pool.collection;
  swap.tokenAmount = tokenAmount;
  swap.nftAmount = nftAmount;

  const volume = convertTokenToDecimal(event.params.tokenIn.plus(event.params.tokenOut), token.decimals);
  // update last day price
  // check if lastDayPrice is stale
  const dayID = event.block.timestamp.toI32() / 86400;
  const lastPriceDayId = pool.lastPriceAt.toI32() / 86400;
  if (lastPriceDayId < dayID) {
    pool.lastDayPrice = pool.lastPrice;
    pool.lastDayPriceAt = pool.lastPriceAt;
  }
  // update last week price
  // check if lastWeekPrice is stale
  const weekID = event.block.timestamp.toI32() / (86400 * 7);
  const lastPriceWeekId = pool.lastPriceAt.toI32() / (86400 * 7);
  if (lastPriceWeekId < weekID) {
    pool.lastWeekPrice = pool.lastPrice;
    pool.lastWeekPriceAt = pool.lastPriceAt;
  }
  // store last price
  pool.lastPrice = pool.price;
  pool.lastPriceAt = pool.priceAt;
  // update pool price
  pool.priceAt = event.block.timestamp;
  pool.price = getCurrentPrice(poolAddress);
  // update pool change time
  pool.timestamp = transaction.timestamp;

  // update daily data
  poolDayData.volume = poolDayData.volume.plus(volume);
  if (!pool.lastDayPrice.equals(ZERO_BD) && !pool.price.equals(ZERO_BD)) {
    poolDayData.priceChange = pool.price.minus(pool.lastDayPrice).div(pool.lastDayPrice).times(PERCENTAGE_PRECISION);
  } else {
    poolDayData.priceChange = pool.price.minus(pool.initialPrice).div(pool.initialPrice).times(PERCENTAGE_PRECISION);
  }
  // update weekly data
  poolWeekData.volume = poolWeekData.volume.plus(volume);
  if (!pool.lastWeekPrice.equals(ZERO_BD) && !pool.price.equals(ZERO_BD)) {
    poolWeekData.priceChange = pool.price.minus(pool.lastWeekPrice).div(pool.lastWeekPrice).times(PERCENTAGE_PRECISION);
  } else {
    poolWeekData.priceChange = pool.price.minus(pool.initialPrice).div(pool.initialPrice).times(PERCENTAGE_PRECISION);
  }
  // update yearly data
  poolYearData.volume = poolYearData.volume.plus(volume);
  if (!pool.lastWeekPrice.equals(ZERO_BD) && !pool.price.equals(ZERO_BD)) {
    poolYearData.priceChange = pool.price.minus(pool.lastWeekPrice).div(pool.lastWeekPrice).times(PERCENTAGE_PRECISION);
  } else {
    poolYearData.priceChange = pool.price.minus(pool.initialPrice).div(pool.initialPrice).times(PERCENTAGE_PRECISION);
  }

  pool.save();
  swap.save();
  token.save();
  collection.save();

  poolDayData.save();
  poolWeekData.save();
  poolYearData.save();

  // update apr
  updateAPR(event);
}

export function handleMint(event: MintEvent): void {
  let poolAddress = event.address;
  let pool = Pool.load(poolAddress.toHexString()) as Pool;

  let token = Token.load(pool.token) as Token;
  let collection = Collection.load(pool.collection) as Collection;

  let tokenAmount = convertTokenToDecimal(event.params.tokenAmount, token.decimals);
  let nftAmount = convertTokenToInt(event.params.nftAmount, BI_18);

  // daily data
  updatePoolDayData(event);
  // weekly data
  updatePoolWeekData(event);
  // yearly data
  updatePoolYearData(event);

  // update token data
  token.txCount = token.txCount.plus(ONE_BI);

  // update collection data
  collection.txCount = collection.txCount.plus(ONE_BI);

  // update pool data
  let poolContract = PoolContract.bind(poolAddress);
  pool.txCount = pool.txCount.plus(ONE_BI);
  pool.liquidity = poolContract.totalSupply();

  let transaction = loadTransaction(event);
  let mint = new Mint(transaction.id.toString() + "#" + pool.txCount.toString());
  mint.transaction = transaction.id;
  mint.timestamp = transaction.timestamp;
  mint.pool = pool.id;
  mint.token = pool.token;
  mint.collection = pool.collection;
  mint.sender = event.params.sender;
  mint.origin = event.transaction.from;
  mint.tokenAmount = tokenAmount;
  mint.nftAmount = nftAmount;

  // update last day price
  // check if lastDayPrice is stale
  const dayID = event.block.timestamp.toI32() / 86400;
  const lastPriceDayId = pool.lastPriceAt.toI32() / 86400;
  if (lastPriceDayId < dayID) {
    pool.lastDayPrice = pool.lastPrice;
    pool.lastDayPriceAt = pool.lastPriceAt;
  }
  // update last week price
  // check if lastWeekPrice is stale
  const weekID = event.block.timestamp.toI32() / (86400 * 7);
  const lastPriceWeekId = pool.lastPriceAt.toI32() / (86400 * 7);
  if (lastPriceWeekId < weekID) {
    pool.lastWeekPrice = pool.lastPrice;
    pool.lastWeekPriceAt = pool.lastPriceAt;
  }
  // store last price
  pool.lastPrice = pool.price;
  pool.lastPriceAt = pool.priceAt;
  // update pool price
  pool.priceAt = event.block.timestamp;
  pool.price = getCurrentPrice(poolAddress);
  // update pool change time
  pool.timestamp = transaction.timestamp;

  pool.save();
  mint.save();
  token.save();
  collection.save();

  // update apr
  updateAPR(event);
}

export function handleBurn(event: BurnEvent): void {
  let poolAddress = event.address;
  let pool = Pool.load(poolAddress.toHexString()) as Pool;

  let token = Token.load(pool.token) as Token;
  let collection = Collection.load(pool.collection) as Collection;

  let tokenAmount = convertTokenToDecimal(event.params.tokenAmountOut, token.decimals);
  let nftAmount = BigInt.fromI32(event.params.idsOut.length); //convertTokenToInt(event.params.idsOut.length, BI_18);

  // daily data
  updatePoolDayData(event);
  // weekly data
  updatePoolWeekData(event);
  // yearly data
  updatePoolYearData(event);

  // update token data
  token.txCount = token.txCount.plus(ONE_BI);

  // update collection data
  collection.txCount = collection.txCount.plus(ONE_BI);

  // update pool data
  let poolContract = PoolContract.bind(poolAddress);
  pool.txCount = pool.txCount.plus(ONE_BI);
  pool.liquidity = poolContract.totalSupply();

  let transaction = loadTransaction(event);
  let burn = new Burn(transaction.id.toString() + "#" + pool.txCount.toString());
  burn.transaction = transaction.id;
  burn.timestamp = transaction.timestamp;
  burn.pool = pool.id;
  burn.token = pool.token;
  burn.collection = pool.collection;
  burn.sender = event.params.sender;
  burn.origin = event.transaction.from;
  burn.tokenAmount = tokenAmount;
  burn.nftAmount = nftAmount;

  // update last day price
  // check if lastDayPrice is stale
  const dayID = event.block.timestamp.toI32() / 86400;
  const lastPriceDayId = pool.lastPriceAt.toI32() / 86400;
  if (lastPriceDayId < dayID) {
    pool.lastDayPrice = pool.lastPrice;
    pool.lastDayPriceAt = pool.lastPriceAt;
  }
  // update last week price
  // check if lastWeekPrice is stale
  const weekID = event.block.timestamp.toI32() / (86400 * 7);
  const lastPriceWeekId = pool.lastPriceAt.toI32() / (86400 * 7);
  if (lastPriceWeekId < weekID) {
    pool.lastWeekPrice = pool.lastPrice;
    pool.lastWeekPriceAt = pool.lastPriceAt;
  }
  // store last price
  pool.lastPrice = pool.price;
  pool.lastPriceAt = pool.priceAt;
  // update pool price
  pool.priceAt = event.block.timestamp;
  pool.price = getCurrentPrice(poolAddress);
  // update pool change time
  pool.timestamp = transaction.timestamp;

  pool.save();
  burn.save();
  token.save();
  collection.save();

  // update apr
  updateAPR(event);
}
