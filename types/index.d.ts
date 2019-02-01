/// <reference types="node" />

import {EventEmitter} from "events";

declare namespace panflux {
    interface Sandbox extends EventEmitter {
        reportDiscovery(entity: Entity): void;
    }

    interface EntityDeclaration {
        id: string;
        name: string;
        type: string;
        config?: Map<string, any>;
        attributes?: Map<string, any>;
    }

    interface Entity {
        setState(name: string, value: number): number;
    }
}

export = panflux;
