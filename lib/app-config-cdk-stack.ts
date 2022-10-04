import { Stack, StackProps } from 'aws-cdk-lib';
import { Policy, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Architecture, FunctionUrlAuthType, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

const random = `${new Date().getTime()}`

export class AppConfigCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    
    const layer = LayerVersion.fromLayerVersionArn(this,'appConfigLayer','arn:aws:lambda:eu-west-1:434848589818:layer:AWS-AppConfig-Extension-Arm64:20')

    const appConfigFunction = new NodejsFunction(this, 'appConfigExtensionFunction', {
      functionName: 'appConfigExtensionFunction',
      entry: './src/app-config.ts',
      handler: 'handler',
      architecture: Architecture.ARM_64,
      memorySize: 1024,
      layers: [
        layer
      ],
      environment: {
        'AWS_APPCONFIG_EXTENSION_PREFETCH_LIST': '/applications/Test/environments/sandbox/configurations/AppConfigHosted',
        'AWS_APPCONFIG_EXTENSION_POLL_INTERVAL_SECONDS': '60',
        'AWS_APPCONFIG_EXTENSION_LOG_LEVEL': 'info',
        //'RANDOM': random,
      },
      
    })
    appConfigFunction.addFunctionUrl({authType: FunctionUrlAuthType.NONE});

    const appConfigSdkFunction = new NodejsFunction(this, 'appConfigSdkFunction', {
      functionName: 'appConfigSdkFunction',
      entry: './src/app-config-sdk.ts',
      handler: 'handler',
      architecture: Architecture.ARM_64,
      memorySize: 1024,
      environment: {
        'AWS_APPCONFIG_POLL_INTERVAL_SECONDS': '60',
        //'RANDOM': random,
      },
      // bundling: {
      //   target: 'es2020',
      //   format: OutputFormat.ESM
      // }
    })
    appConfigSdkFunction.addFunctionUrl({authType: FunctionUrlAuthType.NONE});

    // Add appconfig permissions
    const appConfigPolicyStatement = new PolicyStatement({
      actions: [
        'appconfig:StartConfigurationSession',
        'appconfig:GetLatestConfiguration',
        'appconfig:GetConfiguration',
      ],
      resources: ['*'],
    })
    appConfigFunction.role?.attachInlinePolicy(
      new Policy(this, 'incoming-appconfig-policy', {
        statements: [appConfigPolicyStatement],
      }),
    )
    appConfigSdkFunction.role?.attachInlinePolicy(
      new Policy(this, 'incoming-appconfig-sdk-policy', {
        statements: [appConfigPolicyStatement],
      }),
    )

    const inlineConfigFunction = new NodejsFunction(this, 'appConfigInlineFunction', {
      functionName: 'appConfigInlineFunction',
      entry: './src/inline-config.ts',
      handler: 'handler',
      architecture: Architecture.ARM_64,
      memorySize: 1024,
    }).addFunctionUrl({authType: FunctionUrlAuthType.NONE});

    const currentConfigFunction = new NodejsFunction(this, 'appConfigCurrentFunction', {
      functionName: 'appConfigCurrentFunction',
      entry: './src/current-config.ts',
      handler: 'handler',
      architecture: Architecture.ARM_64,
      memorySize: 1024,
      environment: {
        'TABLE_NAME': 'emp-bas-table',
        'ALT_TABLE_NAME': 'emp-bas-alt-table',
        //'RANDOM': random,
      },
    }).addFunctionUrl({authType: FunctionUrlAuthType.NONE});

    const validatorFunction = new NodejsFunction(this, 'validatorFunction', {
      functionName: 'validatorFunction',
      entry: './src/validator.ts',
      handler: 'handler',
      architecture: Architecture.ARM_64,
      memorySize: 1024,
    })
    
    const appConfigPrincipal = new ServicePrincipal('appconfig.amazonaws.com')
    validatorFunction.grantInvoke(appConfigPrincipal)
    const dynamoDBStatement = new PolicyStatement({
      actions: [
        'dynamodb:DescribeTable',
      ],
      resources: ['*'],
    })
    validatorFunction.role?.attachInlinePolicy(
      new Policy(this, 'describe-ddb-policy', {
        statements: [dynamoDBStatement],
      }),
    )
  }
}
