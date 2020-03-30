/// <reference types="node" />

import {EventEmitter} from "events";
import {ValidationResult} from "@hapi/joi";
import {Logger} from "winston";

declare namespace panflux {
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

    interface EntityDeclaration {
        id: string;
        name: string;
        type: string;
        config?: Map<string, any>;
        attributes?: Map<string, any>;
    }

    class EntityType {
        constructor(name: string, definition: any);

        createEntity(definition: any, platform: Platform, logger: Logger): Entity;
        registerChildEntityType(name: string, definition: any): void;

        validateDelta(delta: any): ValidationResult;
        validateEntity(entity: any): ValidationResult

        name: string;
    }

    class Entity {
        constructor(definition: any, type: EntityType, platform: Platform, logger: Logger);

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
