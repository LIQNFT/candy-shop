export interface NftCreator {
  address: string;
  share: number;
  verified?: number;
}

export interface NftFiles {
  uri: string;
  type: string;
}

export interface NftProperties {
  files: NftFiles[];
  category: string;
  creators: NftCreator[];
}
export interface NftAttribute {
  value: string;
  trait_type: string;
}
