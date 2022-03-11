import axiosInstance from "../../config/axiosInstance";

export async function fetchTradeById(storeId: string): Promise<any> {
  try {
    const { data } = await axiosInstance.get(`/trade/${storeId}`);

    return data.result;

  } catch (error) {
    throw error;
  }
}