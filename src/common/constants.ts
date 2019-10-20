export const workflowTabIds = {
    executions: 'executions',
    launchPlans: 'launch_plans',
    schedules: 'schedules',
    versions: 'versions'
};

export const mainRegistryName = 'main';

export const registryURLs = {};

registryURLs[mainRegistryName] = '';

// TODO LOOP over a config
registryURLs['registry'] = 'http://localhost:30082';

export const contentContainerId = 'content-container';
export const detailsPanelId = 'details-panel';
export const navBarContentId = 'nav-bar-content';

export const unknownValueString = '(unknown)';

export const externalLinks = {
    // TODO: add flyte docs and feedback links when we have them
    docs: '',
    feedback: ''
};

export enum KeyCodes {
    ESCAPE = 27
}
