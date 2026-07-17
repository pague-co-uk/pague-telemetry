import {
    randomUUID,
} from 'node:crypto';

import type {
    SmppSessionContext,
    SmppSessionState,
} from './types.js';

import {
    decrementActiveSessions,
    incrementActiveSessions,
} from './metrics.js';

import {
    logSessionConnected,
    logSessionDisconnected,
} from './logger.js';

export class SmppSession {
    private readonly context: SmppSessionContext;

    constructor(
        remoteAddress?: string,
    ) {
        this.context = {
            sessionId: randomUUID(),
            state: 'connecting',
        };

        if (remoteAddress) {
            this.context.remoteAddress =
                remoteAddress;
        }
    }

    connect(): void {
        this.context.state =
            'connected';

        incrementActiveSessions();

        logSessionConnected(
            this.context.sessionId,
            this.context.remoteAddress,
        );
    }

    bind(
        systemId: string,
    ): void {
        this.context.systemId =
            systemId;

        this.context.state =
            'bound';
    }

    unbind(): void {
        this.context.state =
            'unbound';
    }

    disconnect(): void {
        if (
            this.context.state ===
            'closed'
        ) {
            return;
        }

        this.context.state =
            'closed';

        decrementActiveSessions();

        logSessionDisconnected(
            this.context.sessionId,
        );
    }

    updateState(
        state: SmppSessionState,
    ): void {
        this.context.state =
            state;
    }

    getContext(): SmppSessionContext {
        return {
            ...this.context,
        };
    }

    get sessionId(): string {
        return this.context.sessionId;
    }

    get state(): SmppSessionState {
        return this.context.state;
    }

    get systemId():
        | string
        | undefined {
        return this.context.systemId;
    }

    get remoteAddress():
        | string
        | undefined {
        return this.context.remoteAddress;
    }
}