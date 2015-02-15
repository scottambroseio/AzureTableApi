interface AzureTableEntity_Instance {
	get<T>(key): T;
	set(key, value): AzureTableEntity_Instance;
	toJS(): Object;
}

interface AzureTableEntity_Static {
	new(): AzureTableEntity_Instance;
	createEntityFromSource(source): AzureTableEntity_Instance;
}

declare var AzureTableEntity: AzureTableEntity_Static;