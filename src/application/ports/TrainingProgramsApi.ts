import type {
  Competency,
  CompetencyCreate,
  KnowledgeNetwork,
  LearningOutcome,
  ListCompetenciesQuery,
  ListKnowledgeNetworksQuery,
  ListLearningOutcomesQuery,
  ListTrainingProgramsQuery,
  Page,
  TrainingProgram,
  TrainingProgramCreate,
  TrainingProgramUpdate,
  TrainingProgramsPageResult,
} from '../../domain/trainingProgram.js';

export interface TrainingProgramsApi {
  // E1
  list(query: ListTrainingProgramsQuery, signal?: AbortSignal): Promise<TrainingProgramsPageResult>;
  create(body: TrainingProgramCreate): Promise<TrainingProgram>;
  // E2
  getById(id: string, signal?: AbortSignal): Promise<TrainingProgram>;
  update(id: string, body: TrainingProgramUpdate): Promise<TrainingProgram>;
  // E5 (baja lógica: is_active = false)
  deactivate(id: string): Promise<void>;
  // E3
  listCompetencies(
    programId: string,
    query: ListCompetenciesQuery,
    signal?: AbortSignal,
  ): Promise<Page<Competency>>;
  createCompetency(programId: string, body: CompetencyCreate): Promise<Competency>;
  // E4
  listLearningOutcomes(
    competencyId: string,
    query: ListLearningOutcomesQuery,
    signal?: AbortSignal,
  ): Promise<Page<LearningOutcome>>;
  // Selector del formulario de programa
  listKnowledgeNetworks(
    query: ListKnowledgeNetworksQuery,
    signal?: AbortSignal,
  ): Promise<Page<KnowledgeNetwork>>;
}