import { Admin } from 'flyteidl';
import {
    defaultPaginationConfig,
    getAdminEntity,
    postAdminEntity,
    RequestConfig
} from 'models/AdminEntity';
import {
    endpointPrefixes,
    Identifier,
    IdentifierScope,
    makeIdentifierPath
} from 'models/Common';

import { LaunchPlan } from './types';
import { launchPlanListTransformer } from './utils';

/** Fetches a list of `LaunchPlan` records matching the provided `scope` */
export const listLaunchPlans = (
    scope: IdentifierScope,
    config?: RequestConfig,
    host?: string
) =>
    getAdminEntity(
        {
            host,
            path: makeIdentifierPath(endpointPrefixes.launchPlan, scope),
            messageType: Admin.LaunchPlanList,
            transform: launchPlanListTransformer
        },
        { ...defaultPaginationConfig, ...config }
    );

/** Fetches an individual `LaunchPlan` */
export const getLaunchPlan = (id: Identifier, config?: RequestConfig) =>
    getAdminEntity<Admin.LaunchPlan, LaunchPlan>(
        {
            path: makeIdentifierPath(endpointPrefixes.launchPlan, id),
            messageType: Admin.Task
        },
        config
    );

export const createLaunchPlan = (launchPlan, config?: RequestConfig) =>
    postAdminEntity<
        Admin.ILaunchPlanCreateRequest,
        Admin.LaunchPlanCreateResponse
    >(
        {
            data: {
                id: launchPlan.id,
                spec: launchPlan.spec
            },
            path: endpointPrefixes.launchPlan,
            requestMessageType: Admin.LaunchPlanCreateRequest,
            responseMessageType: Admin.LaunchPlanCreateResponse
        },
        config
    );
