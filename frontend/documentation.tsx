import React from "react";
import { Box, Text, Link } from "@airtable/blocks/ui";

export function Documentation() {
  return (
    <Box paddingBottom='10px'>
      <Text variant='paragraph' textAlign='justify' size='small'>
        Documentation about the extension available at{" "}
        <Link
          size='small'
          href='https://github.com/Fgerthoffert/airtable-github-repos'
          target='_blank'
        >
          github.com/Fgerthoffert/airtable-github-repos
        </Link>
      </Text>
    </Box>
  );
}
