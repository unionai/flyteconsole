const typeDefs = `
    input IdentifierInput {
        project: String
        domain: String
        name: String
        version: String
    }

    input RequestConfigInput {
        limit: Int
        token: String
        sort: Sort
        filter: Object
    }

    type RuntimeMetadata {
        type: Int
        version: String
        flavor: String
    }

    type RetryStrategy {
        retries: Int
    }

    type TaskMetadata {
        discoverable: Boolean
        runtime: RuntimeMetadata
        retries: RetryStrategy
        discoveryVersion: String
        deprecated: String
    }

    type TaskTemplate {
        container: Container
        custom: Struct
        id: Identifier
        interface: TypedInterface
        metadata: TaskMetadata
        type: String
    }

    type CompiledTask {
        template: TaskTemplate
    }

    type ConnectionSet {
        downstream: Object
        upstream: Object
    }

    type CompiledWorkflow {
        template: WorkflowTemplate
        connections: ConnectionSet
    }

    type CompiledWorkflowClosure {
        primary: CompiledWorkflow
        subWorkflows: [CompiledWorkflow]
        tasks: [CompiledTask]
    }

    type WorkflowClosure {
        compiledWorkflow: CompiledWorkflowClosure
        createdAt: Timestamp
    }

    type Workflow {
        id: Identifier
        closure: WorkflowClosure
    }

    type WorkflowResult {
        data: [Workflow]
    }

    type WorkflowTemplate {
        id: Identifier
        interface: TypedInterface
        nodes: [CompiledNode]
        metadata: WorkflowMetadata
        outputs: [Binding]
        failureNode: Node
        metadataDefaults: WorkflowMetadataDefaults
    }

    type GetWorkflowResultItem {
        id: Identifier
        closure: WorkflowClosure
        lastExecutions: [Execution]
        description: String
    }

    type GetWorkflowResult {
        entities: [GetWorkflowResultItem]
        token: String
    }

    type Query {
        getWorkflows(id: IdentifierInput!, config: RequestConfigInput): GetWorkflowResult
    }
`;

export default typeDefs;
