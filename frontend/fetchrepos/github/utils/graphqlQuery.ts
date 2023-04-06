import { graphql } from "@octokit/graphql";

import sleep from "./sleep";

const graphqlQuery = async (
  githubToken,
  query,
  variables,
  rateLimit,
  logger
) => {
  if (rateLimit.remaining - rateLimit.cost < 50 && rateLimit.resetAt !== null) {
    logger.info(
      "Reached query rate limit, will resuming querying after " +
        rateLimit.resetAt
    );
    const sleepDuration =
      (new Date(rateLimit.resetAt).getTime() - new Date().getTime()) / 1000;
    logger.info("Will resume querying in: " + sleepDuration + "s");
    await sleep(sleepDuration + 10000);
    logger.info("Ready to resume querying");
  }
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${githubToken}`,
    },
  });

  let data;

  try {
    data = await graphqlWithAuth(query, variables);
  } catch (error) {
    logger.info(error);
  }

  if (
    data !== undefined &&
    data.errors !== undefined &&
    data.errors.length > 0
  ) {
    data.errors.forEach((error: { message: string }) => {
      logger.info(error.message);
    });
  }
  if (data !== undefined && data.rateLimit !== undefined) {
    logger.info(
      "GitHub Tokens - remaining: " +
        data.rateLimit.remaining +
        " query cost: " +
        data.rateLimit.cost +
        " (token will reset at: " +
        data.rateLimit.resetAt +
        ")"
    );
  }

  return data;
};

export default graphqlQuery;
