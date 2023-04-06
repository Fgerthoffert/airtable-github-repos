import { Box, Text, Heading, Button, Icon, Dialog } from "@airtable/blocks/ui";
import React, { useState } from "react";
import { useAtom } from "jotai";

const getTextColor = (log) => {
  if (log.level === 50) {
    return "red";
  } else if (log.level === 20) {
    return "yellow";
  } else if (log.level === 30) {
    return "green";
  }
  return "black";
};

export function Logs({ logsAtom }) {
  const [logs] = useAtom(logsAtom);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (logs === null) {
    return null;
  }

  const lastErrors = logs.filter((l) => l.level === 50);
  let lastError = undefined;
  if (lastErrors[lastErrors.length - 1] !== undefined) {
    lastError = lastErrors[lastErrors.length - 1];
  }

  return (
    <Box paddingBottom='10px'>
      <Box>
        {logs.length > 0 && (
          <Button
            icon={<Icon name='show' fillColor='white' />}
            variant='primary'
            onClick={() => setIsDialogOpen(true)}
          >
            Show Logs
          </Button>
        )}
      </Box>
      {/* Display error logs direclty in the window */}
      {lastError !== undefined && (
        <Text paddingBottom='5px' textColor={getTextColor(lastError)}>
          {new Date(lastError.time).toISOString()} {lastError.msg}
        </Text>
      )}
      {isDialogOpen && (
        <Dialog onClose={() => setIsDialogOpen(false)} minWidth='700px'>
          <Dialog.CloseButton />
          <Heading>Logs</Heading>
          <>
            {logs.map((l: any) => {
              return (
                <Text key={l.time} textColor={getTextColor(l)}>
                  {new Date(l.time).toISOString()} {l.msg}
                </Text>
              );
            })}
          </>
          <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
        </Dialog>
      )}
    </Box>
  );
}
