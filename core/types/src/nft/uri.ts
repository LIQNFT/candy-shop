export interface nftUriInfo {
  name: string;
  symbol: string;
  description: string;
  seller_fee_basis_points: number;
  image: string;
  animation_url: string | undefined;
  attributes: { [key: string]: string }[];
  external_url: string;
  properties: object;
}

// {
//   "name":"LIQ’s Voyage - Solana",
//   "symbol":"SOLAND",
//   "description":"LIQ’s Voyage is an interactive NFT series that follows LIQ, a SolPunk from Solana, as she travels through different blockchains and metaverses in search of life’s adventure and meaning. The start of it all is SolanaLand, where she aped into the wormhole and embarked on her journey.",
//   "seller_fee_basis_points":500,
//   "image":"https://www.arweave.net/TpkEyWka_H192dTAvCRFgGEdhK9deaxPJ_9FZe7gxj8?ext=jpeg",
//   "animation_url":"https://www.arweave.net/wP_6dWvChZHLGg_lVLv-eGCNj4kRa5lkWNDKG1gamRo?ext=mp4",
//   "attributes":[
//      {
//         "trait_type":"Location",
//         "value":"Solana"
//      },
//      {
//         "trait_type":"Wormhole",
//         "value":"Radiant"
//      },
//      {
//         "trait_type":"Sky",
//         "value":"Dark Night"
//      },
//      {
//         "trait_type":"Landscape",
//         "value":"City"
//      },
//      {
//         "trait_type":"Terraform",
//         "value":"Liquid"
//      },
//      {
//         "trait_type":"Color Theme",
//         "value":"Solana Hue"
//      }
//   ],
//   "external_url":"",
//   "properties":{
//      "files":[
//         {
//            "uri":"https://www.arweave.net/TpkEyWka_H192dTAvCRFgGEdhK9deaxPJ_9FZe7gxj8?ext=jpeg",
//            "type":"image/jpeg"
//         },
//         {
//            "uri":"https://www.arweave.net/wP_6dWvChZHLGg_lVLv-eGCNj4kRa5lkWNDKG1gamRo?ext=mp4",
//            "type":"video/mp4"
//         }
//      ],
//      "category":"video",
//      "creators":[
//         {
//            "address":"FwuKATKXh5mpdH8ay7XSvKyU93rhfymMH2Jc8Wd4dVGK",
//            "share":100
//         }
//      ]
//   }
// }
