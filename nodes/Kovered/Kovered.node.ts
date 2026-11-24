import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

const API_BASE = 'https://www.kovered.ai/api/v1';
const CREDENTIAL = 'koveredApi';

export class Kovered implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Kovered',
		name: 'kovered',
		icon: { light: 'file:kovered.svg', dark: 'file:kovered.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Stock ticker mentions, hype scores, and history from Kovered',
		defaults: { name: 'Kovered' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: CREDENTIAL, required: true }],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Credits',
						value: 'getCredits',
						action: 'Get credit balance',
						description: 'Return account email and credits remaining',
					},
					{
						name: 'List Stocks',
						value: 'listStocks',
						action: 'List stocks',
						description: 'List tracked tickers',
					},
					{
						name: 'Get Stock',
						value: 'getStock',
						action: 'Get a stock',
						description: 'Latest StockTwits, Reddit, and hype for one ticker',
					},
					{
						name: 'Get Stock Hype',
						value: 'getStockHype',
						action: 'Get stock hype',
						description: 'Hype score and history for a ticker',
					},
					{
						name: 'Get Stock History',
						value: 'getStockHistory',
						action: 'Get stock history',
						description: 'Daily StockTwits history for a ticker',
					},
				],
				default: 'getStock',
			},
			{
				displayName: 'Symbol',
				name: 'symbol',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'AAPL',
				description: 'Ticker symbol',
				displayOptions: {
					show: { operation: ['getStock', 'getStockHype', 'getStockHistory'] },
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				let response: IDataObject;

				if (operation === 'getCredits') {
					response = await apiRequest.call(this, 'GET', '/me');
				} else if (operation === 'listStocks') {
					response = await apiRequest.call(this, 'GET', '/stocks');
				} else if (operation === 'getStock') {
					const symbol = (this.getNodeParameter('symbol', itemIndex) as string).trim().toUpperCase();
					response = await apiRequest.call(this, 'GET', `/stocks/${encodeURIComponent(symbol)}`);
				} else if (operation === 'getStockHype') {
					const symbol = (this.getNodeParameter('symbol', itemIndex) as string).trim().toUpperCase();
					response = await apiRequest.call(
						this,
						'GET',
						`/stocks/${encodeURIComponent(symbol)}/hype`,
					);
				} else if (operation === 'getStockHistory') {
					const symbol = (this.getNodeParameter('symbol', itemIndex) as string).trim().toUpperCase();
					response = await apiRequest.call(
						this,
						'GET',
						`/stocks/${encodeURIComponent(symbol)}/history`,
					);
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
						itemIndex,
					});
				}

				returnData.push({ json: response, pairedItem: { item: itemIndex } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				if ((error as { context?: unknown }).context) {
					(error as { context: { itemIndex: number } }).context.itemIndex = itemIndex;
					throw error;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
			}
		}

		return [returnData];
	}
}

async function apiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	path: string,
	qs: IDataObject = {},
): Promise<IDataObject> {
	try {
		return (await this.helpers.httpRequestWithAuthentication.call(this, CREDENTIAL, {
			method,
			url: `${API_BASE}${path}`,
			qs,
			json: true,
		})) as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
