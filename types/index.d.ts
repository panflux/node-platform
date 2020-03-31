/// <reference types="node" />

import {EventEmitter} from "events";
import {ValidationResult} from "@hapi/joi";
import {Logger} from "winston";

declare namespace panflux {

    interface EntityDefinition {
        id: string;
        name: string;
        type: string;
        config?: Map<string, any>;
        attributes?: Map<string, any>;
    }

    class Platform extends EventEmitter {
        constructor(config: any, rootdir: string);

        run(logTransport: any|any[]): void;

        buildEntityTypes(types: any): void;
        getEntityType(type: string): EntityType;
        validateEntity(definition: any): ValidationResult;

        config: any;
        types: EntityType[];
        name: string;
        friendlyName: string;
        rootdir: string;
        version?: string;
        versionURL?: string;

        static load(rootdir: string): Platform;
    }

    class Sandbox {
        constructor(platform: Platform, logger: Logger);

        processMessage(name: string, args: any): void;

        adopt(definition: EntityDefinition): void;
        reportDiscovery(object: any): boolean;

        setAttribute(entityId: string, name: string, value: any): void;
        setProperty(entityId: string, name: string, value: any): void;

        on(event: 'adopt', listener: (entity: Entity) => void): void;
        on(event: 'start', listener: (args: any) => void): void;
        on(event: 'stop', listener: (args: any) => void): void;
        on(event: 'discover', listener: (args: any) => void): void;
    }

    class EntityType {
        constructor(name: string, definition: any);

        createEntity(definition: EntityDefinition, platform: Sandbox, logger: Logger): Entity;
        registerChildEntityType(name: string, definition: EntityDefinition): void;

        validateDelta(delta: any): ValidationResult;
        validateEntity(entity: any): ValidationResult

        name: string;
    }

    class Entity {
        constructor(definition: EntityDefinition, type: EntityType, platform: Platform, logger: Logger);

        registerChildEntity(object: any): boolean;

        emit(event: string, parameters: any): void
        emit(event: string): void

        setAttribute(name: string, value: any): void;
        setAttributes(object: any): void;

        setProperty(name: string, value: any): void;
        setProperties(object: any): void;

        id: string;
        name: string;
        type: EntityType;
        config: any;
    }
}

export = panflux;
