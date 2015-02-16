import azure from 'azure-storage';
import _ from 'lodash';
import AzureTableEntity from "./AzureTableEntity";
import nconf from 'nconf';

nconf.env().file({ file: 'config.json' });

function validateConstructorArgs(tableName, partitionKey) {
    if (arguments.length < 2)
        throw "All arguments are required";

    _.each(arguments, validateString);
}

function validateEntity(entity) {
    if (!(entity instanceof AzureTableEntity)) throw "The entity must be an instance of AzureTableEntity"
}

function validateString(string) {
    if (typeof(string) !== "string" || !string) throw "Invalid string";
}

var TABLE_NAME = Symbol();
var PARTITION_KEY = Symbol();
var STORAGE_CLIENT = Symbol();

export default class AzureTableRepository {
    constructor(tableName, partitionKey) {
        validateConstructorArgs.apply(null, arguments);

        if (nconf.get("NODE_ENV") === "debug") {
            this[STORAGE_CLIENT] = azure.createTableService(azure.generateDevelopmentStorageCredendentials());
        } else {
            let accountName = nconf.get("STORAGE_NAME");
            let accountKey = nconf.get("STORAGE_KEY");

            validateString(accountName);
            validateString(accountKey);

            this[STORAGE_CLIENT] = azure.createTableService(accountName, accountKey);
        }

        this[TABLE_NAME] = tableName;
        this[PARTITION_KEY] = partitionKey;
    }

    Init() {
        return new Promise((res, rej) => {
            this[STORAGE_CLIENT].createTableIfNotExists(this[TABLE_NAME], error => {
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

        var updatedEntity = entity.set('PartitionKey', this[PARTITION_KEY]);

        return new Promise((res, rej) => {
            this[STORAGE_CLIENT].insertEntity(this[TABLE_NAME], updatedEntity.toJS(), (error, result) => {
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
            this[STORAGE_CLIENT].retrieveEntity(this[TABLE_NAME], this[PARTITION_KEY], rowkey, (error, result) => {
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
            this[STORAGE_CLIENT].updateEntity(this[TABLE_NAME], entity.toJS(), (error, result) => {
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
            this[STORAGE_CLIENT].deleteEntity(this[TABLE_NAME], entity.toJS(), (error, result) => {
                if (error)
                    rej(error);
                else {
                    res(result);
                }
            });
        });
    }

    Query(query) {
        return new Promise((res, rej) => {
            this[STORAGE_CLIENT].queryEntities(this[TABLE_NAME], query, null, (error, result, response) => {
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
            this[STORAGE_CLIENT].executeBatch(this[TABLE_NAME], batch, (error, result, response) => {
                if (error)
                    rej(error);
                else {
                    res(result);
                }
            });           
        });
    }
}