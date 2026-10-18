import type { CurriculumApi } from '../application/ports/CurriculumApi.js';
import type { KnowledgeNetwork, Page, TechLine, TechNetwork } from '../domain/curriculum.js';

// Solo para la vista previa local: datos en memoria, sin backend. Se pierden al recargar.
const wait = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 250));
const now = new Date().toISOString();

function paginate<T>(items: T[], query: { page?: number; page_size?: number }): Page<T> {
  const page = query.page ?? 1;
  const size = query.page_size ?? 10;
  const total = items.length;
  return {
    data: items.slice((page - 1) * size, page * size),
    pagination: { page, page_size: size, total_items: total, total_pages: Math.ceil(total / size) },
  };
}

const IN_USE_BY_PROGRAM = 'No se puede desactivar: hay programas de formación activos que la usan.';

export function createInMemoryCurriculumApi(): CurriculumApi {
  let lines: TechLine[] = [
    { id: 'l1', name: 'Tecnologías de la información', code: 'LT-TI', is_active: true, created_at: now },
    { id: 'l2', name: 'Gestión y servicios', code: 'LT-GS', is_active: true, created_at: now },
    { id: 'l3', name: 'Línea en desuso', code: 'LT-OLD', is_active: false, created_at: now },
  ];
  let networks: TechNetwork[] = [
    { id: 'n1', tech_line_id: 'l1', name: 'Desarrollo de software', code: 'RT-SW', is_active: true, created_at: now },
    { id: 'n2', tech_line_id: 'l1', name: 'Infraestructura y redes', code: 'RT-IN', is_active: true, created_at: now },
    { id: 'n3', tech_line_id: 'l2', name: 'Administración', code: 'RT-AD', is_active: true, created_at: now },
  ];
  let knowledge: KnowledgeNetwork[] = [
    { id: 'k1', tech_network_id: 'n1', name: 'Informática, diseño y desarrollo de software', code: 'RC-INF', is_active: true, created_at: now },
    { id: 'k2', tech_network_id: 'n2', name: 'Redes y telecomunicaciones', code: 'RC-RED', is_active: true, created_at: now },
    { id: 'k3', tech_network_id: 'n3', name: 'Gestión administrativa', code: 'RC-ADM', is_active: true, created_at: now },
  ];
  let seq = 100;
  const nextId = (prefix: string) => `${prefix}${seq++}`;

  return {
    // E1
    listTechLines: (query) =>
      wait(paginate(query.is_active === undefined ? lines : lines.filter((i) => i.is_active === query.is_active), query)),
    createTechLine: (body) => {
      const created: TechLine = { ...body, id: nextId('l'), created_at: new Date().toISOString() };
      lines = [created, ...lines];
      return wait(created);
    },
    updateTechLine: (id, body) => {
      lines = lines.map((i) => (i.id === id ? { ...i, ...body } : i));
      return wait(lines.find((i) => i.id === id) as TechLine);
    },
    deactivateTechLine: (id) => {
      // E5 simulado: una línea con redes activas está en uso.
      if (networks.some((n) => n.tech_line_id === id && n.is_active)) {
        return Promise.reject(new Error('No se puede desactivar: hay redes tecnológicas activas que dependen de ella.'));
      }
      lines = lines.map((i) => (i.id === id ? { ...i, is_active: false } : i));
      return wait(undefined);
    },

    // E2
    listTechNetworks: (query) => {
      const filtered = networks
        .filter((i) => query.is_active === undefined || i.is_active === query.is_active)
        .filter((i) => !query.tech_line_id || i.tech_line_id === query.tech_line_id);
      return wait(paginate(filtered, query));
    },
    createTechNetwork: (body) => {
      const created: TechNetwork = { ...body, id: nextId('n'), created_at: new Date().toISOString() };
      networks = [created, ...networks];
      return wait(created);
    },
    updateTechNetwork: (id, body) => {
      networks = networks.map((i) => (i.id === id ? { ...i, ...body } : i));
      return wait(networks.find((i) => i.id === id) as TechNetwork);
    },
    deactivateTechNetwork: (id) => {
      if (knowledge.some((k) => k.tech_network_id === id && k.is_active)) {
        return Promise.reject(new Error('No se puede desactivar: hay redes de conocimiento activas que dependen de ella.'));
      }
      networks = networks.map((i) => (i.id === id ? { ...i, is_active: false } : i));
      return wait(undefined);
    },

    // E3
    listKnowledgeNetworks: (query) => {
      const filtered = knowledge
        .filter((i) => query.is_active === undefined || i.is_active === query.is_active)
        .filter((i) => !query.tech_network_id || i.tech_network_id === query.tech_network_id);
      return wait(paginate(filtered, query));
    },
    createKnowledgeNetwork: (body) => {
      const created: KnowledgeNetwork = { ...body, id: nextId('k'), created_at: new Date().toISOString() };
      knowledge = [created, ...knowledge];
      return wait(created);
    },
    updateKnowledgeNetwork: (id, body) => {
      knowledge = knowledge.map((i) => (i.id === id ? { ...i, ...body } : i));
      return wait(knowledge.find((i) => i.id === id) as KnowledgeNetwork);
    },
    deactivateKnowledgeNetwork: (id) => {
      // E5 simulado: la primera red de conocimiento está "en uso" por un programa activo.
      if (id === 'k1') return Promise.reject(new Error(IN_USE_BY_PROGRAM));
      knowledge = knowledge.map((i) => (i.id === id ? { ...i, is_active: false } : i));
      return wait(undefined);
    },
  };
}