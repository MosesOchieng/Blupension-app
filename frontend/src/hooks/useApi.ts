import { useState } from 'react';
import { AxiosError } from 'axios';

interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export function useApi<T>(apiCall: () => Promise<T>) {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = async () => {
        setState({ ...state, loading: true });
        try {
            const data = await apiCall();
            setState({ data, loading: false, error: null });
        } catch (error) {
            const axiosError = error as AxiosError;
            setState({
                data: null,
                loading: false,
                error: axiosError.response?.data?.error || 'An error occurred',
            });
        }
    };

    return { ...state, execute };
} 