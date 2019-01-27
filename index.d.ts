/// <reference types="node" />

declare namespace panflux {
    interface Platform {
        reportDiscovery(entity: Entity): void;
    }

    interface Entity {
        id: string;
        name: string;
        type: string;
        config: object;
    }
}

export = panflux;
