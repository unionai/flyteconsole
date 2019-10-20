import { Tab, Tabs } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { mainRegistryName, registryURLs } from 'common/constants';
import { env } from 'common/env';
import { SearchableList, SearchResult, WaitForData } from 'components/common';
import {
    FetchableData,
    useProject,
    useProjects,
    useQueryState
} from 'components/hooks';
import { Project } from 'models/Project';
import * as React from 'react';
import { ProjectList } from './ProjectList';

const useStyles = makeStyles((theme: Theme) => ({
    tab: {
        textTransform: 'capitalize'
    },
    tabs: {
        borderBottom: `1px solid ${theme.palette.divider}`
    },
    container: {
        textAlign: 'center'
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: `${theme.spacing(2)} 0`
    },
    searchContainer: {
        minWidth: theme.spacing(45)
    }
}));

const renderProjectList = (results: SearchResult<Project>[]) => (
    <ProjectList projects={results.map(r => r.value)} />
);

export const SelectProjectHost: React.FC = props => {
    const styles = useStyles();
    const projects = useProjects(props.host);
    return (
        <WaitForData {...projects}>
            <div className={styles.container}>
                <h1>Welcome to Flyte</h1>
                <Typography variant="h6">
                    <p>Select a project to get started...</p>
                </Typography>
                <section className={styles.buttonContainer}>
                    <div className={styles.searchContainer}>
                        <SearchableList
                            items={projects.value}
                            placeholder="Search for projects by name"
                            propertyGetter="name"
                            renderContent={renderProjectList}
                        />
                    </div>
                </section>
            </div>
        </WaitForData>
    );
};

/** The view component for the landing page of the application. */
export const SelectProject: React.FC = () => {
    const { params, setQueryStateValue } = useQueryState<{
        domain: string;
        host: string;
    }>();
    const handleTabChange = (event: React.ChangeEvent<{}>, tabId: string) =>
        setQueryStateValue('host', tabId);
    const styles = useStyles();
    return (
        <>
            <Tabs
                className={styles.tabs}
                onChange={handleTabChange}
                value={params.host || mainRegistryName}
            >
                {Object.keys(registryURLs).map(id => (
                    <Tab
                        className={styles.tab}
                        key={id}
                        value={id}
                        label={id}
                    />
                ))}
            </Tabs>
            <SelectProjectHost host={params.host} />
        </>
    );
};
