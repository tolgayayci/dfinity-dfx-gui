import React from "react";
import Head from "next/head";
import IdentitiesComponent from "../components/identities/Identities";

function Identities() {
  return (
    <React.Fragment>
      <Head>
        <title>Identities - DFINITY DFX</title>
      </Head>
      <IdentitiesComponent />
    </React.Fragment>
  );
}

export default Identities;
