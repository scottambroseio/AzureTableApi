interface AzureTableEntity_Instance {
	get(key: string): any;
	set(key: string, value: any): AzureTableEntity_Instance;
	toJS(): Object;
}

interface AzureTableEntity_Static {
	new(): AzureTableEntity_Instance;
	createEntityFromSource(source: Object): AzureTableEntity_Instance;
}