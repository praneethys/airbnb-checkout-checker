import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Property, Room, ChecklistItem, Check, DamageReport, PropertyCreateSchema, RoomCreateSchema, ChecklistItemCreateSchema, CheckCreateSchema } from '../schemas/schemas';
import { z } from 'zod';

const API = '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function postJson<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Properties
export function useProperties() {
  return useQuery({ queryKey: ['properties'], queryFn: () => fetchJson<Property[]>(`${API}/properties`) });
}

export function useProperty(id: number) {
  return useQuery({ queryKey: ['property', id], queryFn: () => fetchJson<Property>(`${API}/properties/${id}`) });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: z.infer<typeof PropertyCreateSchema>) => postJson<Property>(`${API}/properties`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  });
}

// Rooms
export function useRooms(propertyId: number) {
  return useQuery({ queryKey: ['rooms', propertyId], queryFn: () => fetchJson<Room[]>(`${API}/properties/${propertyId}/rooms`) });
}

export function useCreateRoom(propertyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: z.infer<typeof RoomCreateSchema>) => postJson<Room>(`${API}/properties/${propertyId}/rooms`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms', propertyId] }),
  });
}

// Checklist Items
export function useChecklistItems(roomId: number) {
  return useQuery({ queryKey: ['items', roomId], queryFn: () => fetchJson<ChecklistItem[]>(`${API}/rooms/${roomId}/items`) });
}

export function useCreateChecklistItem(roomId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: z.infer<typeof ChecklistItemCreateSchema>) => postJson<ChecklistItem>(`${API}/rooms/${roomId}/items`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items', roomId] }),
  });
}

// Checks
export function useChecks(propertyId: number) {
  return useQuery({ queryKey: ['checks', propertyId], queryFn: () => fetchJson<Check[]>(`${API}/properties/${propertyId}/checks`) });
}

export function useCreateCheck(propertyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: z.infer<typeof CheckCreateSchema>) => postJson<Check>(`${API}/properties/${propertyId}/checks`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checks', propertyId] }),
  });
}

// Photo Upload
export function useUploadPhoto(checkId: number, roomId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API}/checks/${checkId}/photos/${roomId}`, { method: 'POST', body: form });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checks'] }),
  });
}

// Damage Report
export function useDamageReport(propertyId: number, checkinId: number, checkoutId: number) {
  return useQuery({
    queryKey: ['damage-report', propertyId, checkinId, checkoutId],
    queryFn: () => fetchJson<DamageReport>(`${API}/properties/${propertyId}/damage-report?checkin_id=${checkinId}&checkout_id=${checkoutId}`),
    enabled: !!checkinId && !!checkoutId,
  });
}

// Cost History
export function useCostHistory(propertyId: number) {
  return useQuery({
    queryKey: ['cost-history', propertyId],
    queryFn: () => fetchJson<Array<{ issue: { description: string; estimated_cost: number }; date: string; guest: string | null }>>(`${API}/properties/${propertyId}/cost-history`),
  });
}
