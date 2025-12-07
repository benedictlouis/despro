import config from "./config";

const API_BASE_URL = config.API_BASE_URL;

export const tokenManager = {
  getAccessToken(): string | null {
    return null;
  },

  getRefreshToken(): string | null {
    return null;
  },

  setTokens(_accessToken: string, _refreshToken: string): void {
  },

  clearTokens(): void {
  },

  isAuthenticated(): boolean {
    return false;
  },
};

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private onAccessTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private async refreshAccessToken(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: send cookies
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", 
    });

    if ((response.status === 401 || response.status === 403) && 
        endpoint !== "/refresh" && 
        endpoint !== "/login" && 
        endpoint !== "/register") {
      if (!this.isRefreshing) {
        this.isRefreshing = true;

        try {
          await this.refreshAccessToken();
          this.isRefreshing = false;
          this.onAccessTokenRefreshed(""); 

          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: "include",
          });
        } catch (error) {
          this.isRefreshing = false;
          throw error;
        }
      } else {
        await new Promise<string>((resolve) => {
          this.addRefreshSubscriber(resolve);
        });

        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: "include",
        });
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();

export const authApi = {
  async login(username: string, password: string) {
    const response = await apiClient.post<{
      message: string;
      user: { id: string; username: string; role: string };
    }>("/login", { username, password });
    
    return response;
  },

  async register(username: string, password: string) {
    return apiClient.post<{
      message: string;
      user: { id: string; username: string; role: string };
    }>("/register", { username, password });
  },

  async logout() {
    try {
      await apiClient.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  async getMe() {
    return apiClient.get<{ user: { sub: string; username: string; role: string } }>("/me");
  },
};

export default apiClient;
