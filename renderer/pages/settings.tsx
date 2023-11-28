import React from "react";
import Head from "next/head";
import SettingsComponent from "@components/settings/Settings";
function Settings() {
  return (
    <React.Fragment>
      <Head>
        <title>Settings - DFX GUI</title>
      </Head>
      <SettingsComponent />
    </React.Fragment>
  );
}

export default Settings;
