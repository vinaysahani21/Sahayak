// Change this ONE line to switch between Localhost and Live Server
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login.php`,
  SIGNUP: `${API_BASE_URL}/auth/signup.php`,
  GET_SERVICES: `${API_BASE_URL}/services/list.php`,
  BOOK_SERVICE: `${API_BASE_URL}/bookings/create.php`,
};

export const ROLES = {
  ADMIN: 'admin',
  PROVIDER: 'provider',
  CUSTOMER: 'customer'
};
