import {
  Box,
  Text,
  useViewport,
  useGlobalConfig,
  Heading,
} from "@airtable/blocks/ui";
import React, { useState } from "react";
import { atom } from "jotai";

import { GITHUB_ORGANISATION } from "../settings";
import { FetchButton } from "./fetchButton";
import { Logs } from "./logs";
import { Progress } from "./progress";

const isLoadingAtom = atom(false);
const logsAtom = atom([]);
const progressAtom = atom({});

export function FetchRepos() {
  const globalConfig = useGlobalConfig();

  const orgExists = globalConfig.get(GITHUB_ORGANISATION) as string;
  const [githubOrg] = useState(orgExists || "");

  const viewport = useViewport();

  return (
    <Box
      display='flex'
      alignItems='center'
      justifyContent='center'
      border='none'
      flexDirection='column'
      width={viewport.size.width}
      height={viewport.size.height}
      padding={0}
    >
      <Box maxWidth='650px'>
        <Box paddingBottom='10px'>
          <Heading size='xlarge'>Github Repositories</Heading>
        </Box>

        <Box paddingBottom='10px'>
          <Text textAlign='justify' size='xlarge'>
            By pressing Fetch, you will download metadata about all repositories
            in the {githubOrg} organization.
          </Text>
        </Box>
        <FetchButton
          isLoadingAtom={isLoadingAtom}
          logsAtom={logsAtom}
          progressAtom={progressAtom}
        />
        <Box paddingTop='10px'>
          <Progress progressAtom={progressAtom} />
        </Box>

        <Logs logsAtom={logsAtom} />
      </Box>
    </Box>
  );
}
