import client from "../../../core/api/client";

export const venueService = {
  fetchPublicVenues: async (params = {}) => {
    const { data } = await client.get("/venues/", { params });
    return data;
  },

  fetchVenueById: async (id) => {
    const { data } = await client.get(`/venues/${id}`);
    return data;
  },

  fetchVenueReviews: async (venueId) => {
    const { data } = await client.get(`/venues/${venueId}/reviews`);
    return data;
  },

  checkAvailability: async (venueId, bookingDate, timeSlot) => {
    const { data } = await client.get(`/venues/${venueId}/availability`, {
      params: { booking_date: bookingDate, time_slot: timeSlot },
    });
    return data;
  },

  checkAvailabilityRange: async (venueId, { check_in_date, check_in_time, check_out_date, check_out_time }) => {
    const { data } = await client.get(`/venues/${venueId}/availability/range`, {
      params: { check_in_date, check_in_time, check_out_date, check_out_time },
    });
    return data;
  },
};