export interface EnvironmentMatchParams {
    domain?: string;
    project?: string;
}

export interface Query {
    [key: string]: string;
}

export interface Route {
    path?: string;
    makeUrl?: (...parts: string[]) => string;
}

export type ProjectRouteGenerator = (project: string, domain: string) => string;

export type RouteDictionary = { [k: string]: Route };
