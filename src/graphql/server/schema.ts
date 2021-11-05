import WorkflowTypeDefs from './workflow/schema';

const baseTypeDefs = `
    scalar Object
    scalar Long

    input Sort {
        key: String
        direction: Int
    }

    type Identifier {
        resourceType: Int
        project: String
        domain: String
        name: String
        version: String
    }

    type Duration {
        seconds: Long
        nanos: Int
    }

    type Timestamp {
        seconds: Long
        nanos: Int
    }

    type Variable {
        type: String
        description: String
    }

    type VariableMap {
        variables: Object
    }

    type TypedInterface {
        inputs: VariableMap
        outputs: VariableMap
    }

    type ResourceEntry {
        name: Int
        value: String
    }

    type Resources {
        requests: [ResourceEntry]
        limits: [ResourceEntry]
    }

    type KeyValuePair {
        key: String
        value: String
    }

    type ContainerPort {
        containerPort: Int
    }

    type IOStrategy {
        downloadMode: Int
        uploadMode: Int
    }

    type Primitive {
        integer: Long
        floatValue: Float
        stringValue: String
        boolean: Boolean
        datetime: Timestamp
        duration: Duration
    }

    type BlobType {
        format: String
        dimensionality: Int
    }

    type BlobMetadata {
        type: BlobType
    }

    type Blob {
        metadata: BlobMetadata
        uri: String
    }

    type Binary {
        value: [Int]
        tag: String
    }

    type SchemaColumn {
        name: String
        type: Int
    }

    type SchemaType {
        columns: [SchemaColumn]
    }

    type Schema {
        uri: String
        type: SchemaType
    }

    type Error {
        failedNodeId: String
        message: String
    }

    type Struct {
        fields: Object
    }

    type Scalar {
        primitive: Primitive
        blob: Blob
        binary: Binary
        schema: Schema
        error: Error
        generic: Struct
    }

    type BindingDataCollection {
        bindings: [BindingData]
    }

    type OutputReference {
        nodeId: String
        var: String
    }

    type BindingDataMap {
        bindings: Object
    }

    type BindingData {
        scalar: Scalar
        collection: BindingDataCollection
        promise: OutputReference
        map: BindingDataMap
    }

    type Binding {
        var: String
        binding: BindingData
    }

    type DataLoadingConfig {
        enabled: Boolean
        inputPath: String
        outputPath: String
        format: Int
        ioStrategy: IOStrategy
    }

    type Container {
        image: String
        command: [String]
        args: [String]
        resources: Resources
        env: [KeyValuePair]
        config: [KeyValuePair]
        ports: [ContainerPort]
        dataConfig: DataLoadingConfig
    }

    type Alias {
        var: String
        alias: String
    }

    type TaskNodeOverrides {
        resources: Resources
    }

    type TaskNode {
        referenceId: Identifier
        overrides: TaskNodeOverrides
    }

    type WorkflowNode {
        launchplanRef: Identifier
        subWorkflowRef: Identifier
    }

    type ConjunctionExpression {
        operator: Int
        leftExpression: BooleanExpression
        rightExpression: BooleanExpression
    }

    type Operand {
        primitive: Primitive
        var: String
    }

    type ComparisonExpression {
        operator: Int
        leftValue: Operand
        rightValue: Operand
    }

    type BooleanExpression {
        conjunction: ConjunctionExpression
        comparison: ComparisonExpression
    }

    type IfBlock {
        condition: BooleanExpression
        thenNode: Node
    }

    type IfElseBlock {
        case: IfBlock
        other: [IfBlock]
        elseNode: Node
        error: Error
    }

    type BranchNode {
        ifElse: IfElseBlock
    }

    type NodeMetadata {
        name: String
        timeout: Duration
        retries: RetryStrategy
        interruptible: Boolean
    }

    type Node {
        id: String
        metadata: NodeMetadata
        inputs: [Binding]
        upstreamNodeIds: [String]
        outputAliases: [Alias]
        taskNode: [TaskNode]
        workflowNode: [WorkflowNode]
        branchNode: [BranchNode]
    }

    type QualityOfServiceSpec {
        queueingBudget: Duration
    }

    type QualityOfService {
        tier: Int
        spec: QualityOfServiceSpec
    }

    type WorkflowMetadata {
        qualityOfService: QualityOfService
        onFailure: Int
    }

    type WorkflowMetadataDefaults {
        interruptible: Boolean
    }

    type CompiledNodeMetadata {
        name: String
        timeout: Int
        retries: Int
    }

    type CompiledNode {
        branchNode: BranchNode
        id: String
        inputs: [Binding]
        metadata: CompiledNodeMetadata
        outputAliases: [Alias]
        taskNode: TaskNode
        upstreamNodeIds: [String]
        workflowNode: WorkflowNode
    }

    type AuthRole {
        assumableIamRole: String
        kubernetesServiceAccount: String
    }

    type NotificationList {
        notifications: [Notification]
    }

    type Labels {
        values: Object
    }

    type Annotations {
        values: Object
    }

    type SecurityContext {
        runAs: Identity
        secrets: [Secret]
        tokens: [OAuth2TokenRequest]
    }

    type Secret {
        group: String
        groupVersion: String
        key: String
        mountRequirement: Int
    }

    type OAuth2TokenRequest {
        name: String
        type: Int
        client: OAuth2Client
        idpDiscoveryEndpoint: String
        tokenEndpoint: String
    }

    type OAuth2Client {
        clientId: String
        clientSecret: Secret
    }

    type Identity {
        iamRole: String
        k8sServiceAccount: String
        oauth2Client: OAuth2Client
    }
`;

const executionTypeDefs = `
    type Execution {
        closure: ExecutionClosure
        id: WorkflowExecutionIdentifier
        spec: ExecutionSpec
    }

    type ExecutionClosure {
        createdAt: Timestamp
        computedInputs: LiteralMap
        duration: Duration
        error: ExecutionError
        outputs: LiteralMapBlob
        phase: Int
        startedAt: Timestamp
        workflowId: Identifier
        abortCause: String
        abortMetadata: AbortMetadata
        updatedAt: Timestamp
        notifications: [Notification]
    }

    type ExecutionError {
        code: String
        message: String
        errorUri: String
        kind: Int
    }

    type LiteralMap {
        literals: Object
    }

    type LiteralMapBlob {
        values: LiteralMap
        uri: String
    }

    type AbortMetadata {
        cause: String
        principal: String
    }

    type Notification {
        phases: [Int]
        email: EmailNotification
        pagerDuty: PagerDutyNotification
        slack: SlackNotification
    }

    type EmailNotification {
        recipientsEmail: [String]
    }

    type PagerDutyNotification {
        recipientsEmail: [String]
    }

    type SlackNotification {
        recipientsEmail: [String]
    }

    type WorkflowExecutionIdentifier {
        project: String
        domain: String
        name: String
    }

    type ExecutionSpec {
        authRole: AuthRole
        inputs: LiteralMap
        launchPlan: Identifier
        metadata: ExecutionMetadata
        notifications: NotificationList
        disableAll: Boolean
        labels: Labels
        annotations: Annotations
        securityContext: SecurityContext
        qualityOfService: QualityOfService
        maxParallelism: Int
    }

    type ExecutionMetadata {
        mode: Int
        principal: String
        nesting: Int
        referenceExecution: WorkflowExecutionIdentifier
        parentNodeExecution: NodeExecutionIdentifier
    }

    type NodeExecutionIdentifier {
        nodeId: String
        executionId: WorkflowExecutionIdentifier
    }
`;

const ServiceTypeDefs = [baseTypeDefs, executionTypeDefs, WorkflowTypeDefs];

export default ServiceTypeDefs;
