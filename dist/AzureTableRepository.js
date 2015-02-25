"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _azureStorage = require("azure-storage");

var createTableService = _azureStorage.createTableService;
var generateDevelopmentStorageCredendentials = _azureStorage.generateDevelopmentStorageCredendentials;
var TableQuery = _azureStorage.TableQuery;
var each = require("lodash").each;
var AzureTableEntity = _interopRequire(require("./AzureTableEntity"));

var nconf = _interopRequire(require("nconf"));

nconf.env().file({ file: "../config.json" });

function validateConstructorArgs(tableName, partitionKey) {
    if (arguments.length < 2) throw "All arguments are required";

    each(arguments, validateString);
}

function validateEntity(entity) {
    if (!(entity instanceof AzureTableEntity)) throw "The entity must be an instance of AzureTableEntity";
}

function validateString(string) {
    if (typeof string !== "string" || !string) throw "Invalid string";
}

var TableName = Symbol();
var PartitionKey = Symbol();
var StorageClient = Symbol();

var AzureTableRepository = (function () {
    function AzureTableRepository(tableName, partitionKey) {
        _classCallCheck(this, AzureTableRepository);

        validateConstructorArgs.apply(null, arguments);

        if (nconf.get("NODE_ENV") === "debug") {
            this[StorageClient] = createTableService(generateDevelopmentStorageCredendentials());
        } else {
            var accountName = nconf.get("STORAGE_NAME");
            var accountKey = nconf.get("STORAGE_KEY");

            validateString(accountName);
            validateString(accountKey);

            this[StorageClient] = createTableService(accountName, accountKey);
        }

        this[TableName] = tableName;
        this[PartitionKey] = partitionKey;
    }

    _prototypeProperties(AzureTableRepository, null, {
        Init: {
            value: function Init() {
                var _this = this;
                return new Promise(function (res, rej) {
                    _this[StorageClient].createTableIfNotExists(_this[TableName], function (error) {
                        if (error) rej(error);else {
                            res();
                        }
                    });
                });
            },
            writable: true,
            configurable: true
        },
        Create: {
            value: function Create(entity) {
                var _this = this;
                validateEntity(entity);

                var updatedEntity = entity.set("PartitionKey", this[PartitionKey]);

                return new Promise(function (res, rej) {
                    _this[StorageClient].insertEntity(_this[TableName], updatedEntity.toJS(), function (error, result) {
                        if (error) rej(error);else {
                            res(result);
                        }
                    });
                });
            },
            writable: true,
            configurable: true
        },
        Retrieve: {
            value: function Retrieve(rowkey) {
                var _this = this;
                validateString(rowkey);

                return new Promise(function (res, rej) {
                    _this[StorageClient].retrieveEntity(_this[TableName], _this[PartitionKey], rowkey, function (error, result) {
                        if (error) rej(error);else {
                            res(AzureTableEntity.createEntityFromSource(result));
                        }
                    });
                });
            },
            writable: true,
            configurable: true
        },
        Update: {
            value: function Update(entity) {
                var _this = this;
                validateEntity(entity);

                return new Promise(function (res, rej) {
                    _this[StorageClient].updateEntity(_this[TableName], entity.toJS(), function (error, result) {
                        if (error) rej(error);else {
                            res(result);
                        }
                    });
                });
            },
            writable: true,
            configurable: true
        },
        Delete: {
            value: function Delete(entity) {
                var _this = this;
                validateEntity(entity);

                return new Promise(function (res, rej) {
                    _this[StorageClient].deleteEntity(_this[TableName], entity.toJS(), function (error, result) {
                        if (error) rej(error);else {
                            res(result);
                        }
                    });
                });
            },
            writable: true,
            configurable: true
        },
        Query: {
            value: function Query() {
                var _this = this;
                var query = arguments[0] === undefined ? new TableQuery() : arguments[0];
                return new Promise(function (res, rej) {
                    _this[StorageClient].queryEntities(_this[TableName], query, null, function (error, result, response) {
                        if (error) rej(error);else {
                            var entitys = result.entries.map(AzureTableEntity.createEntityFromSource);

                            res(entitys);
                        }
                    });
                });
            },
            writable: true,
            configurable: true
        },
        Batch: {
            value: function Batch(batch) {
                var _this = this;
                return new Promise(function (res, rej) {
                    _this[StorageClient].executeBatch(_this[TableName], batch, function (error, result, response) {
                        if (error) rej(error);else {
                            res(result);
                        }
                    });
                });
            },
            writable: true,
            configurable: true
        }
    });

    return AzureTableRepository;
})();

module.exports = AzureTableRepository;