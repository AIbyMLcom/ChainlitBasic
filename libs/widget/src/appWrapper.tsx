import { makeApiClient } from 'api';
import App from 'app';
import { WidgetContext } from 'context';
import { RecoilRoot } from 'recoil';
import { IWidgetConfig } from 'types';

interface Props {
  config: IWidgetConfig;
}

export default function AppWrapper({ config }: Props) {
  return (
    <RecoilRoot>
      <WidgetContext.Provider
        value={{
          accessToken: config.accessToken,
          apiClient: makeApiClient(config.chainlitServer)
        }}
      >
        <App config={config} />
      </WidgetContext.Provider>
    </RecoilRoot>
  );
}
