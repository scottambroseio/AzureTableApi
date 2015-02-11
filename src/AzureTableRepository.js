import azure from 'azure-storage';
import _ from 'lodash';
import Immutable from 'Immutable';
import uuid from "node-uuid";
import AzureTableEntity from "./AzureTableEntity";

var entGen = azure.TableUtilities.entityGenerator;

function validateConstructorArgs(accountName, accountKey, tableName, partitionKey) {
    if (arguments.length !== 4)
        throw "All four arguments are required";

    // Check all are strings and have a body
    var result = _.every(arguments, element => typeof (element) === "string" && element.length);

    if (!result)
        throw "All provided arguments must be strings which aren't empty";
}

function validateEntity(entity) {
    if (!(entity instanceof AzureTableEntity)) throw "the entity must be an instance of AzureTableEntity"
}

function validateRowKey(rowkey) {
    return typeof(rowkey) !== "string" || !rowkey.length;
}

export default class AzureTableRepository {
    constructor(accountName, accountKey, tableName, partitionKey) {
        validateConstructorArgs.apply(null, arguments);

        if (process.env.NODE_ENV === "debug") {
            this.storageClient = azure.createTableService(azure.generateDevelopmentStorageCredendentials());
        } else {
            this.storageClient = azure.createTableService(accountName, accountKey);
        }

        this.tableName = tableName;
        this.partitionKey = partitionKey;
    }

    Init() {
        return new Promise((res, rej) => {
            this.storageClient.createTableIfNotExists(this.tableName, error => {
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

        var updatedEntity = entity.set('PartitionKey', this.partitionKey);

        return new Promise((res, rej) => {
            this.storageClient.insertEntity(this.tableName, updatedEntity.toJS(), (error, result) => {
                if (error)
                    rej(error);
                else {
                    res(result);
                }
            });
        });
    };

    Retrieve(rowkey) {
        validateRowKey(rowkey);

        return new Promise((res, rej) => {
            this.storageClient.retrieveEntity(this.tableName, this.partitionKey, rowkey, (error, result) => {
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
            this.storageClient.updateEntity(this.tableName, entity.toJS(), (error, result) => {
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
            this.storageClient.deleteEntity(this.tableName, entity.toJS(), (error, result) => {
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
            this.storageClient.queryEntities(this.tableName, query, null, (error, result, response) => {
                if (error)
                    rej(error);
                else {
                    var entitys = _.map(result.entries, source => AzureTableEntity.createEntityFromSource(source));

                    res(entitys);
                }
            });
        });
    }
}