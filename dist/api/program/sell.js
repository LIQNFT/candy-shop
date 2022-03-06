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
exports.sellNft = void 0;
const anchor = __importStar(require("@project-serum/anchor"));
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
function sellNft(walletKeyPair, tokenAccount, tokenAccountMint, treasuryMint, metadata, authority, authorityBump, auctionHouse, feeAccount, candyShop, price, amount, program) {
    return __awaiter(this, void 0, void 0, function* () {
        const [tradeState, tradeStateBump] = yield (0, utils_1.getAuctionHouseTradeState)(auctionHouse, walletKeyPair.publicKey, tokenAccount, treasuryMint, tokenAccountMint, amount, price);
        const [freeTradeState, freeTradeStateBump] = yield (0, utils_1.getAuctionHouseTradeState)(auctionHouse, walletKeyPair.publicKey, tokenAccount, treasuryMint, tokenAccountMint, amount, new anchor.BN(0));
        const [programAsSigner, programAsSignerBump] = yield (0, utils_1.getAuctionHouseProgramAsSigner)();
        const transaction = new web3_js_1.Transaction();
        const ix = yield program.instruction.sellWithProxy(price, amount, tradeStateBump, freeTradeStateBump, programAsSignerBump, authorityBump, {
            accounts: {
                wallet: walletKeyPair.publicKey,
                tokenAccount,
                metadata,
                authority,
                auctionHouse,
                auctionHouseFeeAccount: feeAccount,
                sellerTradeState: tradeState,
                freeSellerTradeState: freeTradeState,
                candyShop,
                ahProgram: constants_1.AUCTION_HOUSE_PROGRAM_ID,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
                programAsSigner,
                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
            },
        });
        transaction.add(ix);
        const txHash = yield (0, web3_js_1.sendAndConfirmTransaction)(program.provider.connection, transaction, [walletKeyPair]);
        console.log("sell order placed");
        return {
            ahSellerTradeState: tradeState,
            ahSellerTradeStateBump: tradeStateBump,
            ahFreeTradeState: freeTradeState,
            ahFreeTradeStateBump: freeTradeStateBump,
            ahProgramAsSigner: programAsSigner,
            ahProgramAsSignerBump: programAsSignerBump,
            txHash
        };
    });
}
exports.sellNft = sellNft;
//# sourceMappingURL=sell.js.map