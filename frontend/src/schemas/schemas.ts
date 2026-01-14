import { z } from 'zod';

export const RoomType = z.enum(['bedroom', 'bathroom', 'kitchen', 'living_room', 'other']);
export const CheckType = z.enum(['checkin', 'checkout']);

export const PropertySchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string().nullable(),
  created_at: z.string(),
});

export const RoomSchema = z.object({
  id: z.number(),
  property_id: z.number(),
  name: z.string(),
  room_type: RoomType,
});

export const ChecklistItemSchema = z.object({
  id: z.number(),
  room_id: z.number(),
  name: z.string(),
  replacement_cost: z.number(),
});

export const CheckSchema = z.object({
  id: z.number(),
  property_id: z.number(),
  check_type: CheckType,
  guest_name: z.string().nullable(),
  created_at: z.string(),
});

export const IssueSchema = z.object({
  id: z.number(),
  check_id: z.number(),
  description: z.string(),
  item_name: z.string().nullable(),
  estimated_cost: z.number(),
  severity: z.string(),
});

export const PhotoAnalysisSchema = z.object({
  photo_id: z.number(),
  analysis: z.object({
    missing_items: z.array(z.string()),
    damage_detected: z.array(z.string()),
    cleanliness_issues: z.array(z.string()).optional(),
    condition_score: z.number().optional(),
  }),
  issues_created: z.number(),
});

export const DamageReportSchema = z.object({
  property_name: z.string(),
  guest_name: z.string().nullable(),
  checkin_date: z.string(),
  checkout_date: z.string(),
  issues: z.array(IssueSchema),
  total_estimated_cost: z.number(),
  comparison_photos: z.array(z.record(z.unknown())),
});

// Input schemas
export const PropertyCreateSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
});

export const RoomCreateSchema = z.object({
  name: z.string().min(1),
  room_type: RoomType.default('other'),
});

export const ChecklistItemCreateSchema = z.object({
  name: z.string().min(1),
  replacement_cost: z.number().min(0).default(0),
});

export const CheckCreateSchema = z.object({
  check_type: CheckType,
  guest_name: z.string().optional(),
});

export type Property = z.infer<typeof PropertySchema>;
export type Room = z.infer<typeof RoomSchema>;
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type Check = z.infer<typeof CheckSchema>;
export type Issue = z.infer<typeof IssueSchema>;
export type PhotoAnalysis = z.infer<typeof PhotoAnalysisSchema>;
export type DamageReport = z.infer<typeof DamageReportSchema>;
