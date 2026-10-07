// Frontend API client for Hirwa / RLTM Platform

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("hirwa_token");
  }
  return null;
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
};

export const claimsApi = {
  raiseClaim: (claimData) =>
    apiRequest("/claims/raise", {
      method: "POST",
      body: JSON.stringify(claimData),
    }),

  getAllClaims: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/claims${query ? `?${query}` : ""}`);
  },

  getClaimById: (id) => apiRequest(`/claims/${id}`),

  addMessage: (id, { message, attachments }) =>
    apiRequest(`/claims/${id}/message`, {
      method: "POST",
      body: JSON.stringify({ message, attachments }),
    }),

  updateStatus: (id, statusData) =>
    apiRequest(`/claims/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(statusData),
    }),

  escalateToAbunzi: (id, { district, sector }) =>
    apiRequest(`/claims/${id}/escalate-abunzi`, {
      method: "POST",
      body: JSON.stringify({ district, sector }),
    }),
};

export const contractApi = {
  createContract: (data) =>
    apiRequest("/contract", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  signContract: (contractId) =>
    apiRequest(`/contract/${contractId}/sign`, {
      method: "POST",
    }),

  getTenantContracts: () => apiRequest("/contract/tenant-contracts"),

  getLandlordContracts: () => apiRequest("/contract/landlord-contracts"),

  downloadContractPdfUrl: (id) => `${API_BASE_URL}/contract/download/${id}`,
};

export const agentApi = {
  createCommissionAgreement: (data) =>
    apiRequest("/agent/agreement", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMyCommissions: () => apiRequest("/agent/my-commissions"),

  payoutCommission: (id, momoTransactionRef) =>
    apiRequest(`/agent/${id}/payout`, {
      method: "PATCH",
      body: JSON.stringify({ momoTransactionRef }),
    }),

  getVerifiedAgents: () => apiRequest("/agent/verified-directory"),
};

export const utilityApi = {
  recordReading: (data) =>
    apiRequest("/utility/record-reading", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getPropertyUtilityBills: (propertyId) =>
    apiRequest(`/utility/property/${propertyId}`),

  getMyUtilityInvoices: () => apiRequest("/utility/my-invoices"),

  payUtilityShare: (billId, momoTransactionId) =>
    apiRequest(`/utility/${billId}/pay`, {
      method: "POST",
      body: JSON.stringify({ momoTransactionId }),
    }),
};

