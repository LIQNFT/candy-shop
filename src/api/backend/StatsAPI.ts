import axiosInstance from "../../config/axiosInstance";

export async function fetchStatsById(storeId: string): Promise<any> {
  try {
    const { data } = await axiosInstance.get(`/stats/${storeId}`);

    return data.result;

  } catch (error) {
    throw error;
  }
}

export async function fetchStatsMintById(storeId: string, mint: string): Promise<any> {
  try {
    const { data } = await axiosInstance.get(`/stats/${storeId}/${mint}`);

    return data.result;

  } catch (error) {
    throw error;
  }
}