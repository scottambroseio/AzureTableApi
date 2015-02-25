import { createTableService, generateDevelopmentStorageCredendentials, TableQuery } from 'azure-storage';
import { each } from 'lodash';
import AzureTableEntity from "./AzureTableEntity";
import nconf from 'nconf';

nconf.env().file({ file: '../config.json' });

function validateConstructorArgs(tableName, partitionKey) {
    if (arguments.length < 2)
        throw "All arguments are required";

    each(arguments, validateString);
}

function validateEntity(entity) {
    if (!(entity instanceof AzureTableEntity)) throw "The entity must be an instance of AzureTableEntity"
}

function validateString(string) {
    if (typeof(string) !== "string" || !string) throw "Invalid string";
}

let TableName = Symbol();
let PartitionKey = Symbol();
let StorageClient = Symbol();

export default class AzureTableRepository {
    constructor(tableName, partitionKey) {
        validateConstructorArgs.apply(null, arguments);

        if (nconf.get("NODE_ENV") === "debug") {
            this[StorageClient] = createTableService(generateDevelopmentStorageCredendentials());
        } else {
            let accountName = nconf.get("STORAGE_NAME");
            let accountKey = nconf.get("STORAGE_KEY");

            validateString(accountName);
            validateString(accountKey);

            this[StorageClient] = createTableService(accountName, accountKey);
        }

        this[TableName] = tableName;
        this[PartitionKey] = partitionKey;
    }

    Init() {
        return new Promise((res, rej) => {
            this[StorageClient].createTableIfNotExists(this[TableName], error => {
                if (error)
                    rej(error);
                else {
                    res();
                }
            });
        });
    }

    Create(entity) {
        validateEntity(entity);

        let updatedEntity = entity.set('PartitionKey', this[PartitionKey]);

        return new Promise((res, rej) => {
            this[StorageClient].insertEntity(this[TableName], updatedEntity.toJS(), (error, result) => {
                if (error)
                    rej(error);
                else {
                    res(result);
                }
            });
        });
    };

    Retrieve(rowkey) {
        validateString(rowkey);

        return new Promise((res, rej) => {
            this[StorageClient].retrieveEntity(this[TableName], this[PartitionKey], rowkey, (error, result) => {
                if (error)
                    rej(error);
                else {
                    res(AzureTableEntity.createEntityFromSource(result));
                }
            });
        });
    }

    Update(entity) {
        validateEntity(entity);

        return new Promise((res, rej) => {
            this[StorageClient].updateEntity(this[TableName], entity.toJS(), (error, result) => {
                if (error)
                    rej(error);
                else {
                    res(result);
                }
            });
        });
    }

    Delete(entity) {
        validateEntity(entity);

        return new Promise((res, rej) => {
            this[StorageClient].deleteEntity(this[TableName], entity.toJS(), (error, result) => {
                if (error)
                    rej(error);
                else {
                    res(result);
                }
            });
        });
    }

    Query(query = new TableQuery()) {
        return new Promise((res, rej) => {
            this[StorageClient].queryEntities(this[TableName], query, null, (error, result, response) => {
                if (error)
                    rej(error);
                else {
                    let entitys = result.entries.map(AzureTableEntity.createEntityFromSource);

                    res(entitys);
                }
            });
        });
    }

    Batch(batch) {
        return new Promise((res, rej) => {
            this[StorageClient].executeBatch(this[TableName], batch, (error, result, response) => {
                if (error)
                    rej(error);
                else {
                    res(result);
                }
            });           
        });
    }
}