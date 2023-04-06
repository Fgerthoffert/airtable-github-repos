import { useGlobalConfig } from "@airtable/blocks/ui";
export const GITHUB_USER_TOKEN = "githubUserToken";
export const GITHUB_ORGANISATION = "githubOrg";
export const GITHUB_MAXNODES_ORG = "githubMaxNodesOrg";
export const GITHUB_MAXNODES_REPOS = "githubMaxNodesRepos";
export const AIRTABLE_TABLENAME = "airtableTableName";

export function useSettings() {
  const globalConfig = useGlobalConfig();

  const githubUserToken = globalConfig.get(GITHUB_USER_TOKEN) as string;
  const githubOrg = globalConfig.get(GITHUB_ORGANISATION) as string;
  const githubMaxNodesOrg = globalConfig.get(GITHUB_MAXNODES_ORG) as string;
  const githubMaxNodesRepos = globalConfig.get(GITHUB_MAXNODES_REPOS) as string;
  const airtableTableName = globalConfig.get(AIRTABLE_TABLENAME) as string;

  const settings = {
    githubUserToken,
    githubOrg,
    airtableTableName,
  };

  if (!githubUserToken || githubUserToken === "") {
    return {
      isValid: false,
      message: "Enter an API Token to use with GitHub GraphQL API",
      settings,
    };
  }

  if (!githubOrg || githubOrg === "") {
    return {
      isValid: false,
      message: "Enter the name of an Org to fetch repositories",
      settings,
    };
  }

  if (!githubMaxNodesOrg || githubMaxNodesOrg === "") {
    return {
      isValid: false,
      message:
        "Enter the number of repos to fetch at once when retrieving the initial list",
      settings,
    };
  }

  if (!githubMaxNodesRepos || githubMaxNodesRepos === "") {
    return {
      isValid: false,
      message:
        "Enter the number of repos to fetch at once when retrieving the full metadata",
      settings,
    };
  }

  if (!airtableTableName || airtableTableName === "") {
    return {
      isValid: false,
      message:
        "Enter the name of an Airtable Table to use for importing repositories metadata",
      settings,
    };
  }

  return {
    isValid: true,
    settings,
  };
}
