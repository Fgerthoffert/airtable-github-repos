import {
  Box,
  Text,
  Link,
  FormField,
  Input,
  useViewport,
  useGlobalConfig,
  Heading,
  Button,
  Icon,
  Loader,
  Select,
} from "@airtable/blocks/ui";
import React, { useState } from "react";
import { graphql } from "@octokit/graphql";

import {
  GITHUB_USER_TOKEN,
  GITHUB_ORGANISATION,
  GITHUB_MAXNODES_ORG,
  GITHUB_MAXNODES_REPOS,
  AIRTABLE_TABLENAME,
} from "./settings";

export function Configuration({ setIsSettingsVisible }) {
  const globalConfig = useGlobalConfig();
  const tokenExists = globalConfig.get(GITHUB_USER_TOKEN) as string;
  const [githubToken, setGithubToken] = useState(tokenExists || "");

  const orgExists = globalConfig.get(GITHUB_ORGANISATION) as string;
  const [githubOrg, setGithubOrg] = useState(orgExists || "");

  const githubMaxNodesOrgExists = globalConfig.get(
    GITHUB_MAXNODES_ORG
  ) as string;
  const [githubMaxNodesOrg, setGithubMaxNodesOrg] = useState(
    parseInt(githubMaxNodesOrgExists) || 60
  );

  const githubMaxNodesReposExists = globalConfig.get(
    GITHUB_MAXNODES_REPOS
  ) as string;
  const [githubMaxNodesRepos, setGithubMaxNodesRepos] = useState(
    parseInt(githubMaxNodesReposExists) || 40
  );

  const airtableTableNameExists = globalConfig.get(
    AIRTABLE_TABLENAME
  ) as string;
  const [airtableTableName, setAirtableTableName] = useState(
    airtableTableNameExists || "GitHub Repositories"
  );

  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userLogin, setUserLogin] = useState("");
  const [userOrgs, setUserOrgs] = useState([]);

  const viewport = useViewport();

  const saveToken = async (e) => {
    e.preventDefault();
    setLoading(true);

    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${githubToken}`,
      },
    });

    let authTestData;
    try {
      authTestData = await graphqlWithAuth(`
        query { 
            viewer { 
                login
                organizations(first: 100) {
                    totalCount
                    edges {
                      cursor
                      node {
                        name
                        login
                        id
                        repositories {
                          totalCount
                        }
                      }
                    }
                }                
            }
        }
    `);
    } catch (e) {
      setLoading(false);
      setErrorMessage(e.message);
    }

    if (authTestData !== undefined) {
      setLoading(false);
      setErrorMessage("");
      setUserLogin(authTestData.viewer.login);
      setUserOrgs(authTestData.viewer.organizations.edges);
      if (githubOrg === "") {
        setGithubOrg(authTestData.viewer.organizations.edges[0].node.login);
      }
    }
  };

  const saveSettings = async () => {
    globalConfig.setAsync(GITHUB_USER_TOKEN, githubToken);
    globalConfig.setAsync(GITHUB_ORGANISATION, githubOrg);
    globalConfig.setAsync(GITHUB_MAXNODES_ORG, githubMaxNodesOrg);
    globalConfig.setAsync(GITHUB_MAXNODES_REPOS, githubMaxNodesRepos);
    globalConfig.setAsync(AIRTABLE_TABLENAME, airtableTableName);
    setIsSettingsVisible(false);
  };

  return (
    <Box
      display='flex'
      alignItems='center'
      justifyContent='center'
      border='none'
      flexDirection='column'
      width={viewport.size.width}
      height={viewport.size.height + 100}
      padding={0}
    >
      <Box maxWidth='650px'>
        <Box paddingBottom='10px'>
          <Heading size='xlarge'>Github Repositories</Heading>
        </Box>

        <Box paddingBottom='10px'>
          <Text textAlign='justify' size='xlarge'>
            This extension fetches repositories available in an Organisation
            from{" "}
            <Link
              size='xlarge'
              href='https://docs.github.com/en/graphql'
              target='_blank'
            >
              GitHub GraphQL API
            </Link>{" "}
            into your base.
          </Text>
        </Box>

        <Box paddingBottom='10px'>
          <Text variant='paragraph' textAlign='justify' size='xlarge'>
            To use this block within your base you need to create an API Token
            (classic). You can obtain it{" "}
            <Link size='xlarge' href='https://github.com/settings/tokens'>
              in your GitHub User Settings.
            </Link>
          </Text>
        </Box>

        <Box paddingBottom='10px'>
          <Text variant='paragraph' textAlign='justify' size='xlarge'>
            This token must have the &quot;repo&quot; and &quot;read:org&quot;
            scopes.
          </Text>
        </Box>
        <form onSubmit={saveSettings}>
          <Box>
            <FormField label='GitHub User Token (Classic)'>
              <Input
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                width='400px'
              />
            </FormField>
          </Box>

          <Box>
            {errorMessage !== "" && (
              <Text paddingBottom='5px' textColor='red'>
                Note: {errorMessage}
              </Text>
            )}
            {userLogin !== "" && (
              <Text paddingBottom='5px' textColor='green'>
                Authentication successful as {userLogin}, you have access to{" "}
                {userOrgs.length} organizations
              </Text>
            )}
            <Button
              icon={
                (isLoading && <Loader />) || (
                  <Icon name='personal' fillColor='white' />
                )
              }
              variant='primary'
              disabled={!githubToken || githubToken === "" || isLoading}
              onClick={saveToken}
            >
              Fetch available organizations
            </Button>
          </Box>
          {userOrgs.length > 0 && (
            <>
              <Box>
                <FormField
                  label='Select a GitHub Organisation'
                  paddingTop='5px'
                >
                  <Select
                    options={userOrgs.map((o) => {
                      return {
                        value: o.node.login,
                        label: `${o.node.name} (${o.node.login})`,
                      };
                    })}
                    value={
                      githubOrg !== "" ? githubOrg : userOrgs[0].node.login
                    }
                    onChange={(newValue) => setGithubOrg(newValue)}
                    width='400px'
                  />
                </FormField>
              </Box>
              <Box
                display='flex'
                alignItems='left'
                justifyContent='left'
                border='none'
                flexDirection='row'
                padding={0}
              >
                <Box>
                  <FormField
                    label='Nodes per query (discovery)'
                    paddingTop='5px'
                  >
                    <Input
                      type='number'
                      max={100}
                      value={githubMaxNodesOrg.toString()}
                      onChange={(e) => setGithubMaxNodesOrg(e.target.value)}
                      width='200px'
                    />
                  </FormField>
                </Box>
                <Box> </Box>
                <Box>
                  {" "}
                  <FormField
                    label='Nodes per query (metadata)'
                    paddingTop='5px'
                  >
                    <Input
                      type='number'
                      max={100}
                      value={githubMaxNodesRepos.toString()}
                      onChange={(e) => setGithubMaxNodesRepos(e.target.value)}
                      width='200px'
                    />
                  </FormField>
                </Box>
              </Box>

              <Box>
                <FormField
                  label='Airtable Table Name (will be created if it does not exist)'
                  paddingTop='5px'
                >
                  <Input
                    value={airtableTableName}
                    onChange={(e) => setAirtableTableName(e.target.value)}
                    width='400px'
                  />
                </FormField>
              </Box>

              <Box>
                <Button
                  icon={
                    (isLoading && <Loader />) || (
                      <Icon name='settings' fillColor='white' />
                    )
                  }
                  variant='primary'
                  disabled={!githubOrg || githubOrg === "" || isLoading}
                  onClick={saveSettings}
                >
                  Save
                </Button>
              </Box>
            </>
          )}
        </form>
      </Box>
    </Box>
  );
}
