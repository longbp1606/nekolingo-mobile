import { StorageUtils } from '../utils/storage';
import { API_BASE_URL } from './config';

class ApiService {
    private baseURL: string;

    constructor() {
        this.baseURL = `${API_BASE_URL}/api`;
    }

    private async getAuthHeaders(): Promise<Record<string, string>> {
        try {
            const token = await StorageUtils.getUserToken();
            return {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            };
        } catch {
            return { 'Content-Type': 'application/json' };
        }
    }

    private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
        const headers = await this.getAuthHeaders();
        const config: RequestInit = {
            ...options,
            headers
        };

        const response = await fetch(`${this.baseURL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    }

    public async get(endpoint: string) {
        return this.request(endpoint, { method: 'GET' });
    }

    public async post(endpoint: string, body: any) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    public async put(endpoint: string, body: any) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    public async delete(endpoint: string) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

export default new ApiService();
