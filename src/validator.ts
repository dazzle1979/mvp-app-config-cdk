import { DynamoDBClient, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

interface IAppConfigEvent {
    applicationId: string, 
    configurationProfileId: string,
    configurationVersion: string,
    content: string, 
    uri: string    
}

exports.handler = async (event: IAppConfigEvent) => {
    const input = Buffer.from(event.content, 'base64').toString('binary')
    const parsedConfig = JSON.parse(input)

    const tableInfoPromises = Object.keys(parsedConfig.DDB_EXECUTION_PLANS).map((tbl:string) => {
        const client = new DynamoDBClient({region: process.env.AWS_REGION});
        const command = new DescribeTableCommand({TableName:  parsedConfig.DDB_EXECUTION_PLANS[tbl]})
        return client.send(command)
    })
    const result = await Promise.all(tableInfoPromises)
}