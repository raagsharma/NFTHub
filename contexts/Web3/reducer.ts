import { providers } from "ethers";

export type State = {
    data: {
        provider?: providers.Web3Provider;
    },
    isLoading: boolean;
    error?: string;
}

export type Action =
    | { type: 'setProvider', provider: providers.Web3Provider }
    | { type: 'setError', error: string }
    | { type: 'clearError' }
    | { type: 'setLoading', loading: boolean };



export const initialState: State = {
    data: {
        provider: null
    },
    isLoading: false,
    error: null
}

export const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case 'setProvider':
            return { ...state, isLoading: false, data: { provider: action.provider } };
        case 'setError':
            return { ...state, isLoading: false, error: action.error };
        case 'clearError':
            return { ...state, error: null };
        case 'setLoading':
            return { ...state, isLoading: action.loading };
        default:
            return state
    }
}