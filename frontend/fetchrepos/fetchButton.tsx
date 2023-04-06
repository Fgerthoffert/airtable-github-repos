import {
  Box,
  useBase,
  useGlobalConfig,
  Button,
  Icon,
  Loader,
} from "@airtable/blocks/ui";

import React, { useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import pino from "pino";

import {
  GITHUB_USER_TOKEN,
  GITHUB_ORGANISATION,
  GITHUB_MAXNODES_ORG,
  GITHUB_MAXNODES_REPOS,
  AIRTABLE_TABLENAME,
} from "../settings";
import gqlGetOrgByName from "./github/graphql/gqlGetOrgByName";
import gqlGetOrgRepos from "./github/graphql/gqlGetOrgRepos";
import gqlGetReposByIds from "./github/graphql/gqlGetReposByIds";
import graphqlQuery from "./github/utils/graphqlQuery";
import fetchNodesByQuery from "./github/utils/fetchNodesByQuery";
import fetchNodesByIds from "./github/utils/fetchNodesByIds";
import chunkArray from "./github/utils/chunkArray";
import { getFields } from "./airtable/getFields";
import { formatRecords } from "./airtable/formatRecords";
import { updateFields } from "./airtable/updateFields";

const maxFetchNodes = 10;
const maxAirTableNodes = 50;

export function FetchButton({ isLoadingAtom, logsAtom, progressAtom }) {
  const globalConfig = useGlobalConfig();
  const tokenExists = globalConfig.get(GITHUB_USER_TOKEN) as string;
  const [githubToken] = useState(tokenExists || "");

  const orgExists = globalConfig.get(GITHUB_ORGANISATION) as string;
  const [githubOrg] = useState(orgExists || "");

  const githubMaxNodesOrgExists = globalConfig.get(
    GITHUB_MAXNODES_ORG
  ) as number;
  const [githubMaxNodesOrg] = useState(githubMaxNodesOrgExists || 60);

  const githubMaxNodesReposExists = globalConfig.get(
    GITHUB_MAXNODES_REPOS
  ) as number;
  const [githubMaxNodesRepos] = useState(githubMaxNodesReposExists || 40);

  const airtableTableNameExists = globalConfig.get(
    AIRTABLE_TABLENAME
  ) as string;
  const [airtableTableName] = useState(airtableTableNameExists || "");

  const [isLoading, setLoading] = useAtom(isLoadingAtom);
  const setLogs = useSetAtom(logsAtom);
  const setProgress = useSetAtom(progressAtom);

  const base = useBase();

  const logger = pino({
    browser: {
      asObject: true,
      write: (o) => {
        console.log(o);
        setLogs((logs) => [...logs, o]);
      },
    },
  });

  const fetchRepos = async (e) => {
    e.preventDefault();
    setLoading(true);

    setProgress({
      primary: {
        progress: 0,
        msg: `Will grab the ID for organization: ${githubOrg}`,
      },
      secondary: undefined,
    });

    // Get the organization ID
    const orgResponse = await graphqlQuery(
      githubToken,
      gqlGetOrgByName,
      { orgName: githubOrg }, // eslint-disable-line
      {
        limit: 5000,
        cost: 1,
        remaining: 5000,
        resetAt: null,
      },
      logger
    );

    setProgress({
      primary: {
        progress: 0.1,
        msg: `Obtained the ID for organization: ${githubOrg}`,
      },
      secondary: undefined,
    });

    if (orgResponse.organization !== null) {
      // Get the list of repositories for that organization
      const fetchReposData = new fetchNodesByQuery(
        githubToken,
        gqlGetOrgRepos,
        logger,
        githubMaxNodesOrg,
        setProgress
      );
      logger.info(`Fetching the list of repositories for org: ${githubOrg}`);
      const fetchedOrgRepos = await fetchReposData.load({
        orgId: orgResponse.organization.id,
      });

      let logMsg = `Retrieved a list of ${fetchedOrgRepos.length} repositories for the organization`;
      setProgress({
        primary: {
          progress: 0.4,
          msg: logMsg,
        },
        secondary: undefined,
      });
      logger.info(logMsg);

      logger.info(`Fetching repositories metadata for org: ${githubOrg}`);
      const fetchData = new fetchNodesByIds(
        githubToken,
        gqlGetReposByIds,
        logger,
        githubMaxNodesRepos
      );

      setProgress({
        primary: {
          progress: 0.5,
          msg: "Fetching repository metadata",
        },
        secondary: {
          progress: 0.05,
          msg: `Fetching metadata for the first ${maxFetchNodes} repositories`,
        },
      });

      // Split the repos in multiple sub-arrays for sending furthre calls to GitHub API
      const githubChunks = chunkArray(fetchedOrgRepos, maxFetchNodes);
      let fetchedRepos: Array<any> = [];
      for (const githubChunk of githubChunks) {
        let retries = 0;
        const maxRetries = 3;
        let updatedData = [];
        while (updatedData.length === 0 && retries < maxRetries) {
          logger.info(
            `Loading ${githubChunk.length} repos from GitHub ${
              fetchedRepos.length + githubChunk.length
            } / ${fetchedOrgRepos.length})${
              retries > 0
                ? " - API error, retry: " + retries + "/" + maxRetries
                : ""
            }`
          );
          updatedData = await fetchData.load(githubChunk);
          setProgress({
            primary: {
              progress: 0.5,
              msg: "Fetching repository metadata",
            },
            secondary: {
              progress:
                (fetchedRepos.length + githubChunk.length) /
                fetchedOrgRepos.length,
              msg: `Fetched metadata about ${
                fetchedRepos.length + githubChunk.length
              } / ${fetchedOrgRepos.length} repositories`,
            },
          });
          retries++;
        }
        fetchedRepos = [...fetchedRepos, ...updatedData];
      }

      setProgress({
        primary: {
          progress: 0.6,
          msg: "Fecthed all repository metadata",
        },
        secondary: undefined,
      });

      // https://github.com/Airtable-Automator/flickr-search-and-import/blob/master/frontend/ReviewSelection.tsx
      // https://airtable.com/developers/extensions/api/FieldType
      // From this point, repos can be imported into Airtable

      if (fetchedRepos.length > 0) {
        const fields = getFields(fetchedRepos);

        logger.info(`Check if Airtable table ${airtableTableName} exists`);
        let table = base.getTableByNameIfExists(airtableTableName);

        if (!table) {
          logger.info(`${airtableTableName} does not exists, creating`);
          if (base.hasPermissionToCreateTable(airtableTableName, fields)) {
            await base.createTableAsync(airtableTableName, fields);
          }
          table = base.getTableByName(airtableTableName);
        }

        table.checkPermissionsForCreateRecord();

        setProgress({
          primary: {
            progress: 0.7,
            msg: `Fetching existing records in Airtable table ${airtableTableName}`,
          },
          secondary: undefined,
        });
        const existingRecords = await table.selectRecordsAsync();

        const records = formatRecords(fetchedRepos, existingRecords.records);

        logger.info(
          `Updating fields for table: ${airtableTableName} (if necessary)`
        );
        const selectFields = [
          "Topics",
          "Branch Protection",
          "Languages",
          "Primary Language",
        ];
        await updateFields(table, fields, selectFields, logger);

        // Handle records creation
        const actions = ["CREATE", "UPDATE"];
        for (const action of actions) {
          const recordsPush = records.filter((r) => r.action === action);
          logger.info(
            `Processing records for: ${action} (${recordsPush.length} records)`
          );
          const airtableChunksPush = chunkArray(recordsPush, maxAirTableNodes);
          let recordsPushCpt = 0;
          for (const airtableChunk of airtableChunksPush) {
            if (action === "CREATE") {
              await table.createRecordsAsync(
                airtableChunk.map((r) => r.record)
              );
            } else {
              await table.updateRecordsAsync(
                airtableChunk.map((r) => {
                  return {
                    id: r.id,
                    fields: r.record.fields,
                  };
                })
              );
            }
            recordsPushCpt = recordsPushCpt + airtableChunk.length;
            setProgress({
              primary: {
                progress: 0.8,
                msg: `${action} new records in table`,
              },
              secondary: {
                progress: recordsPushCpt / recordsPush.length,
                msg: `Pushing repos metadata to AirtableFetching (${recordsPushCpt} / ${recordsPush.length})`,
              },
            });
          }
        }
      } else {
        logger.error(
          "No repositories were fetched, check your token or ensure you do have access to these repositories."
        );
      }
    }
    setProgress({
      primary: undefined,
      secondary: undefined,
    });
    setLoading(false);
  };

  return (
    <form>
      <Box>
        <Button
          icon={
            (isLoading && <Loader />) || (
              <Icon name='download' fillColor='white' />
            )
          }
          variant='primary'
          disabled={isLoading}
          onClick={fetchRepos}
        >
          Fetch
        </Button>
      </Box>
    </form>
  );
}
