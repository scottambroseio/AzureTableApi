import { TableUtilities } from 'azure-storage';
import { isString, isNumber, isBoolean, isDate } from 'lodash';
import Immutable from 'Immutable';
import uuid from "node-uuid";

let { entityGenerator } = TableUtilities;

let VALUE = Symbol();

export default class AzureTableEntity {
	constructor() {
		this[VALUE] = Immutable.OrderedMap({ RowKey: entityGenerator.String(uuid()) });
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
		let entity = new AzureTableEntity();

		entity[VALUE] = Immutable.OrderedMap(source);
		
		return entity;
	}
}

function getEdmValue(value) {
	if (isString(value)) return entityGenerator.String(value);
	if (isNumber(value) && value % 1 === 0) return entityGenerator.Int32(value);
	if (isNumber(value) && value % 1 !== 0) return entityGenerator.Double(value);
	if (isBoolean(value)) return entityGenerator.Boolean(value);
	if (isDate(value)) return entityGenerator.DateTime(value);
	
	throw "The values data type isn't currently supported";
}