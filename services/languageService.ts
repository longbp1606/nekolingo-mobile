import { API_BASE_URL } from "./config";

export interface Language {
  _id: string;
  name: string;
  code: string;
  native_name?: string;
  flag?: string;
}

export interface PaginationDto {
  page: number;
  take: number;
  total: number;
  totalPages: number;
}

export interface LanguageResponse {
  languages: Language[];
  pagination: PaginationDto;
}

export interface ApiResponse<T> {
  data: T;
  error: any;
  message: string;
}

class LanguageService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`Making request to: ${API_BASE_URL}/api/language${endpoint}`);

      const response = await fetch(`${API_BASE_URL}/api/language${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      console.log("Language API Response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.error("Language API request failed:", error);
      throw error;
    }
  }

  async getLanguages(page: number = 1, take: number = 50): Promise<Language[]> {
    try {
      const response = await this.makeRequest<LanguageResponse>(
        `?page=${page}&take=${take}`
      );
      return response.data.languages;
    } catch (error) {
      console.error("Failed to fetch languages:", error);
      // Return fallback languages if API fails
      return [
        {
          _id: "1",
          name: "English",
          code: "en",
          native_name: "English",
          flag: "🇺🇸",
        },
        {
          _id: "2",
          name: "Japanese",
          code: "ja",
          native_name: "日本語",
          flag: "🇯🇵",
        },
        {
          _id: "3",
          name: "Vietnamese",
          code: "vi",
          native_name: "Tiếng Việt",
          flag: "🇻🇳",
        },
      ];
    }
  }

  async getLanguageById(id: string): Promise<Language> {
    const response = await this.makeRequest<Language>(`/${id}`);
    return response.data;
  }
}

export default new LanguageService();
