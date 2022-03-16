import axiosInstance from '../../config/axiosInstance';

export async function fetchOrdersByStoreId(storeId: string): Promise<any[]> {
  try {
    let res: any = await axiosInstance.get(`/order/${storeId}`);

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
    const filterArr = JSON.stringify({
      side: 1,
      status: 0,
      walletAddress,
    });

    let res: any = await axiosInstance.get(
      `/order/${storeId}?filterArr[]=${filterArr}`
    );

    return res.data.result;
  } catch (error) {
    throw error;
  }
}
