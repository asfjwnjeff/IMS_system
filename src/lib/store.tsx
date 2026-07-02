'use client';

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { InsuranceApplication, ClaimReport, ExchangeRate, InsuranceRate } from '@/lib/types';

// ==================== State ====================

interface AppState {
  applications: InsuranceApplication[];
  claims: ClaimReport[];
  exchangeRates: ExchangeRate[];
  insuranceRates: InsuranceRate[];
  loading: boolean;
}

const initialState: AppState = {
  applications: [],
  claims: [],
  exchangeRates: [],
  insuranceRates: [],
  loading: true,
};

// ==================== Actions ====================

type Action =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_APPLICATIONS'; applications: InsuranceApplication[] }
  | { type: 'ADD_APPLICATION'; application: InsuranceApplication }
  | { type: 'UPDATE_APPLICATION'; application: InsuranceApplication }
  | { type: 'DELETE_APPLICATION'; id: string }
  | { type: 'SET_CLAIMS'; claims: ClaimReport[] }
  | { type: 'ADD_CLAIM'; claim: ClaimReport }
  | { type: 'UPDATE_CLAIM'; claim: ClaimReport }
  | { type: 'DELETE_CLAIM'; id: string }
  | { type: 'SET_EXCHANGE_RATES'; exchangeRates: ExchangeRate[] }
  | { type: 'ADD_EXCHANGE_RATE'; exchangeRate: ExchangeRate }
  | { type: 'UPDATE_EXCHANGE_RATE'; exchangeRate: ExchangeRate }
  | { type: 'DELETE_EXCHANGE_RATE'; id: string }
  | { type: 'SET_INSURANCE_RATES'; insuranceRates: InsuranceRate[] }
  | { type: 'ADD_INSURANCE_RATE'; insuranceRate: InsuranceRate }
  | { type: 'UPDATE_INSURANCE_RATE'; insuranceRate: InsuranceRate }
  | { type: 'DELETE_INSURANCE_RATE'; id: string };

// ==================== Reducer ====================

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.loading };

    // Applications
    case 'SET_APPLICATIONS':
      return { ...state, applications: action.applications };
    case 'ADD_APPLICATION':
      return { ...state, applications: [...state.applications, action.application] };
    case 'UPDATE_APPLICATION':
      return {
        ...state,
        applications: state.applications.map((a) =>
          a.id === action.application.id ? action.application : a
        ),
      };
    case 'DELETE_APPLICATION':
      return {
        ...state,
        applications: state.applications.filter((a) => a.id !== action.id),
      };

    // Claims
    case 'SET_CLAIMS':
      return { ...state, claims: action.claims };
    case 'ADD_CLAIM':
      return { ...state, claims: [...state.claims, action.claim] };
    case 'UPDATE_CLAIM':
      return {
        ...state,
        claims: state.claims.map((c) => (c.id === action.claim.id ? action.claim : c)),
      };
    case 'DELETE_CLAIM':
      return { ...state, claims: state.claims.filter((c) => c.id !== action.id) };

    // Exchange Rates
    case 'SET_EXCHANGE_RATES':
      return { ...state, exchangeRates: action.exchangeRates };
    case 'ADD_EXCHANGE_RATE':
      return { ...state, exchangeRates: [...state.exchangeRates, action.exchangeRate] };
    case 'UPDATE_EXCHANGE_RATE':
      return {
        ...state,
        exchangeRates: state.exchangeRates.map((e) =>
          e.id === action.exchangeRate.id ? action.exchangeRate : e
        ),
      };
    case 'DELETE_EXCHANGE_RATE':
      return {
        ...state,
        exchangeRates: state.exchangeRates.filter((e) => e.id !== action.id),
      };

    // Insurance Rates
    case 'SET_INSURANCE_RATES':
      return { ...state, insuranceRates: action.insuranceRates };
    case 'ADD_INSURANCE_RATE':
      return { ...state, insuranceRates: [...state.insuranceRates, action.insuranceRate] };
    case 'UPDATE_INSURANCE_RATE':
      return {
        ...state,
        insuranceRates: state.insuranceRates.map((r) =>
          r.id === action.insuranceRate.id ? action.insuranceRate : r
        ),
      };
    case 'DELETE_INSURANCE_RATE':
      return {
        ...state,
        insuranceRates: state.insuranceRates.filter((r) => r.id !== action.id),
      };

    default:
      return state;
  }
}

// ==================== Context ====================

interface AppContextType extends AppState {
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// ==================== Provider ====================

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // 启动时从 API 加载所有数据
  useEffect(() => {
    async function loadData() {
      try {
        const [appsRes, claimsRes, exRatesRes, insRatesRes] = await Promise.all([
          fetch('/api/applications'),
          fetch('/api/claims'),
          fetch('/api/exchange-rates'),
          fetch('/api/insurance-rates'),
        ]);

        const [apps, claims, exRates, insRates] = await Promise.all([
          appsRes.json(),
          claimsRes.json(),
          exRatesRes.json(),
          insRatesRes.json(),
        ]);

        if (apps.success) dispatch({ type: 'SET_APPLICATIONS', applications: apps.data });
        if (claims.success) dispatch({ type: 'SET_CLAIMS', claims: claims.data });
        if (exRates.success) dispatch({ type: 'SET_EXCHANGE_RATES', exchangeRates: exRates.data });
        if (insRates.success) dispatch({ type: 'SET_INSURANCE_RATES', insuranceRates: insRates.data });
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    }

    loadData();
  }, []);

  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
