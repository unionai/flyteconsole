import { Admin } from 'flyteidl';
import { sortBy } from 'lodash';
import { endpointPrefixes } from 'models/Common';

import { getAdminEntity, postAdminEntity } from '../AdminEntity';
import { Project } from './types';

/** Fetches the list of available `Project`s */
export const listProjects = (host?: string) =>
    getAdminEntity<Admin.Projects, Project[]>({
        host,
        path: endpointPrefixes.project,
        messageType: Admin.Projects,
        // We want the returned list to be sorted ascending by name, but the
        // admin endpoint doesn't support sorting for projects.
        transform: ({ projects }: Admin.Projects) => {
            const transformedProjects = sortBy(projects, 'name') as Project[];
            for (let x = 0; x < transformedProjects.length; x = x + 1) {
                transformedProjects[x].host = host;
            }
            return transformedProjects;
        }
    });

export const registerProject = name =>
    postAdminEntity<
        Admin.IProjectRegisterRequest,
        Admin.ProjectRegisterResponse
    >({
        data: {
            project: {
                name,
                id: name,
                description: name
            }
        },
        path: endpointPrefixes.project,
        requestMessageType: Admin.ProjectRegisterRequest,
        responseMessageType: Admin.ProjectRegisterResponse
    });
