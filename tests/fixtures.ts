import type { Ficha, FichasPageResult } from '../src/domain/ficha.js';

export const ficha: Ficha = {
  id: '11111111-1111-4111-8111-111111111111',
  ficha_number: '2874412',
  program_id: '22222222-2222-4222-8222-222222222222',
  program_version: 3,
  training_center_id: '33333333-3333-4333-8333-333333333333',
  status: 'EXECUTION',
  start_date: '2026-01-15',
  expected_end_date: '2027-12-15',
  actual_end_date: null,
  training_shift: 'DAY',
  training_modality: 'IN_PERSON',
  max_capacity: 30,
  created_at: '2026-01-02T10:00:00Z',
  updated_at: '2026-08-06T14:30:00Z',
};

export const page: FichasPageResult = {
  data: [ficha],
  pagination: { page: 1, page_size: 10, total_items: 1, total_pages: 1 },
};
