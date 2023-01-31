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
