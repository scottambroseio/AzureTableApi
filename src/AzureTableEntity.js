import { TableUtilities } from 'azure-storage';
import { isString, isNumber, isBoolean, isDate } from 'lodash';
import Immutable from 'Immutable';
import uuid from "node-uuid";

const { entityGenerator: ENTITY_GENERATOR } = TableUtilities;

const VALUE = Symbol();

export default class AzureTableEntity {
	constructor() {
		this[VALUE] = Immutable.OrderedMap({ RowKey: ENTITY_GENERATOR.String(uuid()) });
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
		const ENTITY = new AzureTableEntity();

		ENTITY[VALUE] = Immutable.OrderedMap(source);
		
		return ENTITY;
	}
}

function getEdmValue(value) {
	if (isString(value)) return ENTITY_GENERATOR.String(value);
	if (isNumber(value) && value % 1 === 0) return ENTITY_GENERATOR.Int32(value);
	if (isNumber(value) && value % 1 !== 0) return ENTITY_GENERATOR.Double(value);
	if (isBoolean(value)) return ENTITY_GENERATOR.Boolean(value);
	if (isDate(value)) return ENTITY_GENERATOR.DateTime(value);
	
	throw "The values data type isn't currently supported";
}