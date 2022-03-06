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
exports.executeSale = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
/**
 * Assume the seller is the wallet and the counterParty is the buyer
 * @param walletKeyPair
 * @param counterParty
 * @param tokenAccount
 * @param tokenAccountMint
 * @param treasuryMint
 * @param metadata
 * @param authority
 * @param authorityBump
 * @param auctionHouse
 * @param feeAccount
 * @param price
 * @param program
 */
function executeSale(walletKeyPair, counterParty, tokenAccount, tokenAccountMint, treasuryMint, auctionHouseTreasury, metadata, authority, authorityBump, auctionHouse, feeAccount, candyShop, price, amount, sellerOrder, buyerOrder, program) {
    return __awaiter(this, void 0, void 0, function* () {
        const [escrow, escrowBump] = yield (0, utils_1.getAuctionHouseEscrow)(auctionHouse, walletKeyPair.publicKey);
        const transaction = new web3_js_1.Transaction();
        const isNative = treasuryMint.equals(constants_1.WRAPPED_SOL_MINT);
        const ix = yield program.instruction.executeSaleWithProxy(price, amount, escrowBump, sellerOrder.ahFreeTradeStateBump, sellerOrder.ahProgramAsSignerBump, authorityBump, true, {
            accounts: {
                buyer: walletKeyPair.publicKey,
                seller: counterParty,
                tokenAccount,
                tokenMint: tokenAccountMint,
                metadata,
                treasuryMint,
                escrowPaymentAccount: escrow,
                sellerPaymentReceiptAccount: isNative
                    ? counterParty
                    : (yield (0, utils_1.getAtaForMint)(treasuryMint, counterParty))[0],
                buyerReceiptTokenAccount: (yield (0, utils_1.getAtaForMint)(tokenAccountMint, walletKeyPair.publicKey))[0],
                authority,
                auctionHouse,
                auctionHouseFeeAccount: feeAccount,
                auctionHouseTreasury,
                buyerTradeState: buyerOrder.ahBuyerTradeState,
                sellerTradeState: sellerOrder.ahSellerTradeState,
                freeTradeState: sellerOrder.ahFreeTradeState,
                candyShop,
                ahProgram: constants_1.AUCTION_HOUSE_PROGRAM_ID,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
                associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                programAsSigner: sellerOrder.ahProgramAsSigner,
                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
            },
        });
        transaction.add(ix);
        const txId = yield (0, web3_js_1.sendAndConfirmTransaction)(program.provider.connection, transaction, [walletKeyPair]);
        console.log("sale executed");
    });
}
exports.executeSale = executeSale;
//# sourceMappingURL=executeSale.js.map