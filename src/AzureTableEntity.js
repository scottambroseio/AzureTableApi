import azure from 'azure-storage';
import _ from 'lodash';
import Immutable from 'Immutable';
import uuid from "node-uuid";

var entGen = azure.TableUtilities.entityGenerator;

export default class AzureTableEntity {
	constructor() {
		this.value = Immutable.OrderedMap({ RowKey: entGen.String(uuid()) });
	}

	get(key) {
		return this.value.get(key)['_'];
	}

	set(key, value) {
		this.value = this.value.set(key, getEdmValue(value));

		return this;
	}

	toJS() {
		return this.value.toJS();
	}

	static createEntityFromSource(source) {
		var entity = new AzureTableEntity();

		entity.value = Immutable.OrderedMap(source);
		
		return entity;
	}
}


function getEdmValue(value) {
	if (_.isString(value)) return entGen.String(value);
	if (_.isNumber(value)) return entGen.Int32(value);
	if (_.isBoolean(value)) return entGen.Boolean(value);
	if (_.isDate(value)) return entGen.DateTime(value);
	
	throw "The values data type isn't currently supported";
}