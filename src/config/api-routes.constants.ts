import { environment } from "./../environments/environment";

// tslint:disable-next-line: no-big-function
export const API_ROUTES = () => {
  const getApiEndPoint = () => environment.apiEndPoint;

  const routes = {
    Visual: {
      BOX: () => `${getApiEndPoint()}/box`,
    }
  };
  if (environment.local) {
    routes.Visual.BOX = () => `${getApiEndPoint()}/box.json`;
  }
  return routes;
}
