interface AzureTableRepository_Instance {
	Init(): Promise;
	Create(entity): Promise;
	Retrieve(rowkey: string): Promise;
	Update(entity): Promise;
	Delete(entity): Promise;
	Query(query): Promise;
}

interface AzureTableRepository_Static {
	new(tableName: string, partitionKey: string): AzureTableRepository_Instance;
}

declare var AzureTableRepository: AzureTableRepository_Static;