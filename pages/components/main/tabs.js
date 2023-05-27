import {
  Card,
  Tabs,
  Frame,
  Loading
} from "@shopify/polaris";
import { useState, useEffect, useCallback } from "react";
import React from "react";
import ProductsTableSection from "../sections/products-table/products-table-section";

export default function Main({restFetch}){
  const [mainLoaderOn, toggleMainLoader] = useState(() =>true);

  return <>
    <Frame>
      {mainLoaderOn && <Loading/>}
        <Card.Section>
          { React.cloneElement(<ProductsTableSection/>, { mainLoaderOn: mainLoaderOn, toggleMainLoader: toggleMainLoader, restFetch: restFetch }) }
        </Card.Section>
    </Frame>
  </>;
}
