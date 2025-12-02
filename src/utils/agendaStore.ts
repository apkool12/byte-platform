// 안건 저장소 유틸리티
import { Agenda } from '@/types/agenda';

export const getAgendas = (): Agenda[] => {
  if (typeof window === 'undefined') return [];
  
  const agendasStr = localStorage.getItem('agendas');
  if (agendasStr) {
    return JSON.parse(agendasStr);
  }
  
  return [];
};

export const saveAgendas = (agendas: Agenda[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('agendas', JSON.stringify(agendas));
};

export const getAgendaById = (id: number): Agenda | undefined => {
  const agendas = getAgendas();
  return agendas.find(a => a.id === id);
};

export const getPendingAgendas = (): Agenda[] => {
  const agendas = getAgendas();
  return agendas.filter(a => a.status === '진행중');
};

export const addAgenda = (agenda: Omit<Agenda, 'id' | 'createdAt' | 'updatedAt'>) => {
  const agendas = getAgendas();
  const newAgenda: Agenda = {
    ...agenda,
    id: agendas.length > 0 ? Math.max(...agendas.map(a => a.id), 0) + 1 : 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updatedAgendas = [...agendas, newAgenda];
  saveAgendas(updatedAgendas);
  window.dispatchEvent(new Event('agendasUpdated'));
  return newAgenda;
};

export const updateAgenda = (id: number, updates: Partial<Agenda>) => {
  const agendas = getAgendas();
  const updatedAgendas = agendas.map(a => 
    a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
  );
  saveAgendas(updatedAgendas);
  window.dispatchEvent(new Event('agendasUpdated'));
};

export const deleteAgenda = (id: number) => {
  const agendas = getAgendas();
  const filteredAgendas = agendas.filter(a => a.id !== id);
  saveAgendas(filteredAgendas);
  window.dispatchEvent(new Event('agendasUpdated'));
};

