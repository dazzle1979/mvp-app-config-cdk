import { AppConfigDataClient } from "@aws-sdk/client-appconfigdata";
import { Config } from "./config";

const client = new AppConfigDataClient({ region: "eu-west-1" });

const params = {
  ApplicationIdentifier: 'Test',
  EnvironmentIdentifier: 'sandbox',
  ConfigurationProfileIdentifier: 'AppConfigHosted',
  RequiredMinimumPollIntervalInSeconds: 60,
};

const ddbConfig = new Config(client, params);
const configPromise = ddbConfig.init()

exports.handler = async () => {
  await configPromise

  var parsedConfigData = await ddbConfig.getConfiguration()

  const response = {
    statusCode: 200,
    body: parsedConfigData,
  };
  return response;
};