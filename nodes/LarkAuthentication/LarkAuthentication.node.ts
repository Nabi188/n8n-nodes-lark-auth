import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeApiError,
	NodeConnectionType,
} from 'n8n-workflow';

export class LarkAuthentication implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Lark Authentication',
    name: 'larkAuthentication',
    group: ['transform'],
    version: 1,
    description: 'Get tenant access token from Lark API',
		icon: 'file:Lark.svg',
    defaults: {
      name: 'Lark Authentication',
    },
    inputs: ['main'],
    outputs: ['main'],
		credentials: [],
    properties: [
      {
        displayName: 'App ID',
        name: 'app_id',
        type: 'string',
        default: '',
        placeholder: 'Enter your App ID',
        description: 'The App ID for authentication',
      },
      {
        displayName: 'App Secret',
        name: 'app_secret',
        type: 'string',
        default: '',
        placeholder: 'Enter your App Secret',
        description: 'The App Secret for authentication',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        // Get parameters
        const appId = this.getNodeParameter('app_id', itemIndex, '') as string;
        const appSecret = this.getNodeParameter('app_secret', itemIndex, '') as string;

        // Prepare request payload
        const body = {
          app_id: appId,
          app_secret: appSecret,
        };

        // Make HTTP POST request to Lark API
        const response = await this.helpers.httpRequest({
          method: 'POST',
          url: 'https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal',
          body,
          json: true, // Automatically stringifies and parses JSON
        });

        // Append response to the item
        items[itemIndex].json = response;
      } catch (error) {
        // Handle errors gracefully
        if (this.continueOnFail()) {
          items[itemIndex].json = { error: (error as Error).message };
        } else {
          throw new NodeApiError(this.getNode(), error, { itemIndex });
        }
      }
    }

    return [items];
  }
}
