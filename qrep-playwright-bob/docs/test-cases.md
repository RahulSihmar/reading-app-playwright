# Db2 Q Replication test cases

These cases target a Db2 Genius Hub deployment with Q Replication/QRep REST Central. Confirm the routes, roles, resource names, and supported API contract against the version under test before execution. Do not infer REST paths or payloads from UI traffic and then use them for destructive operations.

## Browser smoke cases in this project

| ID | Scenario | Preconditions | Expected result | Automation |
|---|---|---|---|---|
| UI-001 | Login page is usable | Test URL reachable | Username/password inputs and sign-in button are visible and accessible by their configured names | `tests/login.spec.ts` |
| UI-002 | Successful sign-in | Dedicated valid test user | Configured dashboard heading is visible after sign-in | `tests/login.spec.ts` |
| UI-003 | Invalid sign-in | Dedicated invalid credentials and expected error text configured | Authentication error is visible and the user remains on the login route | `tests/login.spec.ts` |
| UI-004 | QRep overview loads | Valid user; overview route configured | Configured Replications heading is visible | `tests/replications.spec.ts` |

## Q Replication functional scenarios

Use a disposable source/target pair and uniquely named test objects. The scenarios below are a test plan, not executable assertions until the deployment-specific UI/API contract and DB verification method are agreed. Capture the Q subscription status and source/target row counts or checksums as evidence.

| ID | Priority | Scenario | Steps and assertions |
|---|---|---|---|
| QREP-001 | P1 | Replication inventory and status | Open the QRep overview. Verify each expected test subscription appears once and its displayed state matches the authoritative Q Replication monitor. Verify empty-state behavior when there are no subscriptions. |
| QREP-002 | P1 | Create a test Q subscription | With an approved isolated fixture, create a subscription for a test table using valid source, target, queue-map, and schema configuration. Verify the UI/API response and persisted subscription details; confirm its initial state with the monitor. |
| QREP-003 | P1 | Required-field and invalid-configuration validation | Submit a missing required field and invalid source/target or queue-map combination. Verify a clear validation error, no success-shaped response, and no partial subscription or queue object. |
| QREP-004 | P1 | Start replication and verify data movement | Start an approved test subscription. Insert uniquely identified rows at the source, wait for the configured replication SLA, and compare key values/counts at the target. Verify the subscription reaches the expected active state. |
| QREP-005 | P1 | Stop replication | Stop a running test subscription. Verify the state transition and that subsequent source changes are not applied to the target until restart; avoid asserting an exact transition duration unless specified by the product SLA. |
| QREP-006 | P1 | Restart and catch-up | Restart a stopped subscription. Verify queued changes are applied once, target data converges with source, and there are no unexpected duplicates or gaps. |
| QREP-007 | P1 | Source/target data consistency | Insert, update, and delete uniquely keyed test rows. Compare the target against the expected final source state, not merely request success or UI status. |
| QREP-008 | P2 | Monitor lag and status refresh | Generate controlled test traffic. Verify status/latency refresh, timestamps are current, and displayed values agree with the supported monitor source within the documented refresh interval. |
| QREP-009 | P1 | Authorization boundaries | Use least-privilege read-only and operator test accounts. Verify read-only users can inspect but cannot invoke write operations; verify unauthenticated/unauthorized API requests are rejected without state change. |
| QREP-010 | P2 | REST Central error handling | In a safe test environment, exercise documented not-found, conflict, invalid-input, and unavailable-dependency conditions. Verify documented status/error shape, useful UI feedback, and no leaked credentials or internal stack traces. |
| QREP-011 | P2 | Idempotency and duplicate submission | Repeat only a documented idempotent request or safely repeat the same UI action. Verify the documented response and that duplicate subscriptions/rows are not silently created. |
| QREP-012 | P2 | Network interruption and recovery | Interrupt a test dependency only with approval. Verify the UI surfaces failure, no false active/success state is shown, and service recovery returns to the expected state without losing or duplicating test changes. |
| QREP-013 | P2 | Delete/cleanup test subscription | After recording evidence and confirming the object is disposable, delete the test subscription. Verify it is absent from the inventory and cleanup does not affect unrelated subscriptions. |
| QREP-014 | P2 | Browser reload/session expiry | Reload the overview and exercise configured session expiry. Verify state is reloaded from the server and expired sessions are redirected to sign-in without exposing protected data. |
| QREP-015 | P2 | Cross-browser smoke | Run read-only login and overview cases in Chromium, Firefox, and WebKit where supported by the deployment. Verify core navigation and accessible controls remain usable. |

## Evidence to capture

For each run, record the case ID, environment/build, sanitized test object identifiers, account role, timestamps, result, and relevant screenshot/trace. For replication tests, also record the authoritative subscription state and source/target verification result. Do not attach credentials, access tokens, production data, or unredacted request headers.

## IBM Bob prompt templates

### Plan a read-only smoke test

> Using the Playwright MCP tools available to you, navigate to the configured Db2 Genius Hub test URL. First inspect the page accessibility snapshot and propose a read-only plan for UI-001 and UI-004. Do not submit forms or mutate Q Replication objects. Identify the accessible names for sign-in and the Replications page, the visible status indicators, and any API requests observed while loading. Report assumptions and wait for approval before any write action.

### Run login and overview checks

> Execute UI-001 and, if test credentials are already supplied securely in the test environment, UI-002 and UI-004. Use accessible role/label locators, verify the expected page heading and route, inspect failed network requests, and save a screenshot on failure. Do not print or repeat credential values. Report each case as pass, fail, or blocked with evidence.

### Investigate a selector failure (healer workflow)

> A previously identified step failed. Re-read the current accessibility snapshot and compare it with the original intended assertion. Suggest a corrected semantic locator and explain why it is equivalent. Do not broaden the assertion, bypass authorization, or perform writes. Retry only the same step after confirming the replacement preserves the original test intent; otherwise report blocked.

### Plan a QRep data-movement test

> Plan QREP-004 for an isolated test subscription only. First list the required preconditions, approved source/target verification method, unique test row identifiers, cleanup, and stop conditions. Do not create, start, stop, alter, or delete any replication object until I explicitly approve the plan. Do not infer undocumented REST endpoints or payloads.
