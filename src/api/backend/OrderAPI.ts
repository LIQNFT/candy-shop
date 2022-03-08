import axiosInstance from "../../config/axiosInstance";

export async function fetchOrdersByStoreId(storeId: string): Promise<any[]> {
  try {
    let res: any = await axiosInstance.get(`/order/${storeId}`);

    return res.data;
  } catch (error) {
    throw error;
  }
}