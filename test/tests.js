var co = require('co');
var should = require('should');
var azure = require('azure-storage');
var uuid = require('node-uuid');
var nconf = require('nconf');
var Immutable = require('immutable');

var AzureTableApi = require('../dist/AzureTableApi');
var AzureTableRepository = AzureTableApi.AzureTableRepository;
var AzureTableEntity = AzureTableApi.AzureTableEntity;

var TestTable = "TEST";
var TestPartition = "TESTPARTITION";

// Test Helpers
var service;
var entityGen = azure.TableUtilities.entityGenerator;

function DeleteTable(done) {
	service.deleteTable(TestTable, function(error, response){
		done()
	});
}

describe('AzureTableRepository', function () {
	before(function () {
		service = azure.createTableService(azure.generateDevelopmentStorageCredendentials());
	});


	describe('when created', function () {
		afterEach(function (done) {
			DeleteTable(done);
		});

		it('should error when required arguments are\'t provided', function () {
			should.throws(function () {
				new AzureTableRepository
			}, "All four arguments are required");
		});

		it('should error is any argument is not a valid string', function () {
			should.throws(function () {
				new AzureTableRepository("a", 2, "3", "4");
			}, "All provided arguments must be strings which aren't empty");
		});

		it('should create the table if it doesn\'t exist', function (done) {
			new AzureTableRepository("empty", "empty", TestTable, TestPartition).Init().then(done);
		});
	});
});

//Make these unit tests

// co(function *() {
// 	var Repo = new AzureTableRepository("empty", "empty", TestTable, TestPartition)

// 	Repo.Init();
	
// 	var item = (new AzureTableEntity).set('name', 'test');

// 	// Stable
// 	try {
// 		console.log(item)
// 		yield Repo.Create(item);
// 	} catch(e) { console.log('Create failed!', e) }

// 	// Stable
// 	try {
// 		yield Repo.Retrieve(item.get('RowKey'));
// 	} catch(e) { console.log('Retrieve failed!', e) }

// 	// Stable
// 	try {
// 		var entity = yield Repo.Retrieve(item.get('RowKey'));
// 		var updatedEntity = entity.set('updated', 1234);

// 		yield Repo.Update(updatedEntity);
// 	} catch(e) { console.log('Update failed!', e) }

// 	// Stable
// 	try {
// 		var entity = yield Repo.Retrieve(item.get('RowKey'));

// 		yield Repo.Delete(entity);
// 	} catch(e) { console.log('Delete failed!', e) }

// 	// Stable
// 	try {
// 		yield Repo.Query(new azure.TableQuery().top(5));
// 	} catch(e) { console.log('Query failed!', e) }
// });