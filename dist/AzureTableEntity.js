"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var TableUtilities = require("azure-storage").TableUtilities;
var _lodash = require("lodash");

var isString = _lodash.isString;
var isNumber = _lodash.isNumber;
var isBoolean = _lodash.isBoolean;
var isDate = _lodash.isDate;
var Immutable = _interopRequire(require("Immutable"));

var uuid = _interopRequire(require("node-uuid"));

var EntityGenerator = TableUtilities.entityGenerator;


var Value = Symbol();

var AzureTableEntity = (function () {
	function AzureTableEntity() {
		_classCallCheck(this, AzureTableEntity);

		this[Value] = Immutable.OrderedMap({ RowKey: EntityGenerator.String(uuid()) });
	}

	_prototypeProperties(AzureTableEntity, {
		createEntityFromSource: {
			value: function createEntityFromSource(source) {
				var Entity = new AzureTableEntity();

				Entity[Value] = Immutable.OrderedMap(source);

				return Entity;
			},
			writable: true,
			configurable: true
		}
	}, {
		get: {
			value: function get(key) {
				return this[Value].get(key)._;
			},
			writable: true,
			configurable: true
		},
		set: {
			value: function set(key, value) {
				this[Value] = this[Value].set(key, getEdmValue(value));

				return this;
			},
			writable: true,
			configurable: true
		},
		toJS: {
			value: function toJS() {
				return this[Value].toJS();
			},
			writable: true,
			configurable: true
		}
	});

	return AzureTableEntity;
})();

module.exports = AzureTableEntity;


function getEdmValue(value) {
	if (isString(value)) {
		return EntityGenerator.String(value);
	}if (isNumber(value) && value % 1 === 0) {
		return EntityGenerator.Int32(value);
	}if (isNumber(value) && value % 1 !== 0) {
		return EntityGenerator.Double(value);
	}if (isBoolean(value)) {
		return EntityGenerator.Boolean(value);
	}if (isDate(value)) {
		return EntityGenerator.DateTime(value);
	}throw "The values data type isn't currently supported";
}