import type { TechLine, TechNetwork } from '../src/domain/curriculum.js';
import { knowledgeNetwork, pageOf } from './fixturesPrograms.js';

export { knowledgeNetwork, pageOf };

export const techLine: TechLine = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  name: 'Tecnologías de la información',
  code: 'LT-TI',
  is_active: true,
  created_at: '2026-01-01T10:00:00Z',
};

export const inactiveTechLine: TechLine = {
  ...techLine,
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  name: 'Línea dada de baja',
  code: 'LT-OLD',
  is_active: false,
};

// Mismo id que knowledgeNetwork.tech_network_id para que la jerarquía sea coherente.
export const techNetwork: TechNetwork = {
  id: knowledgeNetwork.tech_network_id,
  tech_line_id: techLine.id,
  name: 'Redes de software',
  code: 'RT-SW',
  is_active: true,
  created_at: '2026-01-01T10:00:00Z',
};

export const techLinesPage = pageOf([techLine, inactiveTechLine]);
export const techNetworksPage = pageOf([techNetwork]);
export const knowledgeNetworksPage = pageOf([knowledgeNetwork]);
