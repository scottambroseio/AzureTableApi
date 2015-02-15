import azure from 'azure-storage';
import _ from 'lodash';
import Immutable from 'Immutable';
import uuid from "node-uuid";

var entGen = azure.TableUtilities.entityGenerator;

var VALUE = Symbol();

export default class AzureTableEntity {
	constructor() {
		this[VALUE] = Immutable.OrderedMap({ RowKey: entGen.String(uuid()) });
	}

	get(key) {
		return this[VALUE].get(key)['_'];
	}

	set(key, value) {
		this[VALUE] = this[VALUE].set(key, getEdmValue(value));

		return this;
	}

	toJS() {
		return this[VALUE].toJS();
	}

	static createEntityFromSource(source) {
		var entity = new AzureTableEntity();

		entity[VALUE] = Immutable.OrderedMap(source);
		
		return entity;
	}
}

function getEdmValue(value) {
	if (_.isString(value)) return entGen.String(value);
	if (_.isNumber(value) && value % 1 === 0) return entGen.Int32(value);
	if (_.isNumber(value) && value % 1 !== 0) return entGen.Double(value);
	if (_.isBoolean(value)) return entGen.Boolean(value);
	if (_.isDate(value)) return entGen.DateTime(value);
	
	throw "The values data type isn't currently supported";
}