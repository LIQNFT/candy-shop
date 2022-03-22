import axiosInstance from '../../config/axiosInstance';

export async function fetchOrdersByStoreId(storeId: string): Promise<any[]> {
  try {
    const res: any = await axiosInstance.get(`/order/${storeId}`);

    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchOrdersByStoreIdAndWalletAddress(
  storeId: string,
  walletAddress: string
): Promise<any[]> {
  try {
    const res: any = await axiosInstance.get(
      `/order/${storeId}?filterArr[]=${JSON.stringify({
        side: 1,
        status: 0,
        walletAddress,
      })}`
    );

    return res.data?.result;
  } catch (error) {
    throw error;
  }
}
