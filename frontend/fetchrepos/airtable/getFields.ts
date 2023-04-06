import { FieldType } from "@airtable/blocks/models";

export const getFields = (fetchedRepos) => {
  const fields = [
    {
      name: "Repository",
      isPrimaryField: true,
      type: FieldType.SINGLE_LINE_TEXT,
    },
    {
      name: "Topics",
      type: FieldType.MULTIPLE_SELECTS,
      options: {
        // Go through all of the topics and build a unique list
        choices: fetchedRepos.reduce((acc, repo) => {
          for (const topic of repo.repositoryTopics.edges) {
            if (
              acc.find((t) => t.name === topic.node.topic.name) === undefined
            ) {
              acc.push({
                name: topic.node.topic.name,
              });
            }
          }
          return acc;
        }, []),
      },
    },
    { name: "Description", type: FieldType.SINGLE_LINE_TEXT },
    { name: "URL", type: FieldType.URL },
    {
      name: "Created At",
      type: FieldType.DATE,
      options: {
        dateFormat: { name: "iso", format: "YYYY-MM-DD" },
      },
    },
    {
      name: "Updated At",
      type: FieldType.DATE,
      options: {
        dateFormat: { name: "iso", format: "YYYY-MM-DD" },
      },
    },
    {
      name: "Last pushed At",
      type: FieldType.DATE,
      options: {
        dateFormat: { name: "iso", format: "YYYY-MM-DD" },
      },
    },
    { name: "Default Branch", type: FieldType.SINGLE_LINE_TEXT },
    { name: "License SPDX", type: FieldType.SINGLE_LINE_TEXT },
    { name: "Code Of Conduct", type: FieldType.SINGLE_LINE_TEXT },
    {
      name: "Disk Usage",
      type: FieldType.NUMBER,
      options: { precision: 0 },
    },
    {
      name: "Fork Count",
      type: FieldType.NUMBER,
      options: { precision: 0 },
    },
    {
      name: "Releases Count",
      type: FieldType.NUMBER,
      options: { precision: 0 },
    },
    {
      name: "Vulnerability Alerts Count",
      type: FieldType.NUMBER,
      options: { precision: 0 },
    },
    {
      name: "Labels Count",
      type: FieldType.NUMBER,
      options: { precision: 0 },
    },
    {
      name: "Milestones Count",
      type: FieldType.NUMBER,
      options: { precision: 0 },
    },
    {
      name: "Projects Count",
      type: FieldType.NUMBER,
      options: { precision: 0 },
    },
    {
      name: "Issues",
      type: FieldType.NUMBER,
      options: { precision: 0 },
    },
    {
      name: "Open Issues",
      type: FieldType.NUMBER,
      options: { precision: 0 },
    },
    {
      name: "PRs",
      type: FieldType.NUMBER,
      options: { precision: 0 },
    },
    {
      name: "Open PRs",
      type: FieldType.NUMBER,
      options: { precision: 0 },
    },
    {
      name: "Watchers",
      type: FieldType.NUMBER,
      options: { precision: 0 },
    },
    {
      name: "Stargazers",
      type: FieldType.NUMBER,
      options: { precision: 0 },
    },
    {
      name: "Has Issues enabled",
      type: FieldType.CHECKBOX,
      options: { icon: "check", color: "blueBright" },
    },
    {
      name: "Has Projects enabled",
      type: FieldType.CHECKBOX,
      options: { icon: "check", color: "blueBright" },
    },
    {
      name: "Has Wiki enabled",
      type: FieldType.CHECKBOX,
      options: { icon: "check", color: "blueBright" },
    },
    {
      name: "Is Archived",
      type: FieldType.CHECKBOX,
      options: { icon: "check", color: "blueBright" },
    },
    {
      name: "Is Fork",
      type: FieldType.CHECKBOX,
      options: { icon: "check", color: "blueBright" },
    },
    {
      name: "Is Private",
      type: FieldType.CHECKBOX,
      options: { icon: "check", color: "blueBright" },
    },
    {
      name: "Is Template",
      type: FieldType.CHECKBOX,
      options: { icon: "check", color: "blueBright" },
    },

    {
      name: "Branch Protection",
      type: FieldType.MULTIPLE_SELECTS,
      options: {
        // Go through all of the topics and build a unique list
        choices: fetchedRepos.reduce((acc, repo) => {
          for (const bp of repo.branchProtectionRules.edges) {
            if (acc.find((t) => t.name === bp.node.pattern) === undefined) {
              acc.push({
                name: bp.node.pattern,
              });
            }
          }
          return acc;
        }, []),
      },
    },
    {
      name: "Languages",
      type: FieldType.MULTIPLE_SELECTS,
      options: {
        // Go through all of the topics and build a unique list
        choices: fetchedRepos.reduce((acc, repo) => {
          for (const l of repo.languages.edges) {
            if (acc.find((t) => t.name === l.node.name) === undefined) {
              acc.push({
                name: l.node.name,
              });
            }
          }
          return acc;
        }, []),
      },
    },
    {
      name: "Primary Language",
      type: FieldType.SINGLE_SELECT,
      options: {
        // Go through all of the topics and build a unique list
        choices: fetchedRepos.reduce((acc, repo) => {
          for (const l of repo.languages.edges) {
            if (acc.find((t) => t.name === l.node.name) === undefined) {
              acc.push({
                name: l.node.name,
              });
            }
          }
          return acc;
        }, []),
      },
    },
    { name: "Org", type: FieldType.SINGLE_LINE_TEXT },
    { name: "Name", type: FieldType.SINGLE_LINE_TEXT },
  ];
  return fields;
};
