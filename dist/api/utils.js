"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAtaForMint = exports.getAuctionHouseEscrow = exports.getAuctionHouseTreasuryAcct = exports.getAuctionHouseFeeAcct = exports.getAuctionHouseTradeState = exports.getAuctionHouseProgramAsSigner = exports.getCandyShop = exports.getAuctionHouseAuthority = exports.getAuctionHouse = void 0;
const anchor = __importStar(require("@project-serum/anchor"));
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("./constants");
const getAuctionHouse = (creator, treasuryMint) => __awaiter(void 0, void 0, void 0, function* () {
    return web3_js_1.PublicKey.findProgramAddress([Buffer.from(constants_1.AUCTION_HOUSE), creator.toBuffer(), treasuryMint.toBuffer()], constants_1.AUCTION_HOUSE_PROGRAM_ID);
});
exports.getAuctionHouse = getAuctionHouse;
const getAuctionHouseAuthority = (creator, marketProgramId) => __awaiter(void 0, void 0, void 0, function* () {
    return web3_js_1.PublicKey.findProgramAddress([Buffer.from(constants_1.CANDY_STORE), creator.toBuffer(), Buffer.from(constants_1.AUTHORITY)], marketProgramId);
});
exports.getAuctionHouseAuthority = getAuctionHouseAuthority;
const getCandyShop = (creator, marketProgramId) => __awaiter(void 0, void 0, void 0, function* () {
    return web3_js_1.PublicKey.findProgramAddress([Buffer.from(constants_1.CANDY_STORE), creator.toBuffer()], marketProgramId);
});
exports.getCandyShop = getCandyShop;
const getAuctionHouseProgramAsSigner = () => {
    return web3_js_1.PublicKey.findProgramAddress([Buffer.from(constants_1.AUCTION_HOUSE), Buffer.from("signer")], constants_1.AUCTION_HOUSE_PROGRAM_ID);
};
exports.getAuctionHouseProgramAsSigner = getAuctionHouseProgramAsSigner;
const getAuctionHouseTradeState = (auctionHouse, wallet, tokenAccount, treasuryMint, tokenMint, tokenSize, buyPrice) => __awaiter(void 0, void 0, void 0, function* () {
    return anchor.web3.PublicKey.findProgramAddress([
        Buffer.from(constants_1.AUCTION_HOUSE),
        wallet.toBuffer(),
        auctionHouse.toBuffer(),
        tokenAccount.toBuffer(),
        treasuryMint.toBuffer(),
        tokenMint.toBuffer(),
        buyPrice.toBuffer("le", 8),
        tokenSize.toBuffer("le", 8),
    ], constants_1.AUCTION_HOUSE_PROGRAM_ID);
});
exports.getAuctionHouseTradeState = getAuctionHouseTradeState;
const getAuctionHouseFeeAcct = (auctionHouse) => __awaiter(void 0, void 0, void 0, function* () {
    return web3_js_1.PublicKey.findProgramAddress([
        Buffer.from(constants_1.AUCTION_HOUSE),
        auctionHouse.toBuffer(),
        Buffer.from(constants_1.FEE_PAYER),
    ], constants_1.AUCTION_HOUSE_PROGRAM_ID);
});
exports.getAuctionHouseFeeAcct = getAuctionHouseFeeAcct;
const getAuctionHouseTreasuryAcct = (auctionHouse) => __awaiter(void 0, void 0, void 0, function* () {
    return web3_js_1.PublicKey.findProgramAddress([
        Buffer.from(constants_1.AUCTION_HOUSE),
        auctionHouse.toBuffer(),
        Buffer.from(constants_1.TREASURY),
    ], constants_1.AUCTION_HOUSE_PROGRAM_ID);
});
exports.getAuctionHouseTreasuryAcct = getAuctionHouseTreasuryAcct;
const getAuctionHouseEscrow = (auctionHouse, wallet) => __awaiter(void 0, void 0, void 0, function* () {
    return web3_js_1.PublicKey.findProgramAddress([Buffer.from(constants_1.AUCTION_HOUSE), auctionHouse.toBuffer(), wallet.toBuffer()], constants_1.AUCTION_HOUSE_PROGRAM_ID);
});
exports.getAuctionHouseEscrow = getAuctionHouseEscrow;
const getAtaForMint = (mint, buyer) => __awaiter(void 0, void 0, void 0, function* () {
    return web3_js_1.PublicKey.findProgramAddress([buyer.toBuffer(), spl_token_1.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
});
exports.getAtaForMint = getAtaForMint;
//# sourceMappingURL=utils.js.map