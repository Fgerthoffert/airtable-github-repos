import { initializeBlock, useSettingsButton } from "@airtable/blocks/ui";
import React, { useEffect, useState } from "react";

import { Configuration } from "./configuration";
import { FetchRepos } from "./fetchrepos/index";
import { useSettings } from "./settings";
import { Documentation } from "./documentation";

function GitHubReposApp() {
  const { isValid } = useSettings();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  useSettingsButton(() => {
    setIsSettingsVisible(!isSettingsVisible);
  });

  useEffect(() => {
    if (!isValid) {
      setIsSettingsVisible(true);
    }
  }, [isValid]);

  if (!isValid || isSettingsVisible) {
    return (
      <>
        <Configuration setIsSettingsVisible={setIsSettingsVisible} />
        <Documentation />
      </>
    );
  } else {
    return (
      <>
        <FetchRepos />
        <Documentation />
      </>
    );
  }
}

initializeBlock(() => <GitHubReposApp />);
