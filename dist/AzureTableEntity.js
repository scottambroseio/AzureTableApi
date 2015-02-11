"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var azure = _interopRequire(require("azure-storage"));

var _ = _interopRequire(require("lodash"));

var Immutable = _interopRequire(require("Immutable"));

var uuid = _interopRequire(require("node-uuid"));

var entGen = azure.TableUtilities.entityGenerator;

var AzureTableEntity = (function () {
	function AzureTableEntity() {
		_classCallCheck(this, AzureTableEntity);

		this.value = Immutable.OrderedMap({ RowKey: entGen.String(uuid()) });
	}

	_prototypeProperties(AzureTableEntity, {
		createEntityFromSource: {
			value: function createEntityFromSource(source) {
				var entity = new AzureTableEntity();

				entity.value = Immutable.OrderedMap(source);

				return entity;
			},
			writable: true,
			configurable: true
		}
	}, {
		get: {
			value: function get(key) {
				return this.value.get(key)._;
			},
			writable: true,
			configurable: true
		},
		set: {
			value: function set(key, value) {
				this.value = this.value.set(key, getEdmValue(value));

				return this;
			},
			writable: true,
			configurable: true
		},
		toJS: {
			value: function toJS() {
				return this.value.toJS();
			},
			writable: true,
			configurable: true
		}
	});

	return AzureTableEntity;
})();

module.exports = AzureTableEntity;



function getEdmValue(value) {
	if (_.isString(value)) return entGen.String(value);
	if (_.isNumber(value)) return entGen.Int32(value);
	if (_.isBoolean(value)) return entGen.Boolean(value);
	if (_.isDate(value)) return entGen.DateTime(value);

	throw "The values data type isn't currently supported";
}