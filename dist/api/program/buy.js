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
exports.buyNft = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
function buyNft(walletKeyPair, tokenAccount, tokenAccountMint, treasuryMint, metadata, authority, authorityBump, auctionHouse, feeAccount, candyShop, price, amount, program) {
    return __awaiter(this, void 0, void 0, function* () {
        const [buyerEscrow, buyerEscrowBump] = yield (0, utils_1.getAuctionHouseEscrow)(auctionHouse, walletKeyPair.publicKey);
        const [tradeState, tradeStateBump] = yield (0, utils_1.getAuctionHouseTradeState)(auctionHouse, walletKeyPair.publicKey, tokenAccount, treasuryMint, tokenAccountMint, amount, price);
        const transaction = new web3_js_1.Transaction();
        const isNative = treasuryMint.equals(constants_1.WRAPPED_SOL_MINT);
        const ata = (yield (0, utils_1.getAtaForMint)(treasuryMint, walletKeyPair.publicKey))[0];
        const ix = yield program.instruction.buyWithProxy(price, amount, tradeStateBump, buyerEscrowBump, authorityBump, {
            accounts: {
                wallet: walletKeyPair.publicKey,
                paymentAccount: isNative ? walletKeyPair.publicKey : ata,
                transferAuthority: walletKeyPair.publicKey,
                treasuryMint,
                tokenAccount,
                metadata,
                escrowPaymentAccount: buyerEscrow,
                authority,
                auctionHouse,
                auctionHouseFeeAccount: feeAccount,
                buyerTradeState: tradeState,
                candyShop,
                ahProgram: constants_1.AUCTION_HOUSE_PROGRAM_ID,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
            },
        });
        transaction.add(ix);
        const txHash = yield (0, web3_js_1.sendAndConfirmTransaction)(program.provider.connection, transaction, [walletKeyPair]);
        console.log("buy order placed");
        return {
            ahBuyerTradeState: tradeState,
            ahBuyerTradeStateBump: tradeStateBump,
            txHash,
        };
    });
}
exports.buyNft = buyNft;
//# sourceMappingURL=buy.js.map