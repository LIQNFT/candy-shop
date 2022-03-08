import axiosInstance from "../../config/axiosInstance";

const MOCK_RES = {
  success: true,
  result: [
    {
      side: 1,
      ticker: 'SOLAND',
      price: "1000322151",
      amount: 1,
      edition: null,
      tokenAccount: '8NvGYg6mdYieSfCgVQrsew5FhXnB4s2VQ8saLHpvQM54',
      tokenMint: null,
      nftUri: null,
      nftImageLink: '',
      nftAnimationLink: 'nftAnimationLink',
      tradeState: 'CA5zQHJ78JKpT9mYGECnHZBgqQNEba9V72SVNymJnaKw',
      status: 0,
      walletAddress: '8vGP7eMjupQ9HSPUDsQ9jbTxZh3wJZiuejkh9aaJLw56'
    },
    {
      side: 1,
      ticker: 'SOLAND',
      price: "1000806644",
      amount: 1,
      edition: null,
      tokenAccount: 'F7kjhTYU3KuvnxPMCRYfemQNN1LExnb2JAsZsLNGPofw',
      tokenMint: null,
      nftUri: null,
      nftImageLink: '',
      nftAnimationLink: 'nftAnimationLink',
      tradeState: '3Er2PE2uS5dv66YzKLLzpjXjUkEBi1P9L3hYLCEt5RSF',
      status: 0,
      walletAddress: '8vGP7eMjupQ9HSPUDsQ9jbTxZh3wJZiuejkh9aaJLw56'
    },
    {
      side: 1,
      ticker: 'SOLAND',
      price: "1000203151",
      amount: 1,
      edition: null,
      tokenAccount: 'FDwDFiiqf6S2kwVCMa5CPhQCFBDg2JJijQ4hteFjKZVX',
      tokenMint: null,
      nftUri: null,
      nftImageLink: '',
      nftAnimationLink: 'nftAnimationLink',
      tradeState: '5mvVbKcJCChR46Zn5se973onmwpxDKBqQEm1ESxEW2Ua',
      status: 0,
      walletAddress: '8vGP7eMjupQ9HSPUDsQ9jbTxZh3wJZiuejkh9aaJLw56'
    },
    {
      side: 1,
      ticker: 'SOLAND',
      price: "1000203151",
      amount: 1,
      edition: null,
      tokenAccount: 'FDwDFiiqf6S2kwVCMa5CPhQCFBDg2JJijQ4hteFjKZVX',
      tokenMint: null,
      nftUri: null,
      nftImageLink: '',
      nftAnimationLink: 'nftAnimationLink',
      tradeState: '5mvVbKcJCChR46Zn5se973onmwpxDKBqQEm1ESxEW2Ua',
      status: 0,
      walletAddress: '8vGP7eMjupQ9HSPUDsQ9jbTxZh3wJZiuejkh9aaJLw56'
    },
    {
      side: 1,
      ticker: 'SOLAND',
      price: "1000203151",
      amount: 1,
      edition: null,
      tokenAccount: 'FDwDFiiqf6S2kwVCMa5CPhQCFBDg2JJijQ4hteFjKZVX',
      tokenMint: null,
      nftUri: null,
      nftImageLink: '',
      nftAnimationLink: 'nftAnimationLink',
      tradeState: '5mvVbKcJCChR46Zn5se973onmwpxDKBqQEm1ESxEW2Ua',
      status: 0,
      walletAddress: '8vGP7eMjupQ9HSPUDsQ9jbTxZh3wJZiuejkh9aaJLw56'
    }, {
      side: 1,
      ticker: 'SOLAND',
      price: "1000203151",
      amount: 1,
      edition: null,
      tokenAccount: 'FDwDFiiqf6S2kwVCMa5CPhQCFBDg2JJijQ4hteFjKZVX',
      tokenMint: null,
      nftUri: null,
      nftImageLink: '',
      nftAnimationLink: 'nftAnimationLink',
      tradeState: '5mvVbKcJCChR46Zn5se973onmwpxDKBqQEm1ESxEW2Ua',
      status: 0,
      walletAddress: '8vGP7eMjupQ9HSPUDsQ9jbTxZh3wJZiuejkh9aaJLw56'
    }
  ],
  offset: 0,
  count: 3,
  totalCount: 3
}

export async function fetchOrderByStoreId(storeId: string): Promise<any[]> {
  return MOCK_RES.result;

  try {
    let res: any = await axiosInstance.get(`/order/${storeId}`);

    return res.result;

  } catch (error) {
    throw new Error('Connection Error');
  }
}