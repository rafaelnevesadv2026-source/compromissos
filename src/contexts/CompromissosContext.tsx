import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Compromisso, Categoria, Status } from '@/types/compromisso';

interface CompromissosContextType {
  compromissos: Compromisso[];
  addCompromisso: (c: Omit<Compromisso, 'id' | 'dataCriacao'>) => void;
  updateCompromisso: (id: string, c: Partial<Compromisso>) => void;
  deleteCompromisso: (id: string) => void;
  getByDate: (date: string) => Compromisso[];
  getByDateRange: (start: string, end: string) => Compromisso[];
  getByCategoria: (cat: Categoria) => Compromisso[];
  getByStatus: (status: Status) => Compromisso[];
  search: (query: string) => Compromisso[];
}

const CompromissosContext = createContext<CompromissosContextType | null>(null);

const STORAGE_KEY = 'meus-compromissos-data';

function loadFromStorage(): Compromisso[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(data: Compromisso[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function CompromissosProvider({ children }: { children: React.ReactNode }) {
  const [compromissos, setCompromissos] = useState<Compromisso[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(compromissos);
  }, [compromissos]);

  const addCompromisso = useCallback((c: Omit<Compromisso, 'id' | 'dataCriacao'>) => {
    const novo: Compromisso = {
      ...c,
      id: crypto.randomUUID(),
      dataCriacao: new Date().toISOString(),
    };
    setCompromissos(prev => [...prev, novo]);
  }, []);

  const updateCompromisso = useCallback((id: string, updates: Partial<Compromisso>) => {
    setCompromissos(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCompromisso = useCallback((id: string) => {
    setCompromissos(prev => prev.filter(c => c.id !== id));
  }, []);

  const getByDate = useCallback((date: string) => {
    return compromissos.filter(c => c.data === date);
  }, [compromissos]);

  const getByDateRange = useCallback((start: string, end: string) => {
    return compromissos.filter(c => c.data >= start && c.data <= end);
  }, [compromissos]);

  const getByCategoria = useCallback((cat: Categoria) => {
    return compromissos.filter(c => c.categoria === cat);
  }, [compromissos]);

  const getByStatus = useCallback((status: Status) => {
    return compromissos.filter(c => c.status === status);
  }, [compromissos]);

  const search = useCallback((query: string) => {
    const q = query.toLowerCase();
    return compromissos.filter(c =>
      c.titulo.toLowerCase().includes(q) ||
      c.observacao.toLowerCase().includes(q) ||
      c.categoria.toLowerCase().includes(q)
    );
  }, [compromissos]);

  return (
    <CompromissosContext.Provider value={{
      compromissos, addCompromisso, updateCompromisso, deleteCompromisso,
      getByDate, getByDateRange, getByCategoria, getByStatus, search,
    }}>
      {children}
    </CompromissosContext.Provider>
  );
}

export function useCompromissos() {
  const ctx = useContext(CompromissosContext);
  if (!ctx) throw new Error('useCompromissos must be used inside CompromissosProvider');
  return ctx;
}
