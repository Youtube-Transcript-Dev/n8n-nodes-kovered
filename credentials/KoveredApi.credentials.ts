import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class KoveredApi implements ICredentialType {
	name = 'koveredApi';

	displayName = 'Kovered API';

	icon: Icon = {
		light: 'file:../nodes/Kovered/kovered.svg',
		dark: 'file:../nodes/Kovered/kovered.dark.svg',
	};

	documentationUrl = 'https://www.kovered.ai/pricing#mcp';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Create a key at https://www.kovered.ai/account (starts with mm_live_)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://www.kovered.ai/api/v1',
			url: '/me',
			method: 'GET',
		},
	};
}
