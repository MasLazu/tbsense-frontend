const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5065/api/v1";

export interface ApiResponse<T> {
  httpStatus: number;
  success: boolean;
  message: string;
  errors?: any;
  errorCode?: string | null;
  data: T;
}

export class ApiError extends Error {
  errors?: any | null;
  errorCode?: string | null;
  status?: number | null;
  httpStatus?: number | null;

  constructor({
    message,
    errors,
    errorCode,
    status,
    httpStatus,
  }: {
    message: string | null;
    errors?: any | null;
    errorCode?: string | null;
    status?: number | null;
    httpStatus?: number | null;
  }) {
    super(message ?? "Something went wrong");
    this.name = "ApiError";
    this.errors = errors;
    this.errorCode = errorCode;
    this.status = status;
    this.httpStatus = httpStatus;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(token?: string) {
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let apiResponse: ApiResponse<T>;
    try {
      apiResponse = await response.json();
    } catch {
      throw new ApiError({
        message:
          response.status >= 500
            ? "Server error occurred. Please try again later."
            : response.status === 0
            ? "Network error - unable to connect to server."
            : `HTTP ${response.status} - ${response.statusText}`,
        httpStatus: response.status,
      });
    }

    apiResponse.httpStatus = response.status;

    if (!apiResponse.success) {
      throw new ApiError({
        message: apiResponse.message,
        errors: apiResponse.errors,
        errorCode: apiResponse.errorCode,
        httpStatus: response.status,
      });
    }

    return apiResponse;
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    return searchParams.toString();
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    token?: string
  ): Promise<ApiResponse<T>> {
    const queryString = params ? this.buildQueryString(params) : "";
    const url = `${this.baseURL}${endpoint}${
      queryString ? `?${queryString}` : ""
    }`;

    try {
      const headers = this.getAuthHeaders(token);

      if ("Content-Type" in headers) {
        delete (headers as Record<string, unknown>)["Content-Type"];
      }

      (headers as Record<string, string | undefined>)["Accept"] =
        "application/json";

      Object.entries(headers).forEach(([k, v]) => {
        if (v === undefined || v === "undefined") {
          delete (headers as Record<string, unknown>)[k];
        }
      });

      try {
        console.debug("apiClient GET", {
          url,
          queryString,
          hasAuth: !!token,
          headerKeys: Object.keys(headers),
        });
      } catch {}

      const response = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include",
      });

      return this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.message === "Failed to fetch") {
        throw new ApiError({
          message: "Unable to connect to server. Please check your connection.",
          httpStatus: 0,
        });
      }

      throw error instanceof ApiError
        ? error
        : new ApiError({
            message: error.message || "Unknown error",
            httpStatus: 0,
          });
    }
  }

  async post<T>(
    endpoint: string,
    data?: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: this.getAuthHeaders(token),
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });

      return this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.message === "Failed to fetch") {
        throw new ApiError({
          message: "Unable to connect to server. Please check your connection.",
          httpStatus: 0,
        });
      }

      throw error instanceof ApiError
        ? error
        : new ApiError({
            message: error.message || "Unknown error",
            httpStatus: 0,
          });
    }
  }

  async put<T>(
    endpoint: string,
    data?: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PUT",
        headers: this.getAuthHeaders(token),
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });

      return this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.message === "Failed to fetch") {
        throw new ApiError({
          message: "Unable to connect to server. Please check your connection.",
          httpStatus: 0,
        });
      }

      throw error instanceof ApiError
        ? error
        : new ApiError({
            message: error.message || "Unknown error",
            httpStatus: 0,
          });
    }
  }

  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    try {
      const headers = this.getAuthHeaders(token);
      if ("Content-Type" in headers) {
        (headers as Record<string, unknown>)["Content-Type"] = undefined;
      }
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      return this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.message === "Failed to fetch") {
        throw new ApiError({
          message: "Unable to connect to server. Please check your connection.",
          httpStatus: 0,
        });
      }

      throw error instanceof ApiError
        ? error
        : new ApiError({
            message: error.message || "Unknown error",
            httpStatus: 0,
          });
    }
  }
}

export const apiClient = new ApiClient();
