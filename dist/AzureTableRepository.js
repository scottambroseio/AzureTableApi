"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var azure = _interopRequire(require("azure-storage"));

var _ = _interopRequire(require("lodash"));

var Immutable = _interopRequire(require("Immutable"));

var uuid = _interopRequire(require("node-uuid"));

var AzureTableEntity = _interopRequire(require("./AzureTableEntity"));

var nconf = _interopRequire(require("nconf"));

nconf.env().file({ file: "config.json" });

var accountName = nconf.get("STORAGE_NAME");
var accountKey = nconf.get("STORAGE_KEY");
var entGen = azure.TableUtilities.entityGenerator;

function validateConstructorArgs(tableName, partitionKey) {
    if (arguments.length < 2) throw "All arguments are required";

    // Check all are strings and have a body
    var result = _.every(arguments, function (element) {
        return typeof element === "string" && element;
    });

    if (!result) throw "All provided arguments must be strings which aren't empty";
}

function validateEntity(entity) {
    if (!(entity instanceof AzureTableEntity)) throw "the entity must be an instance of AzureTableEntity";
}

function validateRowKey(rowkey) {
    if (typeof rowkey !== "string" || !rowkey) throw "Invalid rowkey";
}

var AzureTableRepository = (function () {
    function AzureTableRepository(tableName, partitionKey) {
        _classCallCheck(this, AzureTableRepository);

        validateConstructorArgs.apply(null, arguments);

        if (process.env.NODE_ENV === "debug") {
            this.storageClient = azure.createTableService(azure.generateDevelopmentStorageCredendentials());
        } else {
            this.storageClient = azure.createTableService(accountName, accountKey);
        }

        this.tableName = tableName;
        this.partitionKey = partitionKey;
    }

    _prototypeProperties(AzureTableRepository, null, {
        Init: {
            value: function Init() {
                var _this = this;
                return new Promise(function (res, rej) {
                    _this.storageClient.createTableIfNotExists(_this.tableName, function (error) {
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

                var updatedEntity = entity.set("PartitionKey", this.partitionKey);

                return new Promise(function (res, rej) {
                    _this.storageClient.insertEntity(_this.tableName, updatedEntity.toJS(), function (error, result) {
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
                validateRowKey(rowkey);

                return new Promise(function (res, rej) {
                    _this.storageClient.retrieveEntity(_this.tableName, _this.partitionKey, rowkey, function (error, result) {
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
                    _this.storageClient.updateEntity(_this.tableName, entity.toJS(), function (error, result) {
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
                    _this.storageClient.deleteEntity(_this.tableName, entity.toJS(), function (error, result) {
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
            value: function Query(query) {
                var _this = this;
                return new Promise(function (res, rej) {
                    _this.storageClient.queryEntities(_this.tableName, query, null, function (error, result, response) {
                        if (error) rej(error);else {
                            var entitys = _.map(result.entries, function (source) {
                                return AzureTableEntity.createEntityFromSource(source);
                            });

                            res(entitys);
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