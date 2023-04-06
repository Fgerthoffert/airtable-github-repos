import sleep from "./sleep";
import graphqlQuery from "./graphqlQuery";
import calculateQueryIncrement from "./calculateQueryIncrement";

export default class FetchNodesByQuery {
  githubToken: string;
  graphQLQuery: string;
  maxQueryIncrement: number;
  logger: any; // eslint-disable-line
  fetchedNodes: Array<any>; // eslint-disable-line
  error: any; // eslint-disable-line
  errorRetry: number;
  totalReposCount: number;
  orgReposCount: any; // eslint-disable-line
  getOrgs: any;
  getRepos: any;
  getUserRepos: any;
  setProgress: any;
  rateLimit: {
    limit: number;
    cost: number;
    remaining: number;
    resetAt: string | null;
  };

  constructor(
    githubToken: string,
    graphQLQuery: any,
    logger: object,
    ghIncrement: number,
    setProgress: any
  ) {
    this.githubToken = githubToken;
    this.graphQLQuery = graphQLQuery;
    this.logger = logger;
    this.maxQueryIncrement = ghIncrement;
    this.setProgress = setProgress;

    this.totalReposCount = 0;
    this.orgReposCount = {};
    this.errorRetry = 0;
    this.fetchedNodes = [];

    this.rateLimit = {
      limit: 5000,
      cost: 1,
      remaining: 5000,
      resetAt: null,
    };
  }

  public async load(queryParams: object) {
    this.fetchedNodes = [];
    await this.getNodesPagination(null, 5, queryParams);

    return this.fetchedNodes;
  }

  private async getNodesPagination(
    cursor: string | null,
    increment: number,
    queryParams: object
  ) {
    if (this.errorRetry <= 3) {
      let data: any = {}; // eslint-disable-line
      await sleep(1000); // Wait 1s between requests to avoid hitting GitHub API rate limit => https://developer.github.com/v3/guides/best-practices-for-integrators/
      const t0 = performance.now();
      try {
        data = await graphqlQuery(
          this.githubToken,
          this.graphQLQuery,
          {
            ...queryParams,
            cursor,
            increment,
          },
          this.rateLimit,
          this.logger
        );
      } catch (error) {
        this.logger.error(error);
      }
      const t1 = performance.now();
      const callDuration = t1 - t0;
      if (data !== undefined && data !== null) {
        this.errorRetry = 0;
        if (data.rateLimit !== undefined) {
          this.rateLimit = data.rateLimit;
        }
        const ghData = data.viewer !== undefined ? data.viewer : data.node;
        // ghData can be null if the repository has been deleted or access has been lost
        // In that case, there's no point in continuing to fetch.
        if (ghData !== null) {
          const lastCursor = await this.loadNodes(ghData, callDuration);
          const queryIncrement = calculateQueryIncrement(
            this.fetchedNodes.length,
            ghData.ghNode.totalCount,
            this.maxQueryIncrement
          );
          this.logger.debug(
            "Params: " +
              JSON.stringify(queryParams) +
              " -> Fetched Count / Remote Count / Query Increment: " +
              this.fetchedNodes.length +
              " / " +
              ghData.ghNode.totalCount +
              " / " +
              queryIncrement
          );
          this.setProgress({
            primary: {
              progress: 0.2,
              msg: `Retrieving the list of repositories for the organization`,
            },
            secondary: {
              progress: this.fetchedNodes.length / ghData.ghNode.totalCount,
              msg: `Identified ${this.fetchedNodes.length}/${ghData.ghNode.totalCount} repositories`,
            },
          });
          if (queryIncrement > 0 && lastCursor !== null) {
            await this.getNodesPagination(
              lastCursor,
              queryIncrement,
              queryParams
            );
          }
        }
      } else {
        this.errorRetry = this.errorRetry + 1;
        this.logger.error(
          "Error loading content, current count: " + this.errorRetry
        );
        await this.getNodesPagination(cursor, increment, queryParams);
      }
    } else {
      this.logger.error("Got too many load errors, stopping");
    }
  }

  private async loadNodes(
    ghData: any, // eslint-disable-line
    callDuration: number
  ) {
    const parentData = JSON.parse(JSON.stringify(ghData)); //TODO - Replace this with something better to copy object ?
    if (parentData.ghNode.edges !== undefined) {
      delete parentData.ghNode.edges;
    }
    let lastCursor = null;
    if (ghData.ghNode.edges.length > 0) {
      const apiPerf = Math.round(
        ghData.ghNode.edges.length / (callDuration / 1000)
      );
      this.logger.info(
        "Latest call contained " +
          ghData.ghNode.edges.length +
          " nodes, download rate: " +
          apiPerf +
          " nodes/s"
      );
    }
    for (const currentNode of ghData.ghNode.edges) {
      if (parentData !== null) {
        let nodeObj = JSON.parse(JSON.stringify(currentNode.node)); //TODO - Replace this with something better to copy object ?
        nodeObj = { ...nodeObj, _parent: parentData };
        // Special treatment for stargazers since data is attached under edges
        if (currentNode.starredAt !== undefined) {
          nodeObj = {
            ...nodeObj,
            starredAt: currentNode.starredAt,
          };
        }

        this.fetchedNodes.push(nodeObj);
      }

      lastCursor = currentNode.cursor;
    }
    return lastCursor;
  }
}
