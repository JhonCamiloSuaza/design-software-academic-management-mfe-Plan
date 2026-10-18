import { type FC, useMemo } from 'react';

import { FichasPage } from './adapter/in/pages/FichasPage.js';
import { HttpFichasApi } from './adapter/out/http/HttpFichasApi.js';
import type { AcademicManagementMfeProps } from './contracts/remote-props.js';

const App: FC<AcademicManagementMfeProps> = ({ apiBaseUrl = '/api/v1' }) => {
  const api = useMemo(() => new HttpFichasApi(apiBaseUrl), [apiBaseUrl]);

  return <FichasPage api={api} />;
};

export default App;
