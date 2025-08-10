import axios from 'axios';
import { hashPassword } from '../utils/authHelper';
import { getDaysDifference, getNowJalali, smartDateParser } from '../utils/dateUtils';

const API_URL = '/api';
const apiClient = axios.create({ baseURL: API_URL });

// Helper function for a short delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// Helper function to generate unique IDs with prefix
const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}${timestamp}_${random}`;
};

// Auth APIs
export const getUserByEmail = async (email) => {
  try {
    const response = await axios.get(`${API_URL}/users?email=${email}`);
    return response.data[0];
  } catch (error) {
    throw new Error('خطا در دریافت اطلاعات کاربر');
  }
};

export const updateUserLogin = async (userId, loginData) => {
  try {
    const response = await axios.patch(`${API_URL}/users/${userId}`, {
      ...loginData,
      updatedAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    throw new Error('خطا در به‌روزرسانی اطلاعات ورود');
  }
};

// Users APIs
export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  } catch (error) {
    throw new Error('خطا در دریافت لیست کاربران');
  }
};

export const createUser = async (userData) => {
  try {
    const emailCheckResponse = await axios.get(`${API_URL}/users?email=${userData.email}`);
    if (emailCheckResponse.data.toLowerCase().length > 0) {
      throw new Error('EXISTED EMAIL')
    }
    const { confirmPassword, ...userWithoutConfirm } = userData;
    const hashedPassword = await hashPassword(userData.password);

    const data = {
      ...userData,
      password: hashedPassword,
      id: generateUniqueId('usr'),
      role: userData.role || 'Guest',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null,
      status: 'active'
    };

    const response = await axios.post(`${API_URL}/users`, data);
    return response.data;
  } catch (error) {
    throw new Error('این ایمیل قبلاً ثبت شده است');
  }
};

export const updateUser = async (userId, userData) => {
  try {
    console.log('updateUser called with:', { userId, userData });

    if (!userId) {
      throw new Error('شناسه کاربر نامعتبر است');
    }

    if (!userData) {
      throw new Error('داده‌های کاربر نامعتبر است');
    }

    const data = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
      status: userData.status,
      updatedAt: new Date().toISOString()
    };

    console.log('Sending data to API:', data); 

    const response = await axios.patch(`${API_URL}/users/${userId}`, data);
    console.log('API response:', response.data); 

    return response.data;
  } catch (error) {
    console.error('Update User Error:', error);
    throw new Error('خطا در به‌روزرسانی کاربر');
  }
};

export const deleteUser = async (userId) => {
  try {
    await axios.delete(`${API_URL}/users/${userId}`);
    return true;
  } catch (error) {
    throw new Error('خطا در حذف کاربر');
  }
};


const handleAddRoom = async (values) => {
  try {
    const roomData = {
      ...values,
      hotelId: user?.hotelId,
      status: values.status ? 'available' : 'unavailable',
      image: imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await createRoomMutation.mutateAsync(roomData);
  } catch (error) {
    notification.error({
      message: 'خطا',
      description: error.message || 'خطا در ایجاد اتاق'
    });
  }
};


export const updateUserProfile = async ({ userId, formData }) => {
  try {
    const updateData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone')
    };

    const newImage = formData.get('avatar');
    if (newImage) {
      const imageUrl = await handleImageUpload(newImage);
      updateData.profileImage = imageUrl;
    }

    const response = await axios.patch(`${API_URL}/users/${userId}`, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('خطا در به‌روزرسانی پروفایل');
  }
};

const handleImageUpload = async (file) => {
  try {

    return URL.createObjectURL(file);
  } catch (error) {
    throw new Error('خطا در آپلود تصویر');
  }
};

export const fetchHotels = async (filters = {}) => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  // Helper function for retry logic
  const fetchWithRetry = async (attempt = 1) => {
    try {
      // Clean filters object - remove React Query internals
      const cleanFilters = Object.keys(filters).reduce((acc, key) => {
        // Skip React Query internal properties
        if (['client', 'signal', 'queryKey'].includes(key)) return acc;

        // Only include valid filter properties
        const validFilters = [
          'minPrice', 'maxPrice', 'city', 'category', 'maxGuests',
          'search', 'amenities', 'checkIn', 'checkOut'
        ];

        if (validFilters.includes(key)) {
          acc[key] = filters[key];
        }
        return acc;
      }, {});

      // Extract filters from input
      const { minPrice, maxPrice, city, category, maxGuests, ...otherFilters } = cleanFilters;

      // Prepare request parameters
      const params = new URLSearchParams();

      // Add sorting
      params.append('_sort', 'createdAt');
      params.append('_order', 'desc');

      // Add filters
      if (city) params.append('city_like', city);
      if (category) params.append('category', category);
      if (minPrice !== undefined) params.append('price_gte', minPrice);
      if (maxPrice !== undefined) params.append('price_lte', maxPrice);

      // Add other valid filters
      Object.keys(otherFilters).forEach(key => {
        if (otherFilters[key] !== undefined && otherFilters[key] !== null) {
          params.append(key, otherFilters[key]);
        }
      });

      // API request with timeout
      const response = await axios.get(`${API_URL}/hotels`, {
        params,
        timeout: 10000, // 10 second timeout
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Resolve only if status code < 500
        }
      });

      if (response.status >= 400) {
        throw new Error(response.data?.message || `Request failed with status ${response.status}`);
      }

      // Validate response structure
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid hotel data format received');
      }

      // Normalize hotel data (keep your existing normalization logic)
      const normalizedHotels = response.data;

      // Apply maxGuests filter if provided
      if (maxGuests !== undefined) {
        return normalizedHotels.filter(hotel => hotel.maxGuests >= maxGuests);
      }

      return normalizedHotels;

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt >= MAX_RETRIES) {
        // More detailed error logging
        console.error('Final failure after retries:', {
          endpoint: `${API_URL}/hotels`,
          params: filters,
          error: {
            message: error.message,
            response: error.response?.data,
            stack: error.stack
          }
        });

        throw new Error(error.response?.data?.message ||
          error.message ||
          'خطا در دریافت لیست هتل‌ها');
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      return fetchWithRetry(attempt + 1);
    }
  };

  return fetchWithRetry();
};


export const updateHotel = async (hotelId, hotelData) => {
  try {
    console.log('Update hotel called with ID:', hotelId, 'and data:', hotelData);

    if (!hotelId) {
      throw new Error('شناسه هتل نامعتبر است');
    }

    const data = {
      ...hotelData,
      maxGuests: hotelData.maxGuests,
      price: hotelData.price || 0,
      priceRange: {
        min: hotelData.price || 0,
        max: hotelData.price * 1.2 || 0 
      },
      updatedAt: new Date().toISOString()
    };

    const response = await axios.patch(`${API_URL}/hotels/${hotelId}`, data);
    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Update Hotel Error:', error);
    throw error.response?.data?.message || error.message || 'خطا در به‌روزرسانی هتل';
  }
};

export const createHotel = async (hotelData) => {
  try {
    const data = {
      ...hotelData,
      id: generateUniqueId('htl'),
      maxGuests: hotelData.maxGuests,
      price: hotelData.price || 0,
      priceRange: {
        min: hotelData.price || 0,
        max: hotelData.price * 1.2 || 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };
    console.log(data)
    const response = await axios.post(`${API_URL}/hotels`, data);
    return response.data;
  } catch (error) {
    throw new Error('خطا در ایجاد هتل');
  }
};
export const fetchHotelDetails = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/hotels/${id}`);
    return {
      ...response.data,
      maxGuests: response.data.maxGuests
    }
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    throw new Error('خطا در دریافت جزئیات هتل');
  }
};



export const deleteHotel = async (hotelId) => {
  try {
    const response = await axios.delete(`${API_URL}/hotels/${hotelId}`);
    return response.data;
  } catch (error) {
    console.error('Delete Hotel Error:', error);
    throw new Error('خطا در حذف هتل');
  }
};


export const fetchReservations = async () => {
  try {
    // Get all reservations, users, and hotels in parallel
    const [reservationsRes, usersRes, hotelsRes] = await Promise.all([
      axios.get(`${API_URL}/reservations`).catch(e => { console.error("Reservation fetch failed:", e); return { data: [] }; }),
      axios.get(`${API_URL}/users`).catch(e => { console.error("User fetch failed:", e); return { data: [] }; }),
      axios.get(`${API_URL}/hotels`).catch(e => { console.error("Hotels fetch failed:", e); return { data: [] }; }),
    ]);

    if (!reservationsRes.data || !Array.isArray(reservationsRes.data)) {
      throw new Error('Invalid reservations data');
    }

    // Create maps for quick lookup
    const usersMap = new Map(usersRes.data.map(user => [user.id, user]));
    const hotelsMap = new Map(hotelsRes.data.map(hotel => [hotel.id, hotel]));
    const now = getNowJalali();

    // Format each reservation with complete data
    const formattedReservations = reservationsRes.data.map(reservation => {
      const user = usersMap.get(reservation.userId) || {};
      const hotel = hotelsMap.get(reservation.hotelId) || {};
      const checkInDate = reservation.checkIn ? smartDateParser(reservation.checkIn) : null;
      const checkOutDate = reservation.checkOut ? smartDateParser(reservation.checkOut) : null;

      // Determine status based on dates
      let status = reservation.status || 'pending';
      if (typeof status === 'object') {
        // Handle object status format
        if (checkOutDate && now > checkOutDate) {
          status.booking = 'completed';
        } else if (checkInDate && now > checkInDate && status.booking === 'confirmed') {
          status.booking = 'active';
        }
      } else {
        // Handle string status format
        if (checkOutDate && now > checkOutDate) {
          status = 'completed';
        } else if (checkInDate && now > checkInDate && status === 'confirmed') {
          status = 'active';
        }
      }

      const amount = reservation.amount || hotel.price || 0;
      const totalPrice = reservation.totalPrice ??
        (reservation.price || hotel.price || 0) *
        (reservation.nights || 1);

      return {
        id: reservation.id,
        hotelName: reservation.hotelName || hotel.name || '',
        user: {
          id: user.id || null,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || ''
        },
        hotel: {
          id: hotel.id || null,
          name: hotel.name || reservation.hotelName || '',
          location: hotel.location || {}
        },
        checkIn: reservation.checkIn || '',
        checkOut: reservation.checkOut || '',
        guests: {
          adults: reservation.guests?.adults || 1,
          children: reservation.guests?.children || 0
        },
        price: reservation.price || hotel.price || 0, // Price per night
        totalPrice: totalPrice, // Total price for all nights
        amount: amount,
        status: status, // Updated status
        createdAt: reservation.createdAt || '',
        notes: reservation.notes || ''
      };
    });

    return formattedReservations;

  } catch (error) {
    console.error('Error in fetchReservations:', error);
    throw new Error('خطا در دریافت رزروها');
  }
};

export const createPaymentIntent = async ({ amount }) => {
  try {
    console.log(`Simulating payment intent creation for amount: ${amount}`);
    return {
      clientSecret: generateUniqueId('pi')
    };
  } catch (error) {
    throw new Error('خطا در ایجاد شناسه پرداخت');
  }
};

export const fetchReservationById = async (reservationId) => {
  try {
    // We use ?_expand=hotel to also include the hotel's details in the response
    const response = await apiClient.get(`/reservations/${reservationId}?_expand=hotel`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reservation details:', error);
    throw new Error('خطا در دریافت اطلاعات رزرو');
  }
};


export const fetchUserReservations = async (userId) => {
  try {
    // 1. Maintain original validation
    if (!userId) {
      throw new Error('شناسه کاربر نامعتبر است');
    }

    // 2. Add retry mechanism for the API call
    let retries = 0;
    const maxRetries = 2;
    let lastError = null;

    while (retries <= maxRetries) {
      try {
        const response = await axios.get(`${API_URL}/reservations`, {
          timeout: 5000, // Add timeout
          headers: {
            'Cache-Control': 'no-cache' // Prevent caching issues
          }
        });

        // 3. Keep original filtering logic
        const allReservations = Array.isArray(response.data) ? response.data : [];
        const userReservations = allReservations.filter(
          reservation => reservation.userId === userId
        );

        return userReservations;

      } catch (error) {
        lastError = error;
        retries++;

        if ([404, 401].includes(error.response?.status)) {
          break;
        }

        if (retries <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          continue;
        }
      }
    }

    // 4. Modified error handling - throw only if we have no data
    console.error('Failed after retries:', {
      userId,
      error: lastError
    });

    // Return empty array instead of throwing for 500 errors
    if (lastError.response?.status === 500) {
      console.warn('Server error - returning empty reservations');
      return [];
    }

    throw new Error(lastError.message || 'خطا در دریافت رزروهای کاربر');

  } catch (error) {
    console.error('Critical error fetching reservations:', error);
    throw error; // Re-throw for the UI to handle
  }
};

export const createReservation = async (reservationData) => {
  try {
    // Validate hotel and guest limits
    const hotelResponse = await axios.get(`${API_URL}/hotels/${reservationData.hotelId}`);
    const hotel = hotelResponse.data;

    const totalGuests = reservationData.guests.adults + (reservationData.guests.children || 0);
    if (totalGuests > hotel.maxGuests) {
      console.error('Guest limit exceeded:', { totalGuests, maxGuests: hotel.maxGuests });
      throw new Error(`تعداد نفرات (${totalGuests}) بیش از حد مجاز (${hotel.maxGuests}) است!`);
    }

    // Clean reservation data and add required fields
    const { hotel: _, ...cleanReservationData } = reservationData;
    const data = {
      ...cleanReservationData,
      id: generateUniqueId('res'),
      hotelName: hotel.name,
      status: {
        booking: 'pending',
        checkIn: 'pending',
        checkOut: 'pending',
      },
      guests: {
        adults: reservationData.guests.adults,
        children: reservationData.guests.children || 0,
      },
      maxGuests: hotel.maxGuests,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Sending reservation data:', data);
    const response = await axios.post(`${API_URL}/reservations`, data);
    console.log('Reservation created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating reservation:', error, {
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.message || 'خطا در ایجاد رزرو');
  }
};


// ...
export const updateReservation = async (reservationData) => {
  try {
    const response = await axios.patch(`${API_URL}/reservations/${reservationData.id}`, reservationData);
    return response.data;
  } catch (error) {
    throw new Error('Error updating reservation');
  }
};

export const deleteReservation = async (reservationId,softDelete=false) => {
  const MAX_ATTEMPTS = 3;
  let attempt = 1;
  let lastError = null;

  while (attempt <= MAX_ATTEMPTS) {
    try {
      if (softDelete) {
        console.log(`Attempt ${attempt}: Soft deleting reservation ${reservationId}`);
        const softDeleteResponse = await axios.patch(`${API_URL}/reservations/${reservationId}`, {
          status: 'cancelled',
          cancellationReason: 'Payment failed',
          updatedAt: new Date().toISOString()
        });
        return {
          id: reservationId,
          deleted: true,
          method: 'soft_delete',
          data: softDeleteResponse.data
        };
      } else {
        console.log(`Attempt ${attempt}: Hard deleting reservation ${reservationId}`);
        await axios.delete(`${API_URL}/reservations/${reservationId}`);
        return {
          id: reservationId,
          deleted: true,
          method: 'hard_delete'
        };
      }
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt >= MAX_ATTEMPTS) break;

      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      attempt++;
    }
  }

  try {
    console.log('All soft delete attempts failed, attempting hard delete');
    await axios.delete(`${API_URL}/reservations/${reservationId}`);
    return {
      id: reservationId,
      deleted: true,
      method: 'hard_delete'
    };
  } catch (finalError) {
    console.error('Final delete attempt failed:', finalError);
    throw new Error(
      `Failed to delete reservation after ${MAX_ATTEMPTS} attempts. ` +
      `Last error: ${lastError?.message || 'Unknown error'}`
    );
  }
};

// Creates a new transaction (e.g., for a refund request)
export const createTransaction = async (transactionData, attempt = 1) => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  try {
    console.log(`Attempt ${attempt}: Creating transaction`, transactionData);

    // Validate required fields
    const requiredFields = ['userId', 'amount', 'reservationId'];
    const missingFields = requiredFields.filter(field => !transactionData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Normalize amount to number
    const amount = Number(transactionData.amount);
    if (isNaN(amount)) {
      throw new Error('Invalid transaction amount');
    }

    // Prepare transaction data
    const data = {
      ...transactionData,
      id: generateUniqueId('txn'),
      amount: amount, // Ensure amount is numeric
      status: transactionData.status || 'pending',
      type: transactionData.type || 'payment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add timeout and retry configuration
    const response = await axios.post(`${API_URL}/transactions`, data, {
      timeout: 10000, // 10 second timeout
      'axios-retry': {
        retries: MAX_RETRIES,
        retryDelay: (retryCount) => {
          return retryCount * RETRY_DELAY;
        }
      }
    });

    console.log('Transaction created successfully:', response.data);
    return response.data;

  } catch (error) {
    console.error(`Transaction creation attempt ${attempt} failed:`, {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });

    if (attempt >= MAX_RETRIES) {
      throw new Error(error.response?.data?.message ||
        `Transaction failed after ${MAX_RETRIES} attempts: ${error.message}`);
    }

    // Wait before retrying (exponential backoff)
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
    return createTransaction(transactionData, attempt + 1);
  }
};
// Fetch Transactions
export const fetchTransactions = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/transactions?userId=${userId}`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    throw new Error('خطا در دریافت تراکنش‌ها');
  }
};

export const fetchTransactionsForReservation = async (reservationId) => {
  try {
    const response = await axios.get(`${API_URL}/transactions?reservationId=${reservationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions for reservation:', error);
    throw new Error('خطا در دریافت تراکنش‌های رزرو');
  }
};

export const fetchAllTransactions = async () => {
  try {
    // Add a high limit to prevent the server from paginating results
    const response = await axios.get(`${API_URL}/transactions?_sort=createdAt&_order=desc&_limit=1000`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error('خطا در دریافت لیست تراکنش‌ها');
  }
};

export const updateTransaction = async (transactionId, dataToUpdate) => {
  try {
    const data = {
      ...dataToUpdate,
      updatedAt: new Date().toISOString(),
    };
    const response = await axios.patch(`${API_URL}/transactions/${transactionId}`, data);
    console.log(response.data)
    return response.data;
  } catch (error) {
    throw new Error('خطا در به‌روزرسانی تراکنش');
  }
};

// Combined function to create reservation and transaction atomically
export const createReservationWithTransaction = async ({ reservationData, transactionData }) => {
  // Constants for retry behavior
  const MAX_ROLLBACK_ATTEMPTS = 3;
  const INITIAL_RETRY_DELAY = 1000; // 1 second
  let reservationId = null;

  try {
    // Enhanced input validation
    if (!reservationData || !transactionData) {
      const error = new Error('داده‌های رزرو یا تراکنش نامعتبر است');
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Validate reservation data
    const requiredReservationFields = ['hotelId', 'userId', 'checkIn', 'checkOut', 'guests'];
    const missingReservationFields = requiredReservationFields.filter(field => !reservationData[field]);

    // Validate transaction data
    const requiredTransactionFields = ['userId', 'amount'];
    const missingTransactionFields = requiredTransactionFields.filter(field => !transactionData[field]);

    if (missingReservationFields.length > 0 || missingTransactionFields.length > 0) {
      const error = new Error(
        `فیلدهای الزامی مفقود هستند: رزرو (${missingReservationFields.join(', ')}), تراکنش (${missingTransactionFields.join(', ')})`
      );
      error.code = 'MISSING_FIELDS';
      throw error;
    }

    // Validate transaction amount
    const amount = Number(transactionData.amount);
    if (isNaN(amount) || amount <= 0) {
      const error = new Error('مبلغ تراکنش نامعتبر است');
      error.code = 'INVALID_AMOUNT';
      throw error;
    }

    // Step 1: Create reservation
    console.log('Attempting to create reservation with data:', {
      ...reservationData,
      price: undefined, // Avoid logging sensitive data
      totalPrice: undefined
    });

    const reservationResponse = await createReservation(reservationData);
    reservationId = reservationResponse.id;
    console.log(`Reservation created successfully. ID: ${reservationId}`);

    // Small delay to allow database synchronization
    await new Promise(resolve => setTimeout(resolve, 350));

    // Step 2: Create transaction
    try {
      console.log('Attempting to create transaction for reservation:', reservationId);
      const transactionPayload = {
        ...transactionData,
        reservationId,
        amount: amount, // Use validated numeric amount
        status: 'موفق' // More descriptive initial status
      };

      const transactionResponse = await createTransaction(transactionPayload);
      console.log(`Transaction created successfully. ID: ${transactionResponse.id}`);

      // Finalize both records
      try {
        // Update reservation status to confirmed
        if (reservationId) {
          await updateReservation(reservationId, {
            status: {
              booking: 'confirmed',
              checkIn: 'pending',
              checkOut: 'pending'
            }
          });
        }

        // Update transaction status to completed
        if (transactionResponse?.id) {
          await updateTransaction(transactionResponse.id, {
            status: 'completed',
            processedAt: new Date().toISOString()
          });
        }

        return {
          reservation: reservationResponse,
          transaction: transactionResponse,
          status: 'completed'
        };

      } catch (finalizationError) {
        console.error('Failed to finalize records:', finalizationError);
        // This is non-critical, so we still return success
        return {
          reservation: reservationResponse,
          transaction: transactionResponse,
          status: 'completed_with_warnings'
        };
      }

    } catch (transactionError) {
      console.error('Transaction failed, initiating rollback procedure...', {
        reservationId,
        error: transactionError.message
      });

      // Enhanced rollback procedure
      let rollbackStatus = 'failed';
      let lastRollbackError = null;

      for (let attempt = 1; attempt <= MAX_ROLLBACK_ATTEMPTS; attempt++) {
        try {
          console.log(`Rollback attempt ${attempt} for reservation ${reservationId}`);

          // Try soft delete first
          const softDeleteResult = await updateReservation(reservationId, {
            status: {
              booking: 'cancelled',
              checkIn: 'cancelled',
              checkOut: 'cancelled'
            },
            cancellationReason: `Payment failed: ${transactionError.message}`,
            updatedAt: new Date().toISOString()
          });

          rollbackStatus = 'soft_deleted';
          console.log('Soft delete successful:', softDeleteResult);
          break;

        } catch (softDeleteError) {
          lastRollbackError = softDeleteError;
          console.error(`Soft delete attempt ${attempt} failed:`, softDeleteError);

          if (attempt < MAX_ROLLBACK_ATTEMPTS) {
            // Exponential backoff before retry
            const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            // Final attempt: try hard delete
            try {
              await deleteReservation(reservationId);
              rollbackStatus = 'hard_deleted';
              console.log('Hard delete successful after soft delete failures');
            } catch (hardDeleteError) {
              console.error('Final hard delete attempt failed:', hardDeleteError);
              lastRollbackError = hardDeleteError;
            }
          }
        }
      }

      // Create recovery record
      try {
        await createTransaction({
          userId: transactionData.userId,
          amount: amount,
          reservationId,
          status: 'failed',
          type: 'payment_recovery',
          description: `Payment failed: ${transactionError.message}. Rollback status: ${rollbackStatus}`,
          errorDetails: {
            originalError: transactionError.message,
            rollbackStatus,
            rollbackError: lastRollbackError?.message
          }
        });
      } catch (recoveryError) {
        console.error('Failed to create recovery transaction:', recoveryError);
      }

      // Prepare error message based on rollback status
      let errorMessage;
      if (rollbackStatus === 'failed') {
        errorMessage = `خطا در ایجاد تراکنش و حذف رزرو. رزرو با شناسه ${reservationId} ممکن است ثبت شده باشد. لطفاً با پشتیبانی تماس بگیرید.`;
      } else {
        errorMessage = `خطا در ایجاد تراکنش. رزرو با شناسه ${reservationId} لغو شد. لطفاً مجدداً تلاش کنید.`;
      }

      const error = new Error(errorMessage);
      error.code = 'TRANSACTION_FAILED';
      error.details = {
        reservationId,
        rollbackStatus,
        originalError: transactionError.message
      };
      throw error;
    }

  } catch (error) {
    console.error('Error in createReservationWithTransaction:', {
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      reservationId,
      reservationData: {
        ...reservationData,
        price: undefined, // Redact sensitive data
        totalPrice: undefined
      },
      transactionData: {
        ...transactionData,
        amount: undefined
      }
    });

    // Preserve original error if it exists
    throw error.code ? error : new Error('خطا در ایجاد رزرو و تراکنش');
  }
};
// ...
// Rooms APIs
export const fetchRoomsByHotel = async (hotelId) => {
  try {
    const response = await axios.get(`${API_URL}/rooms`, {
      params: {
        hotelId,
        status: 'available',
        _sort: 'price',
        _order: 'asc'
      }
    });

    return response.data.map(room => ({
      id: room.id,
      name: room.name || `اتاق ${room.number}`,
      price: room.price || 0,
      capacity: {
        adults: room.capacity?.adults || 2,
        children: room.capacity?.children || 1
      },
      status: room.status || 'available',
      amenities: room.amenities || [],
      description: room.description || ''
    }));
  } catch (error) {
    throw new Error('خطا در دریافت اطلاعات اتاق‌ها');
  }
};

export const updateReservationStatus = async ({ id, status }) => {
  try {
    if (!id) {
      throw new Error('شناسه رزرو الزامی است');
    }

    // First get the current reservation
    const response = await axios.get(`${API_URL}/reservations/${id}`);
    const currentReservation = response.data;

    const now = getNowJalali();
    const checkOutDate = smartDateParser(currentReservation.checkOut);

    if (checkOutDate.isValid() &&
      getDaysDifference(checkOutDate, now) < 0 &&
      status !== 'completed') {
      throw new Error('رزروهای تکمیل شده قابل تغییر نیستند');
    }

    // Prepare the update data
    const updateData = {
      ...currentReservation,
      status: {
        ...(typeof currentReservation.status === 'object'
          ? currentReservation.status
          : { booking: currentReservation.status || 'pending' }),
        booking: status
      },
      updatedAt: new Date().toISOString()
    };

    // Send the update
    const updateResponse = await axios.patch(`${API_URL}/reservations/${id}`, updateData);
    return updateResponse.data;
  } catch (error) {
    console.error('Update Reservation Status Error:', error);
    throw new Error(error.response?.data?.message || 'خطا در به‌روزرسانی وضعیت رزرو');
  }
};

export const approveRefund = async ({ transactionId, reservationId }) => {
  try {
    // Step 1: Update the transaction record.
    await axios.patch(`${API_URL}/transactions/${transactionId}`, {
      status: 'completed',
      type: 'refund_processed',
      processedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Add a small delay to allow the server to process the first write.
    await delay(50);

    // Step 2: Directly update the reservation record without reading it first.
    if (reservationId) {
      await axios.patch(`${API_URL}/reservations/${reservationId}`, {
        status: {
          booking: 'refund_processed',
          checkIn: 'cancelled',
          checkOut: 'cancelled'
        },
        updatedAt: new Date().toISOString()
      });
    }

    return { success: true, transactionId, reservationId };
  } catch (error) {
    console.error('Error approving refund:', error);
    throw new Error('خطا در فرآیند تایید بازپرداخت');
  }
};

export const createRoom = async (roomData) => {
  try {
    const data = {
      ...roomData,
      id: generateUniqueId('rm'),
      hotelId: roomData.hotelId,
      status: roomData.status ? "available" : "unavailable",
      price: roomData.price,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const response = await axios.post(`${API_URL}/rooms`, data);
    return response.data;
  } catch (error) {
    throw new Error("خطا در ایجاد اتاق");
  }
};


export const updateRoom = async (roomId, roomData) => {
  try {
    const response = await axios.patch(`${API_URL}/rooms/${roomId}`, {
      ...roomData,
      updatedAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    throw new Error('خطا در به‌روزرسانی اتاق');
  }
};

export const deleteRoom = async (roomId) => {
  try {
    await axios.patch(`${API_URL}/rooms/${roomId}`, {
      status: 'deleted',
      deletedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    throw new Error('خطا در حذف اتاق');
  }
};

// Favorites APIs
export const addFavorite = async (userId, hotelId) => {
  try {
    const response = await axios.post(`${API_URL}/favorites`, {
      id: generateUniqueId('fav'),
      userId,
      hotelId,
      createdAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    throw new Error('Error adding to favorites');
  }
};

// Remove from favorites
export const removeFavorite = async (favoriteId) => {
  try {
    await axios.delete(`${API_URL}/favorites/${favoriteId}`);
  } catch (error) {
    throw new Error('Error removing from favorites');
  }
};

// Get user favorites
export const getUserFavorites = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/favorites`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw new Error('Error fetching favorites');
  }
};

// Check if hotel is favorite
export const isHotelFavorite = async (userId, hotelId) => {
  try {
    const response = await axios.get(`${API_URL}/favorites`, {
      params: { userId, hotelId }
    });
    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    throw new Error('Error checking favorites');
  }
};

// Toggle favorite (add or remove)
export const toggleFavorite = async (userId, hotelId) => {
  try {
    const existingFavorite = await isHotelFavorite(userId, hotelId);
    if (existingFavorite) {
      await removeFavorite(existingFavorite.id);
      return { action: 'removed', hotelId };
    } else {
      const newFavorite = await addFavorite(userId, hotelId);
      return { action: 'added', hotelId: newFavorite.hotelId };
    }
  } catch (error) {
    throw new Error('Error toggling favorite');
  }
};

//transactions


// Fetch Notifications
export const fetchNotifications = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/notifications?userId=${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('خطا در دریافت نوتیفیکیشن‌ها');
  }
};

// Fetch Reservation Stats
export const fetchReservationStats = async (dateRange) => {
  try {
    const params = {};
    if (dateRange) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }

    const response = await axios.get(`${API_URL}/reservations`, { params });
    return response.data;
  } catch (error) {
    throw new Error('خطا در دریافت آمار رزروها');
  }
};

// Fetch Financial Stats
export const fetchFinancialStats = async (dateRange) => {
  try {
    const params = {};
    if (dateRange) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }

    const response = await axios.get(`${API_URL}/financials`, { params });
    return response.data;
  } catch (error) {
    throw new Error('خطا در دریافت آمار مالی');
  }
};

// Booking Stats APIs
export const fetchBookingStats = async () => {
  try {
    // 1. Get all reservations
    const reservationsResponse = await axios.get(`${API_URL}/reservations`);
    const reservations = reservationsResponse.data;

    // 2. Calculate stats
    const stats = {
      totalBookings: reservations.length,
      averageSatisfaction: 0,
      totalRevenue: 0,
      pieChart: {
        data: [],
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
          type: 'outer',
          content: '{name} {percentage}'
        }
      }
    };

    // Calculate average satisfaction
    const totalSatisfaction = reservations.reduce((sum, res) => sum + (res.rating || 0), 0);
    stats.averageSatisfaction = totalSatisfaction / (reservations.length || 1);

    // Calculate total revenue
    stats.totalRevenue = reservations.reduce((sum, res) => sum + (res.amount || 0), 0);

    // Calculate room type distribution for pie chart
    const roomTypes = {};
    reservations.forEach(res => {
      if (res.roomType) {
        roomTypes[res.roomType] = (roomTypes[res.roomType] || 0) + 1;
      }
    });

    stats.pieChart.data = Object.entries(roomTypes).map(([type, count]) => ({
      type,
      value: count
    }));

    return stats;

  } catch (error) {
    throw new Error('خطا در دریافت آمار رزروها');
  }
};

// Revenue APIs
export const fetchRevenue = async (dateRange) => {
  try {
    const [startDate, endDate] = dateRange;

    // Get reservations within date range
    const response = await axios.get(`${API_URL}/reservations`, {
      params: {
        checkIn_gte: startDate?.format('YYYY-MM-DD'),
        checkIn_lte: endDate?.format('YYYY-MM-DD'),
      }
    });

    const reservations = response.data;

    // Calculate total revenue
    const totalRevenue = reservations.reduce((sum, res) => sum + (res.amount || 0), 0);

    // Prepare data for line chart
    const revenueByDate = {};
    reservations.forEach(res => {
      const date = res.checkIn.split('T')[0];
      revenueByDate[date] = (revenueByDate[date] || 0) + (res.amount || 0);
    });

    const chartData = Object.entries(revenueByDate).map(([date, amount]) => ({
      date,
      amount
    }));

    // Prepare financial report
    const report = Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue,
      expenses: Math.round(revenue * 0.3), // Dummy expenses (30% of revenue)
      profit: Math.round(revenue * 0.7) // Dummy profit (70% of revenue)
    }));

    return {
      totalRevenue,
      chart: {
        data: chartData,
        xField: 'date',
        yField: 'amount',
        xAxis: {
          type: 'time',
          tickCount: 5,
        }
      },
      report
    };

  } catch (error) {
    throw new Error('خطا در دریافت اطلاعات مالی');
  }
};


// Message APIs
export const fetchMessages = async (userId, userRole) => {
  try {
    const response = await axios.get(`${API_URL}/messages`, {
      params: {
        recipient_like: `${userId}|all`,
        _sort: 'createdAt',
        _order: 'desc'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('خطا در دریافت پیام‌ها'); f
  }
};


export const sendMessage = async (messageData) => {
  try {
    const data = {
      id: generateUniqueId('msg'),
      hotelId: messageData.hotelId || null,
      parentId: messageData.parentId || null,
      title: messageData.title || '',
      content: messageData.content,
      sender: {
        id: messageData.sender.id,
        name: messageData.sender.name || 'کاربر'
      },
      recipient: messageData.recipient || 'all',
      recipientType: messageData.recipientType || 'all',
      createdAt: new Date().toISOString(),
      status: 'read', 
      isPublic: true 
    };

    const response = await axios.post(`${API_URL}/messages`, data);
    return response.data;
  } catch (error) {
    throw new Error('خطا در ارسال پیام');
  }
};


// This function will get all public comments for a specific hotel.
export const fetchCommentsForHotel = async (hotelId) => {
  try {
    if (!hotelId) return []; // Return an empty array if no hotelId is provided

    const response = await axios.get(`${API_URL}/messages`, {
      params: {
        hotelId: hotelId,
        isPublic: true, 
        _sort: 'createdAt',
        _order: 'desc'
      }
    });

    // It ensures every comment has a 'sender' object before it reaches the component.
    const safeMessages = response.data.map(message => ({
      ...message,
      sender: message.sender || { name: 'کاربر ناشناس', id: null }
    }));

    return safeMessages;

  } catch (error) {
    console.error('Error fetching comments for hotel:', error);
    throw new Error('خطا در دریافت دیدگاه‌ها');
  }
};

export const fetchPublicMessages = async () => {
  try {
    const response = await axios.get(`${API_URL}/messages`, {
      params: {
        isPublic: true,
        _sort: 'createdAt',
        _order: 'desc'
      }
    });
    const safeMessages = response.data.map(message => ({
      ...message,
      // If message.sender is missing or null, provide a default object.
      sender: message.sender || { name: 'کاربر ناشناس', id: null }
    }));
    return safeMessages;
  } catch (error) {
    throw new Error('خطا در دریافت پیام‌های عمومی');
  }
};


export const markMessageAsRead = async (messageId) => {
  try {
    const response = await axios.patch(`${API_URL}/messages/${messageId}`, {
      status: 'read',
      readAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    throw new Error('خطا در به‌روزرسانی وضعیت پیام');
  }
};


export const deleteMessage = async (messageId) => {
  try {
    await axios.delete(`${API_URL}/messages/${messageId}`);
    return true;
  } catch (error) {
    throw new Error('خطا در حذف پیام');
  }
};


export const getUnreadMessagesCount = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/messages`, {
      params: {
        recipient: userId,
        status: 'unread',
        _limit: 0
      }
    });
    return parseInt(response.headers['x-total-count']) || 0;
  } catch (error) {
    throw new Error('خطا در دریافت تعداد پیام‌های نخوانده');
  }
};


// Fetches all private messages for the admin
export const fetchPrivateMessages = async () => {
  try {
    // Sorts by newest first
    const response = await axios.get(`${API_URL}/private_messages`);
    console.log('private message :', response.data)
    return response.data;
  } catch (error) {
    throw new Error('خطا در دریافت پیام‌های خصوصی');
  }
};

// Sends a new private message from the Contact Us page
export const sendPrivateMessage = async (messageData) => {
  const dataToSend = {
    id: generateUniqueId('pmsg'),
    subject: messageData.subject,
    content: messageData.message,
    senderInfo: {
      id: messageData.sender.id,
      name: messageData.sender.name,
      email: messageData.email,
      phone: messageData.phone
    },
    status: 'unread',
    createdAt: new Date().toISOString()
  };
  console.log('final data being sent :', dataToSend)
  const { data } = await apiClient.post('/private_messages', dataToSend);
  return data;
};

// Updates a message's status (e.g., to 'read')
export const updatePrivateMessageStatus = async ({ messageId, status }) => {
  const { data } = await apiClient.patch(`/private_messages/${messageId}`, { status });
  return data;
};

// Deletes a message permanently
export const deletePrivateMessage = async (messageId) => {
  await apiClient.delete(`/private_messages/${messageId}`);
  return messageId;
};

// Fetch messages for specific user or all (public messages)

// Fetch Financial Reports
export const fetchFinancialReports = async (dateRange) => {
  try {
    const params = {};
    if (dateRange) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }

    const response = await axios.get(`${API_URL}/financial-reports`, { params });
    return response.data;
  } catch (error) {
    throw new Error('خطا در دریافت گزارشات مالی');
  }
};


export const fetchContent = async (hotelId) => {
  if (!hotelId) {
    return { description: '', rules: '', facilities: [], images: [] };
  }
  try {
    const response = await axios.get(`${API_URL}/contents/${hotelId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { id: hotelId, hotelId, description: '', rules: '', facilities: [], images: [] };
    }
    console.error('Error fetching content:', error);
    throw new Error('خطا در دریافت محتوای هتل');
  }
};

export const updateContent = async (contentData) => {
  if (!contentData || !contentData.id) {
    throw new Error('شناسه هتل برای به‌روزرسانی محتوا الزامی است');
  }
  try {
    const response = await axios.put(`${API_URL}/contents/${contentData.id}`, contentData);
    return response.data;
  } catch (error) {
    console.error('Error updating content:', error);
    throw new Error('خطا در به‌روزرسانی محتوا');
  }
};

export const updateHotelImages = async ({ hotelId, images }) => {
  try {
    const response = await axios.patch(`${API_URL}/hotels/${hotelId}`, {
      images: images, // The new array of Base64 image strings
      image: images[0] || '' // Also update the main thumbnail image
    });
    return response.data;
  } catch (error) {
    console.error('Error updating hotel images:', error);
    throw new Error('خطا در به‌روزرسانی گالری تصاویر');
  }
};

export const uploadHotelImage = async (hotelId, file) => {
  try {
    // convert to base64
    const base64 = await convertFileToBase64(file);

    const hotelResponse = await axios.get(`${API_URL}/hotels/${hotelId}`);
    const hotel = hotelResponse.data;

    const newImage = {
      id: Date.now(),
      data: base64,
      title: file.name,
      createdAt: new Date().toISOString()
    };

    const updatedContent = {
      ...hotel.content,
      images: [...(hotel.content?.images || []), newImage]
    };

    await axios.patch(`${API_URL}/hotels/${hotelId}`, {
      ...hotel,
      content: updatedContent
    });

    return newImage;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('خطا در آپلود تصویر');
  }
};


const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};


export const deleteHotelImage = async (hotelId, imageId) => {
  try {
    const hotelResponse = await axios.get(`${API_URL}/hotels/${hotelId}`);
    const hotel = hotelResponse.data;

    const updatedContent = {
      ...hotel.content,
      images: hotel.content?.images?.filter(img => img.id !== imageId) || []
    };

    await axios.patch(`${API_URL}/hotels/${hotelId}`, {
      ...hotel,
      content: updatedContent
    });

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('خطا در حذف تصویر');
  }
};

export const fetchHotelReservations = async (hotelId) => {
  try {
    const response = await axios.get(`${API_URL}/reservations?hotelId=${hotelId}`);
    return response.data;
  } catch (error) {
    throw new Error('خطا در دریافت اطلاعات رزروها');
  }
};

export const getContent = async () => {
  try {
    const response = await axios.get(`${API_URL}/content`);
    return response.data[0] || {};
  } catch (error) {
    throw new Error('خطا در دریافت محتوا');
  }
};

export const fetchRooms = async (hotelId = null) => {
  try {
    const params = {};

    if (hotelId) {
      params.hotelId = hotelId;
      params.status = 'available';
    }

    const response = await axios.get(`${API_URL}/rooms`, { params });

    return response.data.map(room => ({
      id: room.id,
      name: room.name || `اتاق ${room.number}`,
      price: room.price || 0,
      capacity: {
        adults: room.capacity?.adults || 2,
        children: room.capacity?.children || 1
      },
      status: room.status || 'available',
      amenities: room.amenities || [],
      description: room.description || ''
    }));
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw new Error('خطا در دریافت اطلاعات اتاق‌ها');
  }
};

const handleEditUser = (user) => {
  setEditingUser(user);
  userForm.setFieldsValue({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role
  });
  setEditUserModal(true); 
};

const handleUpdateUser = async (values) => {
  try {

    await updateUserMutation.mutateAsync({
      id: editingUser.id,  
      ...values 
    });

    notification.success({
      message: "کاربر با موفقیت بروزرسانی شد",
      description: "اطلاعات کاربر با موفقیت بروزرسانی گردید"
    });
  } catch (error) {
    console.error('Error updating user:', error);
    notification.error({
      message: "خطا",
      description: error.message || "خطا در به‌روزرسانی کاربر"
    });
  }
};

// Export all APIs
export default {
  // Auth
  getUserByEmail,
  updateUserLogin,

  // Users
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  handleUpdateUser,
  handleEditUser,

  // Hotels
  fetchHotels,
  fetchHotelDetails,
  createHotel,
  updateHotel,
  deleteHotel,

  // Reservations
  fetchReservations,
  fetchUserReservations,
  createReservation,
  updateReservation,
  deleteReservation,

  // Rooms
  fetchRooms,
  fetchRoomsByHotel,
  createRoom,
  updateRoom,
  deleteRoom,
  handleAddRoom,

  // Favorites
  toggleFavorite,
  getUserFavorites,

  // Transactions
  fetchTransactions,

  // Notifications
  fetchNotifications,

  // Reservation Stats
  fetchReservationStats,

  // Financial Stats
  fetchFinancialStats,

  // Messages
  fetchMessages,
  sendMessage,
  fetchPublicMessages,

  // Financial Reports
  fetchFinancialReports,

  // User Profile
  updateUserProfile,

  // Stats & Reports
  fetchBookingStats,
  fetchRevenue,

  // Content Management
  fetchContent,
  updateContent,
  getContent
}

