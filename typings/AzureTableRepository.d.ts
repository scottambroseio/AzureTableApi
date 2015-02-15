/// <reference path="AzureTableEntity.d.ts" />

interface AzureTableRepository_Instance {
	Init(): Promise;
	Create(entity: AzureTableEntity_Instance): Promise;
	Retrieve(rowkey: string): Promise;
	Update(entity: AzureTableEntity_Instance): Promise;
	Delete(entity: AzureTableEntity_Instance): Promise;
	Query(query): Promise;
}

interface AzureTableRepository_Static {
	new(tableName: string, partitionKey: string): AzureTableRepository_Instance;
}