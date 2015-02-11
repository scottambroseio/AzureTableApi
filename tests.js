var AzureTableApi = require('./dist/AzureTableApi')
var AzureTableRepository = AzureTableApi.AzureTableRepository;
var AzureTableEntity = AzureTableApi.AzureTableEntity;

var azure = require('azure-storage');
var co = require('co');
var nconf = require('nconf');
var azure = require('azure-storage');
var Immutable = require('immutable');
var uuid = require('node-uuid');

var entityGen = azure.TableUtilities.entityGenerator;

co(function *() {
	nconf.env().file({ file: 'config.json'});

	var TestTable = "TEST";
	var TestPartition = "TESTPARTITION";

	var accountName = nconf.get("STORAGE_NAME");
	var accountKey = nconf.get("STORAGE_KEY");

	var Repo = new AzureTableRepository(
		accountName,
		accountKey,
		TestTable,
		TestPartition
	);

	yield Repo.Init();
	
	var item = (new AzureTableEntity).set('name', 'test');

	// Stable
	try {
		yield Repo.Create(item);
	} catch(e) { console.log('Create failed!', e) }

	// Stable
	try {
		yield Repo.Retrieve(item.get('RowKey'));
	} catch(e) { console.log('Retrieve failed!', e) }

	// Stable
	try {
		var entity = yield Repo.Retrieve(item.get('RowKey'));
		var updatedEntity = entity.set('updated', 1234);

		yield Repo.Update(updatedEntity);
	} catch(e) { console.log('Update failed!', e) }

	// Stable
	try {
		var entity = yield Repo.Retrieve(item.get('RowKey'));

		yield Repo.Delete(entity);
	} catch(e) { console.log('Delete failed!', e) }

	// Stable
	try {
		yield Repo.Query(new azure.TableQuery().top(5));
	} catch(e) { console.log('Query failed!', e) }


	// try {
	// 	var key = item.get('RowKey');

	// 	var test = yield Repo.UpdateByRowKey(key, Immutable.OrderedMap({ prop: "helloworld" }));
	// 	console.log(test)
	// } catch(e) { console.log('UpdateByRowKey failed!', e) }

	// // Stable
	// try {
	// 	yield Repo.Create(item);

	// 	yield Repo.DeleteByRowKey(item.get('RowKey'));
	// } catch(e) { console.log('DeleteByRowKey failed!', e) }
});