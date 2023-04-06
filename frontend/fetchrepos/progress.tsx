import { Box, Text, ProgressBar } from "@airtable/blocks/ui";
import React from "react";
import { useAtom } from "jotai";

export function Progress({ progressAtom }) {
  const [progress] = useAtom(progressAtom);

  if (Object.keys(progress).length === 0) {
    return null;
  }

  return (
    <>
      {(progress.primary !== undefined &&
        Object.keys(progress.primary).length) > 0 && (
        <Box paddingBottom='10px'>
          <Text textAlign='left' size='xlarge'>
            {progress.primary.msg}
          </Text>
          <ProgressBar
            progress={progress.primary.progress}
            barColor='#2872e1'
          />
        </Box>
      )}
      {(progress.secondary !== undefined &&
        Object.keys(progress.secondary).length) > 0 && (
        <Box paddingBottom='10px'>
          <Text textAlign='left' size='xlarge'>
            {progress.secondary.msg}
          </Text>
          <ProgressBar
            progress={progress.secondary.progress}
            barColor='#2872e1'
          />
        </Box>
      )}
    </>
  );
}
