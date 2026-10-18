import { type FC, useMemo } from 'react';

import { FichasPage } from './adapter/in/pages/FichasPage.js';
import { HttpFichasApi } from './adapter/out/http/HttpFichasApi.js';
import type { AcademicManagementMfeProps } from './contracts/remote-props.js';

const App: FC<AcademicManagementMfeProps> = ({
  apiBaseUrl = import.meta.env.VITE_ACADEMIC_API_BASE_URL ?? '/api/v1',
  accessToken = import.meta.env.DEV ? 'local-practice-token' : undefined,
}) => {
  const api = useMemo(() => new HttpFichasApi(apiBaseUrl, accessToken), [apiBaseUrl, accessToken]);

  return <FichasPage api={api} />;
};

export default App;
