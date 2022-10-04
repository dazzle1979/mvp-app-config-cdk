import { AppConfigDataClient, GetLatestConfigurationCommand, StartConfigurationSessionCommand, StartConfigurationSessionCommandInput, StartConfigurationSessionCommandOutput } from "@aws-sdk/client-appconfigdata";
import { TextDecoder } from "util";

const textDecoder = new TextDecoder()

export class Config {
    private client: AppConfigDataClient;
    private params: StartConfigurationSessionCommandInput;
    private config?: any;
    private configToken?: string;
    private lastRefresh?: number

    constructor(client:AppConfigDataClient, params:any) {
        this.client = client
        this.params = params
    }
  
    async init(): Promise<void> {
        const command = new StartConfigurationSessionCommand(this.params);
        const result = await this.client.send(command)
        if (result.InitialConfigurationToken) {
            this.configToken = result.InitialConfigurationToken ?? 'unknown'
        } else {
        }
        this.config = await this.getConfiguration()
    }

    async getConfiguration(): Promise<void> {
        //Do we need to refresh
        if (!this.lastRefresh || (new Date().getTime() - this.lastRefresh) > this.refreshConfig()) {
          const tick = new Date().getTime();
          const command = new GetLatestConfigurationCommand({
            ConfigurationToken: this.configToken
          });
          const result = await this.client.send(command)
          if (result.NextPollConfigurationToken) {
            this.configToken = result.NextPollConfigurationToken
          }
          this.lastRefresh = new Date().getTime();
          console.warn(`Retrieved config in ${new Date().getTime()-tick}ms`)
          if (result.Configuration?.byteLength) {
            let ConfigString = textDecoder.decode(result.Configuration)
            this.config = JSON.parse(textDecoder.decode(result.Configuration))
          }
        }
        return this.config
    }

    refreshConfig() {
        let interval = parseInt(process.env.AWS_APPCONFIG_POLL_INTERVAL_SECONDS ?? '45')
        return interval * 1000
    }
}