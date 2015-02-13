/// <reference path="AzureTableRepository.d.ts" />
/// <reference path="AzureTableEntity.d.ts" />

declare module "AzureTableApi" {
	export var AzureTableRepository: AzureTableEntity_Repository;
	export var AzureTableEntity: AzureTableEntity_Static;
}