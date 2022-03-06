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
exports.createAuctionHouse = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
function createAuctionHouse(walletKeyPair, treasuryMint, sellerFeeBasisPoint, feeSplit, program) {
    return __awaiter(this, void 0, void 0, function* () {
        const [auctionHouseAuthority, authorityBump] = yield (0, utils_1.getAuctionHouseAuthority)(walletKeyPair.publicKey, program.programId);
        const [candyShop, candyShopBump] = yield (0, utils_1.getCandyShop)(walletKeyPair.publicKey, program.programId);
        const [auctionHouse, auctionHouseBump] = yield (0, utils_1.getAuctionHouse)(auctionHouseAuthority, treasuryMint);
        const treasuryWithdrawalDestination = treasuryMint === constants_1.WRAPPED_SOL_MINT
            ? auctionHouseAuthority
            : (yield (0, utils_1.getAtaForMint)(treasuryMint, auctionHouseAuthority))[0];
        const [feeAccount, feeBump] = yield (0, utils_1.getAuctionHouseFeeAcct)(auctionHouse);
        const [treasuryAccount, treasuryBump] = yield (0, utils_1.getAuctionHouseTreasuryAcct)(auctionHouse);
        console.log("auctionHouseAuthority ", auctionHouseAuthority.toString());
        console.log("treasuryAccount ", treasuryAccount.toString());
        const txHash = yield program.rpc.createCandyShop(sellerFeeBasisPoint, true, true, authorityBump, auctionHouseBump, feeBump, treasuryBump, candyShopBump, feeSplit, {
            accounts: {
                treasuryMint,
                payer: walletKeyPair.publicKey,
                authority: auctionHouseAuthority,
                feeWithdrawalDestination: walletKeyPair.publicKey,
                treasuryWithdrawalDestination,
                treasuryWithdrawalDestinationOwner: auctionHouseAuthority,
                auctionHouse,
                auctionHouseFeeAccount: feeAccount,
                auctionHouseTreasury: treasuryAccount,
                candyShop,
                ahProgram: constants_1.AUCTION_HOUSE_PROGRAM_ID,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
            },
        });
        console.log("Auction house created!");
        return {
            auctionHouseAuthority,
            authorityBump,
            auctionHouse,
            auctionHouseBump,
            feeAccount,
            feeBump,
            treasuryAccount,
            treasuryBump,
            candyShop,
            txHash,
        };
    });
}
exports.createAuctionHouse = createAuctionHouse;
//# sourceMappingURL=create.js.map