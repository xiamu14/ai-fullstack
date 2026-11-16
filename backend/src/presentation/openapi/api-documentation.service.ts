import { experimental_ArkTypeToJsonSchemaConverter as ArkTypeToJsonSchemaConverter } from '@orpc/arktype';
import { OpenAPIGenerator } from '@orpc/openapi';
import { apiContract } from '../../contracts/v1/api.contract.js';

export class ApiDocumentationService {
  private readonly generator = new OpenAPIGenerator({
    schemaConverters: [new ArkTypeToJsonSchemaConverter()],
  });
  private specification?: ReturnType<OpenAPIGenerator['generate']>;

  constructor(
    private readonly options: { prefix: string; sessionCookieName: string },
  ) {}

  getSpecification() {
    return (this.specification ??= this.generator.generate(apiContract, {
      info: { title: 'Backend RPC API', version: '1.0.0' },
      servers: [{ url: this.options.prefix }],
      components: {
        securitySchemes: {
          sessionCookie: {
            type: 'apiKey',
            in: 'cookie',
            name: this.options.sessionCookieName,
            description:
              '通过 Better Auth 登录后由浏览器自动携带会话 Cookie。',
          },
        },
      },
    }));
  }
}
