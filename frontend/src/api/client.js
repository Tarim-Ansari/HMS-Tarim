// /**
//  * MediCore HMS API Client
//  * Centralized authenticated API layer with JWT refresh/rotation support.
//  */

// const API_BASE = import.meta.env.VITE_API_URL || '';

// export const getToken = () => localStorage.getItem('token');
// export const getRefreshToken = () => localStorage.getItem('refreshToken');

// export const setAuthSession = (access, refresh, user) => {
//   if (access) localStorage.setItem('token', access);
//   if (refresh) localStorage.setItem('refreshToken', refresh);
//   if (user) localStorage.setItem('user', JSON.stringify(user));
//   if (user?.role) localStorage.setItem('role', user.role);
// };

// export const clearAuthSession = () => {
//   localStorage.removeItem('token');
//   localStorage.removeItem('refreshToken');
//   localStorage.removeItem('user');
//   localStorage.removeItem('role');
// };

// export const getStoredUser = () => {
//   try {
//     const raw = localStorage.getItem('user');
//     return raw ? JSON.parse(raw) : null;
//   } catch {
//     return null;
//   }
// };

// export const getStoredRole = () => localStorage.getItem('role') || null;

// export const extractErrorMessage = (errorData) => {
//   if (!errorData) return 'An unexpected error occurred.';
//   if (typeof errorData === 'string') return errorData;
//   if (errorData.detail) return errorData.detail;
//   if (errorData.message) return errorData.message;

//   if (typeof errorData === 'object') {
//     const firstKey = Object.keys(errorData)[0];
//     if (firstKey) {
//       const val = errorData[firstKey];
//       if (Array.isArray(val) && val.length) {
//         return `${firstKey.replace(/_/g, ' ')}: ${val[0]}`;
//       }
//       if (typeof val === 'string') {
//         return `${firstKey.replace(/_/g, ' ')}: ${val}`;
//       }
//       if (val && typeof val === 'object') return extractErrorMessage(val);
//     }
//   }

//   return 'Server responded with an error.';
// };

// const buildUrl = (endpoint) => {
//   if (endpoint.startsWith('http')) return endpoint;
//   return `${API_BASE}${endpoint.startsWith('/api') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`}`;
// };

// const parseResponse = async (response) => {
//   const contentType = response.headers.get('content-type') || '';
//   if (contentType.includes('application/json')) return response.json();
//   const text = await response.text();
//   return text || null;
// };

// const refreshAccessToken = async () => {
//   const refresh = getRefreshToken();
//   if (!refresh) return null;

//   const response = await fetch(buildUrl('/api/accounts/token/refresh/'), {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ refresh }),
//   });

//   const data = await parseResponse(response);
//   if (!response.ok || !data?.access) {
//     clearAuthSession();
//     return null;
//   }

//   // ROTATE_REFRESH_TOKENS=True means the backend may return a new refresh token.
//   setAuthSession(data.access, data.refresh || refresh, getStoredUser());
//   return data.access;
// };

// export async function apiFetch(endpoint, options = {}, retry = true) {
//   const url = buildUrl(endpoint);
//   const token = getToken();
//   const isFormData = options.body instanceof FormData;

//   const headers = {
//     ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     ...(options.headers || {}),
//   };

//   const response = await fetch(url, { ...options, headers });
//   const data = await parseResponse(response);

//   if (response.status === 401 && retry && getRefreshToken() && !endpoint.includes('/token/refresh/')) {
//     const newToken = await refreshAccessToken();
//     if (newToken) return apiFetch(endpoint, options, false);
//   }

//   if (!response.ok) {
//     const error = new Error(extractErrorMessage(data));
//     error.status = response.status;
//     error.data = data;
//     throw error;
//   }

//   return data;
// }

// const jsonBody = (body) => JSON.stringify(body);

// export const api = {
//   get: (endpoint, options = {}) => apiFetch(endpoint, { method: 'GET', ...options }),
//   post: (endpoint, body, options = {}) => apiFetch(endpoint, {
//     method: 'POST',
//     body: body instanceof FormData ? body : jsonBody(body),
//     ...options,
//   }),
//   put: (endpoint, body, options = {}) => apiFetch(endpoint, {
//     method: 'PUT',
//     body: body instanceof FormData ? body : jsonBody(body),
//     ...options,
//   }),
//   patch: (endpoint, body, options = {}) => apiFetch(endpoint, {
//     method: 'PATCH',
//     body: body instanceof FormData ? body : jsonBody(body),
//     ...options,
//   }),
//   delete: (endpoint, options = {}) => apiFetch(endpoint, { method: 'DELETE', ...options }),

//   login: async (usernameOrEmail, password) => {
//     // Backend authenticates by username. Keep the UI label flexible, but send it as username.
//     const response = await apiFetch('/api/accounts/login/', {
//       method: 'POST',
//       body: JSON.stringify({ username: usernameOrEmail, password }),
//     });
//     if (response?.access) setAuthSession(response.access, response.refresh, response.user);
//     return response;
//   },

//   requestSuperUserOtp: (body) => apiFetch('/api/accounts/superuser/request-otp/', {
//     method: 'POST', body: jsonBody(body),
//   }),
//   registerSuperUser: (body) => apiFetch('/api/accounts/superuser/register/', {
//     method: 'POST', body: jsonBody(body),
//   }),
//   createHospitalAdmin: (body) => apiFetch('/api/accounts/hospital-admin/create/', {
//     method: 'POST', body: jsonBody(body),
//   }),
//   getHospitalAdmins: () => apiFetch('/api/accounts/hospital-admins/'),
//   verifyHospitalAdminOtp: (body) => apiFetch('/api/accounts/hospital-admin/verify-otp/', {
//     method: 'POST', body: jsonBody(body),
//   }),
//   resendHospitalAdminOtp: (adminId) => apiFetch(`/api/accounts/hospital-admin/${adminId}/resend-otp/`, {
//     method: 'POST',
//   }),
//   approveHospitalAdmin: (adminId) => apiFetch(`/api/accounts/hospital-admin/${adminId}/approve/`, {
//     method: 'PATCH', body: JSON.stringify({}),
//   }),
//   getCurrentUser: () => apiFetch('/api/accounts/me/'),
// };

// export default api;

/**
 * MediCore HMS - Central API Client
 *
 * Responsibilities:
 * - API URL construction
 * - JWT access token handling
 * - Refresh token rotation
 * - Concurrent 401 refresh protection
 * - JSON / FormData requests
 * - Query parameters
 * - Authentication headers
 * - Standardized error handling
 * - Auth session persistence
 */

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

/* =========================================================
 * AUTH STORAGE
 * ========================================================= */

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

export const setAuthSession = (access, refresh, user) => {
  if (access) {
    localStorage.setItem("token", access);
  }

  if (refresh) {
    localStorage.setItem("refreshToken", refresh);
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));

    if (user.role) {
      localStorage.setItem("role", user.role);
    }
  }
};

export const clearAuthSession = () => {
  [
    "token",
    "refreshToken",
    "user",
    "role",
  ].forEach((key) => {
    localStorage.removeItem(key);
  });
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getStoredRole = () => {
  return (
    localStorage.getItem("role") ||
    getStoredUser()?.role ||
    null
  );
};

/* =========================================================
 * ERROR HANDLING
 * ========================================================= */

export const extractErrorMessage = (errorData) => {
  if (!errorData) {
    return "An unexpected error occurred.";
  }

  if (typeof errorData === "string") {
    return errorData;
  }

  if (errorData.detail) {
    if (Array.isArray(errorData.detail)) {
      return errorData.detail.join(", ");
    }

    return String(errorData.detail);
  }

  if (errorData.message) {
    if (Array.isArray(errorData.message)) {
      return errorData.message.join(", ");
    }

    return String(errorData.message);
  }

  if (typeof errorData === "object") {
    for (const [key, value] of Object.entries(errorData)) {
      const fieldName = key.replace(/_/g, " ");

      if (Array.isArray(value) && value.length) {
        const first = value[0];

        if (typeof first === "object") {
          return `${fieldName}: ${extractErrorMessage(first)}`;
        }

        return `${fieldName}: ${first}`;
      }

      if (typeof value === "string") {
        return `${fieldName}: ${value}`;
      }

      if (value && typeof value === "object") {
        const nested = extractErrorMessage(value);

        if (nested) {
          return `${fieldName}: ${nested}`;
        }
      }
    }
  }

  return "Server responded with an error.";
};

/* =========================================================
 * URL BUILDER
 * ========================================================= */

const buildUrl = (endpoint, params = null) => {
  const rawUrl = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE}${
        endpoint.startsWith("/api")
          ? endpoint
          : `/api${
              endpoint.startsWith("/")
                ? endpoint
                : `/${endpoint}`
            }`
      }`;

  const url = new URL(
    rawUrl,
    window.location.origin
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            url.searchParams.append(key, item);
          });
        } else {
          url.searchParams.set(key, value);
        }
      }
    });
  }

  return url.toString();
};

/* =========================================================
 * RESPONSE PARSER
 * ========================================================= */

const parseResponse = async (response) => {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  const text = await response.text();

  return text || null;
};

/* =========================================================
 * TOKEN REFRESH
 *
 * Important:
 * If multiple API requests receive 401 at the same time,
 * only ONE refresh request is sent.
 * All other requests wait for the same promise.
 * ========================================================= */

let refreshPromise = null;

const refreshAccessToken = async () => {
  const refresh = getRefreshToken();

  if (!refresh) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(
        buildUrl("/api/accounts/token/refresh/"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh,
          }),
        }
      );

      const data = await parseResponse(response);

      if (!response.ok || !data?.access) {
        throw new Error(
          extractErrorMessage(data)
        );
      }

      /*
       * ROTATE_REFRESH_TOKENS=True:
       *
       * Backend may return a new refresh token.
       * If it doesn't, preserve the existing one.
       */
      setAuthSession(
        data.access,
        data.refresh || refresh,
        getStoredUser()
      );

      return data.access;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  try {
    return await refreshPromise;
  } catch {
    clearAuthSession();
    return null;
  }
};

/* =========================================================
 * MAIN API FETCH
 * ========================================================= */

export async function apiFetch(
  endpoint,
  options = {},
  retry = true
) {
  const {
    params,
    skipAuth = false,
    ...fetchOptions
  } = options;

  const url = buildUrl(endpoint, params);

  const token = getToken();

  const isFormData =
    fetchOptions.body instanceof FormData;

  const headers = {
    ...(token && !skipAuth
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),

    ...(!isFormData
      ? {
          "Content-Type": "application/json",
        }
      : {}),

    ...(fetchOptions.headers || {}),
  };

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  const data = await parseResponse(response);

  /*
   * ACCESS TOKEN EXPIRED
   */
  if (
    response.status === 401 &&
    retry &&
    !endpoint.includes("/token/refresh/")
  ) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      return apiFetch(
        endpoint,
        options,
        false
      );
    }
  }

  /*
   * SERVER ERROR
   */
  if (!response.ok) {
    const error = new Error(
      extractErrorMessage(data)
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

/* =========================================================
 * BODY HELPER
 * ========================================================= */

const prepareBody = (data) => {
  if (data instanceof FormData) {
    return data;
  }

  if (
    data === undefined ||
    data === null
  ) {
    return undefined;
  }

  return JSON.stringify(data);
};

/* =========================================================
 * API METHODS
 * ========================================================= */

export const api = {
  get: (endpoint, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "GET",
    }),

  post: (
    endpoint,
    data,
    options = {}
  ) =>
    apiFetch(endpoint, {
      ...options,
      method: "POST",
      body: prepareBody(data),
    }),

  put: (
    endpoint,
    data,
    options = {}
  ) =>
    apiFetch(endpoint, {
      ...options,
      method: "PUT",
      body: prepareBody(data),
    }),

  patch: (
    endpoint,
    data,
    options = {}
  ) =>
    apiFetch(endpoint, {
      ...options,
      method: "PATCH",
      body: prepareBody(data),
    }),

  delete: (
    endpoint,
    options = {}
  ) =>
    apiFetch(endpoint, {
      ...options,
      method: "DELETE",
    }),

  /* =======================================================
   * AUTH
   * ======================================================= */

  login: async (
    usernameOrEmail,
    password
  ) => {
    const data = await api.post(
      "/accounts/login/",
      {
        username: usernameOrEmail,
        password,
      },
      {
        skipAuth: true,
      }
    );

    if (data?.access) {
      setAuthSession(
        data.access,
        data.refresh,
        data.user
      );
    }

    return data;
  },

  logout: async () => {
    const refresh = getRefreshToken();

    try {
      if (refresh) {
        await api.post(
          "/accounts/logout/",
          {
            refresh,
          },
          {
            skipAuth: false,
          }
        );
      }
    } catch {
      /*
       * Logout should still clear local session
       * even if backend logout fails.
       */
    } finally {
      clearAuthSession();
    }
  },

  getCurrentUser: () =>
    api.get("/accounts/me/"),
};

/* =========================================================
 * DEFAULT EXPORT
 * ========================================================= */

export default api;