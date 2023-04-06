export default `
  query($nodesArray: [ID!]!) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    nodes(ids: $nodesArray) {
      ... on Repository {
        branchProtectionRules(first: 5) {
          totalCount
          edges {
            node {
              pattern
            }
          }
        }
        codeOfConduct {
          name
        }
        createdAt
        defaultBranchRef {
          name
        }
        description
        diskUsage
        forkCount
        hasIssuesEnabled
        hasProjectsEnabled
        hasWikiEnabled
        isArchived
        isFork
        isPrivate
        isTemplate    
        labels(first: 1) {
          totalCount
        }
        languages(first: 10) {
          totalCount
          edges {
            node {
              name
            }
          }
        }
        licenseInfo {
          spdxId
        }
        milestones(first: 1) {
          totalCount
        }
        name
        nameWithOwner
        owner {
          login
        }
        projects(first: 1) {
          totalCount
        }
        primaryLanguage {
          name
        }
        issues(first: 1, orderBy: { field: UPDATED_AT, direction: DESC }) {
          totalCount
        }
        openIssues: issues(first: 1, states: [OPEN] orderBy: { field: UPDATED_AT, direction: DESC }) {
          totalCount
        }        
        pullRequests(first: 1, orderBy: { field: UPDATED_AT, direction: DESC }) {
          totalCount
        }
        openPullRequests: pullRequests(first: 1, states: [OPEN] orderBy: { field: UPDATED_AT, direction: DESC }) {
          totalCount
        }      
        pushedAt
        releases(first: 1) {
          totalCount
        }
        repositoryTopics(first: 10) {
          totalCount
          edges {
            node {
              topic {
                name
              }
            }
          }
        }
        stargazers(first: 1) {
          totalCount
        }
        url
        updatedAt
        vulnerabilityAlerts(first: 1) {
          totalCount
        }
        watchers(first: 1) {
          totalCount
        }
      }
    }
  }
`;
