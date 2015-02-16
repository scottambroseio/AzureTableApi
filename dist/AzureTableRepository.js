"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var azure = _interopRequire(require("azure-storage"));

var _ = _interopRequire(require("lodash"));

var AzureTableEntity = _interopRequire(require("./AzureTableEntity"));

var nconf = _interopRequire(require("nconf"));

nconf.env().file({ file: "config.json" });

function validateConstructorArgs(tableName, partitionKey) {
    if (arguments.length < 2) throw "All arguments are required";

    _.each(arguments, validateString);
}

function validateEntity(entity) {
    if (!(entity instanceof AzureTableEntity)) throw "The entity must be an instance of AzureTableEntity";
}

function validateString(string) {
    if (typeof string !== "string" || !string) throw "Invalid string";
}

var TABLE_NAME = Symbol();
var PARTITION_KEY = Symbol();
var STORAGE_CLIENT = Symbol();

var AzureTableRepository = (function () {
    function AzureTableRepository(tableName, partitionKey) {
        _classCallCheck(this, AzureTableRepository);

        validateConstructorArgs.apply(null, arguments);

        if (nconf.get("NODE_ENV") === "debug") {
            this[STORAGE_CLIENT] = azure.createTableService(azure.generateDevelopmentStorageCredendentials());
        } else {
            var accountName = nconf.get("STORAGE_NAME");
            var accountKey = nconf.get("STORAGE_KEY");

            validateString(accountName);
            validateString(accountKey);

            this[STORAGE_CLIENT] = azure.createTableService(accountName, accountKey);
        }

        this[TABLE_NAME] = tableName;
        this[PARTITION_KEY] = partitionKey;
    }

    _prototypeProperties(AzureTableRepository, null, {
        Init: {
            value: function Init() {
                var _this = this;
                return new Promise(function (res, rej) {
                    _this[STORAGE_CLIENT].createTableIfNotExists(_this[TABLE_NAME], function (error) {
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

                var updatedEntity = entity.set("PartitionKey", this[PARTITION_KEY]);

                return new Promise(function (res, rej) {
                    _this[STORAGE_CLIENT].insertEntity(_this[TABLE_NAME], updatedEntity.toJS(), function (error, result) {
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
                    _this[STORAGE_CLIENT].retrieveEntity(_this[TABLE_NAME], _this[PARTITION_KEY], rowkey, function (error, result) {
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
                    _this[STORAGE_CLIENT].updateEntity(_this[TABLE_NAME], entity.toJS(), function (error, result) {
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
                    _this[STORAGE_CLIENT].deleteEntity(_this[TABLE_NAME], entity.toJS(), function (error, result) {
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
                    _this[STORAGE_CLIENT].queryEntities(_this[TABLE_NAME], query, null, function (error, result, response) {
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
                    _this[STORAGE_CLIENT].executeBatch(_this[TABLE_NAME], batch, function (error, result, response) {
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