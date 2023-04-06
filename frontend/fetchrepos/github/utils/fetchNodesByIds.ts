import graphqlQuery from "./graphqlQuery";
import sleep from "./sleep";

export default class FetchNodesByIds {
  maxQueryIncrement: number;
  logger: any;
  errorRetry: number;
  graphqlQuery: string;
  rateLimit: {
    limit: number;
    cost: number;
    remaining: number;
    resetAt: string | null;
  };
  githubToken: string;

  constructor(
    githubToken: string,
    graphqlQuery: string,
    logger: any,
    ghIncrement: number
  ) {
    this.githubToken = githubToken;
    this.maxQueryIncrement = ghIncrement;

    this.logger = logger;
    this.errorRetry = 0;
    this.graphqlQuery = graphqlQuery;

    this.rateLimit = {
      limit: 5000,
      cost: 1,
      remaining: 5000,
      resetAt: null,
    };
  }
  // eslint-disable-next-line
  public async load(loadRepos: Array<any>) {
    // If above error rate, skip to the end
    if (this.errorRetry > 3) {
      return [];
    }
    this.logger.info("Fetching data for: " + loadRepos.length + " repos");
    const t0 = performance.now();

    let success = false;
    let data = {};
    while (success === false && this.errorRetry <= 3) {
      try {
        data = await graphqlQuery(
          this.githubToken,
          this.graphqlQuery,
          { nodesArray: loadRepos.map((r: any) => r.id) }, // eslint-disable-line
          this.rateLimit,
          this.logger
        );
      } catch (error) {
        this.logger.error(error);
      }
      if (data !== undefined && data !== null && data.nodes.length > 0) {
        this.errorRetry = 0;
        success = true;
      } else {
        this.logger.error(
          `Unable to fetch data from GitHub, will retry. Error count: ${this.errorRetry} / 3 for current query.`
        );
        this.errorRetry++;
      }
    }

    const t1 = performance.now();
    const callDuration = t1 - t0;

    // Sleep for 1s to avoid hitting GitHub API rate throttling
    await sleep(1000);

    if (data === undefined) {
      return [];
    }

    if (data.nodes !== undefined && data.nodes.length > 0) {
      const apiPerf = Math.round(data.nodes.length / (callDuration / 1000));
      if (this.errorRetry > 0) {
        this.logger.warn(
          `Recovered from failure and fetched data at: ${apiPerf} nodes/s`
        );
      } else {
        this.logger.info(`Fetched data at: ${apiPerf} nodes/s`);
      }
      return data.nodes;
    } else {
      this.logger.error(
        `ERROR: Unable to load data about ${loadRepos.length} repos, this could be related to permissions`
      );
    }
    return [];
  }
}
