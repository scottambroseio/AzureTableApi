import azure from 'azure-storage';
import _ from 'lodash';
import AzureTableEntity from "./AzureTableEntity";
import nconf from 'nconf';

nconf.env().file({ file: 'config.json' });

var accountName = nconf.get("STORAGE_NAME");
var accountKey = nconf.get("STORAGE_KEY");

function validateConstructorArgs(tableName, partitionKey) {
    if (arguments.length < 2)
        throw "All arguments are required";

    var result = _.every(arguments, element => typeof (element) === "string" && element);

    if (!result)
        throw "All provided arguments must be strings which aren't empty";
}

function validateEntity(entity) {
    if (!(entity instanceof AzureTableEntity)) throw "The entity must be an instance of AzureTableEntity"
}

function validateRowKey(rowkey) {
    if (typeof(rowkey) !== "string" || !rowkey) throw "Invalid rowkey";
}

export default class AzureTableRepository {
    constructor(tableName, partitionKey) {
        validateConstructorArgs.apply(null, arguments);

        if (nconf.get("NODE_ENV") === "debug") {
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