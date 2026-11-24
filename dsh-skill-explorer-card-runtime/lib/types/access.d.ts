/**
 * Skill-center trust fence: loopback (the desktop) always passes; a live
 * paired-device cookie is an additional allow path when remote-web-ui is
 * loaded; requests admitted by the host connection service (trusted-host / proxy)
 * pass directly. The plugin never depends on that plugin — without the service
 * the fence stays loopback-only. The decision logic lives in the generated
 * pair-access.ts copy (shared by pet / skill-explorer).
 */
import type { IncomingMessage } from 'node:http';
import type { Context } from '@deepseek-ai/cordis';
/** Structural lookup of the host connection service across SDK cohorts. */
export interface HostConnectionService {
    requestRejection?: (request: IncomingMessage) => unknown;
    admit?: (request: IncomingMessage) => {
        readonly peer?: unknown;
        readonly rejection?: unknown;
    };
}
/**
 * Whether this request may enter any /api/dsh-skill-explorer route.
 * @param ctx - host context; may expose remoteWebUiPairing or connection.
 * @param request - the incoming HTTP request.
 * @returns true for loopback, a live paired-device cookie, or an admitted host connection.
 */
export declare function isSkillExplorerAllowed(ctx: Context, request: IncomingMessage, connection?: HostConnectionService | undefined): boolean;
/**
 * Capture the host connection service in a scope that injects BOTH
 * `connection` and `connection.authentication`, the two services its
 * `admit(request)` bridge reads. The row's own `inject` list stays unchanged
 * (the service stays optional), and a cohort whose connection has no
 * authentication sub-service never activates this scope, so the reader keeps
 * returning whatever a bare lookup finds.
 * @param ctx - the plugin context.
 * @returns a reader of the captured service, undefined before it activates.
 */
export declare function captureConnection(ctx: Context): () => HostConnectionService | undefined;
