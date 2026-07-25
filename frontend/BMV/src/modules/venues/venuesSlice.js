import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { venueService } from "./services/venueService";

export const fetchPublicVenuesAsync = createAsyncThunk(
  "venues/fetchPublic",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await venueService.fetchPublicVenues(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchVenueByIdAsync = createAsyncThunk(
  "venues/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await venueService.fetchVenueById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchVenueReviewsAsync = createAsyncThunk(
  "venues/fetchReviews",
  async (venueId, { rejectWithValue }) => {
    try {
      return await venueService.fetchVenueReviews(venueId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const checkAvailabilityRangeAsync = createAsyncThunk(
  "venues/checkAvailabilityRange",
  async ({ venueId, ...rangeParams }, { rejectWithValue }) => {
    try {
      return await venueService.checkAvailabilityRange(venueId, rangeParams);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const venuesSlice = createSlice({
  name: "venues",
  initialState: {
    list: [],
    isLoadingList: false,
    listError: null,

    selected: null,
    isLoadingSelected: false,
    selectedError: null,

    reviews: [],
    isLoadingReviews: false,
    reviewsError: null,

    availabilityRange: null,
    isCheckingRange: false,
    availabilityRangeError: null,
  },
  reducers: {
    clearSelectedVenue(state) {
      state.selected = null;
      state.selectedError = null;
    },
    clearVenueReviews(state) {
      state.reviews = [];
      state.reviewsError = null;
    },
    clearAvailabilityRange(state) {
      state.availabilityRange = null;
      state.availabilityRangeError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicVenuesAsync.pending, (state) => {
        state.isLoadingList = true;
        state.listError = null;
      })
      .addCase(fetchPublicVenuesAsync.fulfilled, (state, action) => {
        state.isLoadingList = false;
        state.list = action.payload;
      })
      .addCase(fetchPublicVenuesAsync.rejected, (state, action) => {
        state.isLoadingList = false;
        state.listError = action.payload;
      });

    builder
      .addCase(fetchVenueByIdAsync.pending, (state) => {
        state.isLoadingSelected = true;
        state.selectedError = null;
        state.selected = null;
      })
      .addCase(fetchVenueByIdAsync.fulfilled, (state, action) => {
        state.isLoadingSelected = false;
        state.selected = action.payload;
      })
      .addCase(fetchVenueByIdAsync.rejected, (state, action) => {
        state.isLoadingSelected = false;
        state.selectedError = action.payload;
      });

    builder
      .addCase(fetchVenueReviewsAsync.pending, (state) => {
        state.isLoadingReviews = true;
        state.reviewsError = null;
      })
      .addCase(fetchVenueReviewsAsync.fulfilled, (state, action) => {
        state.isLoadingReviews = false;
        state.reviews = action.payload;
      })
      .addCase(fetchVenueReviewsAsync.rejected, (state, action) => {
        state.isLoadingReviews = false;
        state.reviewsError = action.payload;
      });

    builder
      .addCase(checkAvailabilityRangeAsync.pending, (state) => {
        state.isCheckingRange = true;
        state.availabilityRangeError = null;
        state.availabilityRange = null;
      })
      .addCase(checkAvailabilityRangeAsync.fulfilled, (state, action) => {
        state.isCheckingRange = false;
        state.availabilityRange = action.payload;
      })
      .addCase(checkAvailabilityRangeAsync.rejected, (state, action) => {
        state.isCheckingRange = false;
        state.availabilityRangeError = action.payload;
      });
  },
});

export const { clearSelectedVenue, clearVenueReviews, clearAvailabilityRange } = venuesSlice.actions;
export default venuesSlice.reducer;