"use strict";
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
exports.cancelOrder = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("../constants");
function cancelOrder(walletKeyPair, tokenAccount, tokenAccountMint, authority, authorityBump, auctionHouse, feeAccount, tradeState, candyShop, price, amount, program) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = new web3_js_1.Transaction();
        const ix = yield program.instruction.cancelWithProxy(price, amount, authorityBump, {
            accounts: {
                wallet: walletKeyPair.publicKey,
                tokenAccount,
                tokenMint: tokenAccountMint,
                authority,
                auctionHouse,
                auctionHouseFeeAccount: feeAccount,
                tradeState,
                candyShop,
                ahProgram: constants_1.AUCTION_HOUSE_PROGRAM_ID,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            },
        });
        transaction.add(ix);
        const txId = yield (0, web3_js_1.sendAndConfirmTransaction)(program.provider.connection, transaction, [walletKeyPair]);
        console.log("order cancelled");
    });
}
exports.cancelOrder = cancelOrder;
//# sourceMappingURL=cancel.js.map