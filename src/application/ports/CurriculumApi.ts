import type {
  KnowledgeNetwork,
  KnowledgeNetworkCreate,
  KnowledgeNetworkUpdate,
  ListKnowledgeNetworksQuery,
  ListTechLinesQuery,
  ListTechNetworksQuery,
  Page,
  TechLine,
  TechLineCreate,
  TechLineUpdate,
  TechNetwork,
  TechNetworkCreate,
  TechNetworkUpdate,
} from '../../domain/curriculum.js';

export interface CurriculumApi {
  // E1
  listTechLines(query: ListTechLinesQuery, signal?: AbortSignal): Promise<Page<TechLine>>;
  createTechLine(body: TechLineCreate): Promise<TechLine>;
  updateTechLine(id: string, body: TechLineUpdate): Promise<TechLine>;
  deactivateTechLine(id: string): Promise<void>;
  // E2
  listTechNetworks(query: ListTechNetworksQuery, signal?: AbortSignal): Promise<Page<TechNetwork>>;
  createTechNetwork(body: TechNetworkCreate): Promise<TechNetwork>;
  updateTechNetwork(id: string, body: TechNetworkUpdate): Promise<TechNetwork>;
  deactivateTechNetwork(id: string): Promise<void>;
  // E3
  listKnowledgeNetworks(query: ListKnowledgeNetworksQuery, signal?: AbortSignal): Promise<Page<KnowledgeNetwork>>;
  createKnowledgeNetwork(body: KnowledgeNetworkCreate): Promise<KnowledgeNetwork>;
  updateKnowledgeNetwork(id: string, body: KnowledgeNetworkUpdate): Promise<KnowledgeNetwork>;
  deactivateKnowledgeNetwork(id: string): Promise<void>;
}
