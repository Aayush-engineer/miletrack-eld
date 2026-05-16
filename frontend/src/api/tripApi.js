import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.error ||
                      error.response.data?.detail ||
                      `Server error: ${error.response.status}`
      const details = error.response.data?.details || null
      return Promise.reject({ message, details, status: error.response.status })
    } else if (error.request) {
      return Promise.reject({
        message: 'Cannot reach the server. Is the backend running?',
        details: null,
        status: 0,
      })
    } else {
      return Promise.reject({
        message: error.message || 'Unknown error occurred',
        details: null,
        status: -1,
      })
    }
  }
)

/**
 * Plan a trip by calling the backend HOS calculator.
 *
 * @param {Object} tripData
 * @param {string} tripData.current_location - Driver's current location
 * @param {string} tripData.pickup_location - Pickup location
 * @param {string} tripData.dropoff_location - Dropoff location
 * @param {number} tripData.current_cycle_used - Hours used in current 8-day cycle (0-70)
 * @returns {Promise<Object>} Trip plan with route and daily_logs
 */
export async function planTrip(tripData) {
  const response = await apiClient.post('/api/trip/plan/', tripData)
  return response.data
}

export default apiClient