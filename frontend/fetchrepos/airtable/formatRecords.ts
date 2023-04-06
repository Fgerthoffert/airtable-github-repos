export const formatRecords = (fetchedRepos, existingRecords) => {
  const prepRepos = fetchedRepos.map((r) => {
    const recordExists = existingRecords.find(
      (er) => er.name === r.nameWithOwner
    );
    return {
      action: recordExists === undefined ? "CREATE" : "UPDATE",
      id: recordExists === undefined ? null : recordExists.id,
      record: {
        fields: {
          Repository: r.nameWithOwner,
          "Created At": r.createdAt,
          "Updated At": r.updatedAt,
          "Last pushed At": r.pushedAt,
          Org: r.owner.login,
          Name: r.name,
          "Default Branch":
            r.defaultBranchRef !== null ? r.defaultBranchRef.name : "",
          Description: r.description,
          URL: r.url,
          "Disk Usage": r.diskUsage,
          "Fork Count": r.forkCount,
          "Labels Count": r.labels.totalCount,
          "Milestones Count": r.milestones.totalCount,
          "Projects Count": r.projects.totalCount,
          "Releases Count": r.releases.totalCount,
          "Vulnerability Alerts Count": r.vulnerabilityAlerts.totalCount,
          Issues: r.issues.totalCount,
          "Open Issues": r.openIssues.totalCount,
          PRs: r.pullRequests.totalCount,
          "Open PRs": r.openPullRequests.totalCount,
          Watchers: r.watchers.totalCount,
          Stargazers: r.stargazers.totalCount,
          "Has Issues enabled": r.hasIssuesEnabled,
          "Has Projects enabled": r.hasProjectsEnabled,
          "Has Wiki enabled": r.hasWikiEnabled,
          "Is Archived": r.isArchived,
          "Is Fork": r.isFork,
          "Is Private": r.isPrivate,
          "Is Template": r.isTemplate,
          Topics: r.repositoryTopics.edges.map((t) => {
            return {
              name: t.node.topic.name,
            };
          }),
          "Branch Protection": r.branchProtectionRules.edges.map((bp) => {
            return {
              name: bp.node.pattern,
            };
          }),
          Languages: r.languages.edges.map((l) => {
            return {
              name: l.node.name,
            };
          }),
          "License SPDX": r.licenseInfo !== null ? r.licenseInfo.spdxId : "",
          "Code Of Conduct":
            r.codeOfConduct !== null ? r.codeOfConduct.name : "",
          "Primary Language":
            r.primaryLanguage !== null
              ? { name: r.primaryLanguage.name }
              : null,
        },
      },
    };
  });

  return prepRepos;
};
