import { ApiResponse } from "../../../types/ApiResponse";
import { Booking } from "../../../types/BookingData";
import {
  IContact,
  ICreateContactPayload,
  IPaginatedContactsResponse,
  IUpdateContactPayload,
} from "../../../types/Contact";
import axiosInstance from "../axiosInstance";

interface IPayloadGetContacts {
  page?: number;
  limit?: number;
  search?: string;
  is_own_only?: boolean;
  filters?: string;
}

const getPaginatedContacts = async (
  params: IPayloadGetContacts
): Promise<ApiResponse<IPaginatedContactsResponse>> => {
  try {
    const response = await axiosInstance.get("/contacts", { params });
    return response.data;
  } catch (error) {
    console.error("Error in getPaginatedContacts", error);
    throw error;
  }
};

const createContact = async (payload: ICreateContactPayload) => {
  try {
    const response = await axiosInstance.post("/contacts", payload);
    return response.data;
  } catch (error) {
    console.error("Error in createContact", error);
    throw error;
  }
};

const deleteContacts = async (contactIds: string[]) => {
  try {
    const response = await axiosInstance.delete("/contacts", {
      data: { contactIds },
    });
    return response.data;
  } catch (error) {
    console.error("Error in deleteContacts", error);
    throw error;
  }
};

const updateContacts = async (
  contactIds: string[],
  payload: IUpdateContactPayload
) => {
  try {
    const response = await axiosInstance.patch("/contacts", {
      contactIds,
      payload,
    });
    return response.data;
  } catch (error) {
    console.error("Error in updateContacts", error);
    throw error;
  }
};

const getContactDetails = async (contactId: string) => {
  try {
    const response = await axiosInstance.get<{
      message: string;
      data: IContact;
    }>(`/contacts/${contactId}`);
    return response.data;
  } catch (error) {
    console.error("Error in getContactDetails", error);
    throw error;
  }
};

const updateSingleContact = async (
  contactId: string,
  payload: IUpdateContactPayload
): Promise<{
  message: string;
  data: IContact;
}> => {
  try {
    const response = await axiosInstance.patch(
      `/contacts/${contactId}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error in updateContact", error);
    throw error;
  }
};

const updateLists = async (contactId: string, contactListIds: string[]) => {
  try {
    const response = await axiosInstance.patch(
      `/contacts/${contactId}/update-lists`,
      {
        contactListIds,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error in updateLists", error);
    throw error;
  }
};

const getContactBookings = async ({
  contactId,
  page,
  limit,
  search,
}: {
  contactId: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ApiResponse<ListResponse<Booking>>> => {
  try {
    const response = await axiosInstance.get(
      `/contacts/${contactId}/get-bookings`,
      {
        params: {
          page,
          limit,
          search,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error in getContactBookings", error);
    throw error;
  }
};

export {
  getPaginatedContacts,
  createContact,
  deleteContacts,
  updateContacts,
  getContactDetails,
  updateSingleContact,
  updateLists,
  getContactBookings,
};
