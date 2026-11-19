# Multi-agent architecture — 2026-11-06

## Confirmed design

The user talks to Super. Super coordinates Reviewer, Executor and Architect and
receives their deliverables. Explicit `/reviewer`, `/executor`, `/architect`
requests select the role deterministically. The application displays delegate
progress and reports in the Super conversation.

Each role binds a built-in model, instructions, skills and tools. Providers use
Pydantic AI native adapters. Super and Reviewer use Medium, Architect uses High,
and Executor uses Low. Model names, explicit
service providers, API protocols, context windows and timeouts live in `provider.jsonc`, whose
`default_model` selects the default. Credentials and endpoints stay in environment
variables. Role configuration remains built-in.

Reviewer and Architect have read-only filesystem tools. Executor implements
approved work and verifies it. Super retains the existing coding capabilities.
All roles can delegate to themselves. Only Super's primary run can choose other
roles. Read-only clones share their parent's workspace. Writable clones execute
serially in that workspace. Role and tool restrictions are enforced at runtime.

## Native runtime

Use `Agent`, `SubAgent`, `SubAgents`, `TaskControl`, `DelegationTasks`,
`DelegationReports`, native task events, `StepPersistence` and `SqliteStepStore`.
One managed delegation owner lives for the interactive Super session. It saves
task records and binds to each Super run. Native reports carry delegate outputs
back to Super. Native task records and run snapshots retain history and results.
No additional task scheduler, handoff database or message queue is introduced.

`conversation_id` identifies a conversation and `run_id` identifies an Agent run.
These are Pydantic AI terms. A native task ID identifies a resumable delegation;
its `run_id` changes on resume. Approval must refer to the reviewed run version.
References:

- https://pydantic.dev/docs/ai/guides/multi-agent-applications/
- https://pydantic.dev/docs/ai/harness/subagents/
- https://pydantic.dev/docs/ai/harness/step-persistence/

## Workspaces and persistence

Independent role tasks started at a Git repository root use local worktrees
based on an explicit commit. Ordinary directories and repository subdirectories
use the selected workspace under its existing execution lease.
Worktrees are the only independent-task parallel backend. Clones reuse their
parent workspace. The application owns worktree allocation, validation, locks
and retention. Uncommitted source snapshots and cloud sandboxes are deferred.
Keep worktrees with unintegrated results. Integration requires explicit user
authorization and existing planning/tool checks.

The native delegation owner stores task records under the fixed application
state directory and uses the existing SQLite step store for child snapshots.
Restoring interrupted work requires inspecting side effects and explicit resume.
Existing Super sessions retain the current history repair and frontier capture.

## Approval and deliverables

Native delegate output is the deliverable. Show its native task ID, source
`run_id`, role and baseline. A revised report is a new run version. User approval
precedes execution of reviewed work. Reuse `Interaction.approve` and current
permissions; approval expires across process restarts. Execution plans and exact
tool calls remain independently checked. Reports are untrusted task data.

## Implementation seams and verification

Keep `create_agent(session_id, path)` as the prepared session factory. Use the
existing Conversation send path and native workspace backends. Adapt mutable
interaction/permission/plan state to run scope. Delegation must not hold the
side-effect lock while awaiting a child. Native owner events feed the shell.

Implement model bindings, native role delegation, worktree/permissions, user
confirmation and same-role clones in that order. Verify only affected tests,
including real Git worktrees and simulated models. Cover restore, duplicate
delivery, cancellation, parent/child authorization, deadlocks and role routing.
Every handwritten code file must remain at most 500 lines. Product operation
instructions belong in the project README.

## Concrete integration

`integrations/provider.py` constructs native OpenAI-compatible, Anthropic and
OpenRouter models from `provider.jsonc`. `provider` selects the service, and
`protocol` selects OpenAI Chat Completions or Anthropic Messages. OpenRouter
requires an explicit protocol; both routes use its own API key. The OpenAI route
uses `OpenRouterModel`/`OpenRouterProvider`, and Messages uses
`AnthropicModel`/`AnthropicProvider` with the SDK's Bearer-token authentication.
All services read `{PROVIDER}_BASE_URL` and `{PROVIDER}_API_KEY`. OpenRouter's
OpenAI route injects an SDK client with that base URL. Anthropic routes remove a
terminal `/v1` because the SDK adds `/v1/messages` itself.
`agent/roles.py` binds a typed `ModelTier` alongside role-local skill/tool
selection. The `model_tiers` mapping in `provider.jsonc` resolves tiers to model IDs.
Native `SelectModel` resolves delegate models lazily. `agent/runtime.py` remains
the session factory and binds the native capability graph.

`agent/delegation.py` adapts native task ownership, explicit role requests and
worktree resolution. `agent/role_services.py` resolves mutable permissions and
plans per run through `DynamicCapability`. `agent/mcp_services.py` gives Super
clones run-scoped MCP clients with the same capabilities and permission checks.

`storage/worktrees.py` owns detached worktrees and validates repository/baseline
identity. A small manifest records the code baseline; native Harness records own
task history and results. `storage/delegations.py` only locates and reads these
native records for session listing/deletion. Existing session storage retains
Super history. No separate handoff persistence format is introduced.

The source task ID selects a native delegation. Its source `run_id` selects the
reviewed version. Runtime confirmation checks that the version has not changed
while the user reviewed it. Execution approval and tool approval
are independent. Reopening the application expires execution approval.

Independent tasks use committed code. A source Executor must produce a committed
checkpoint before a new independent task can consume its code. Unintegrated
worktrees remain available after task completion or conversation deletion.
