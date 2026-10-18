import { useMemo } from 'react';

import { CurriculumSetupPage } from '../adapter/in/pages/CurriculumSetupPage.js';
import { createInMemoryCurriculumApi } from './inMemoryCurriculumApi.js';

/** Vista previa de la HU-ACAD-18 con datos simulados en memoria (solo `npm run dev`). */
export function CurriculumPreview() {
  const api = useMemo(() => createInMemoryCurriculumApi(), []);
  return <CurriculumSetupPage api={api} />;
}