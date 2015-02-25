import { TableUtilities } from 'azure-storage';
import { isString, isNumber, isBoolean, isDate } from 'lodash';
import Immutable from 'Immutable';
import uuid from "node-uuid";

const { entityGenerator: EntityGenerator } = TableUtilities;

const Value = Symbol();

export default class AzureTableEntity {
	constructor() {
		this[Value] = Immutable.OrderedMap({ RowKey: EntityGenerator.String(uuid()) });
	}

	get(key) {
		return this[Value].get(key)['_'];
	}

	set(key, value) {
		this[Value] = this[Value].set(key, getEdmValue(value));

		return this;
	}

	toJS() {
		return this[Value].toJS();
	}

	static createEntityFromSource(source) {
		const Entity = new AzureTableEntity();

		Entity[Value] = Immutable.OrderedMap(source);
		
		return Entity;
	}
}

function getEdmValue(value) {
	if (isString(value)) return EntityGenerator.String(value);
	if (isNumber(value) && value % 1 === 0) return EntityGenerator.Int32(value);
	if (isNumber(value) && value % 1 !== 0) return EntityGenerator.Double(value);
	if (isBoolean(value)) return EntityGenerator.Boolean(value);
	if (isDate(value)) return EntityGenerator.DateTime(value);
	
	throw "The values data type isn't currently supported";
}