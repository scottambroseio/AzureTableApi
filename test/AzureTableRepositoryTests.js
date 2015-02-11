var co = require('co');
var should = require('should');
var AzureTableRepository = require('../dist/AzureTableApi').AzureTableRepository;
var azure = require('azure-storage');
var uuid = require('node-uuid');

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