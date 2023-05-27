import {
  DataTable,
  Badge,
  Link,
  Thumbnail,
} from "@shopify/polaris";
import { useState, useEffect } from "react";



var nestedProperty = require("nested-property");
const shopUrl = `https://${SHOP}`;



export default function ProductsTable({ data }) {


  const [productRows, setProductRows] = useState([]);


  useEffect(() => {

    if (data) {
      const statusColors = {
        ACTIVE: "success",
      };

      var rows = [];
      rows = data.products.map((product, rowId) => {
        const productId = product.id.split('/').slice(-1)[0];



        return [
          <Thumbnail
            source={ nestedProperty.get(product,'images.edges.0.node.originalSrc') }
            alt={ nestedProperty.get(product,'images.edges.0.node.altText') }/>,
          <p style={{ width :"250px", display: "block", whiteSpace:"normal" }}><strong><Link external url={`${shopUrl}/admin/products/`+ productId}> { product.title } </Link></strong></p>,
          <Badge status={statusColors[product.status]}>{product.status}</Badge>
        ];
      });

      setProductRows(() => rows);
    }
  }, [data]);



  return (
    <>

      <div>
        <DataTable
          columnContentTypes={[
            "text",
            "text",
            "text"
          ]}
          headings={[
            <strong>Product Image</strong>,
            <strong>Name</strong>,
            <strong>Status</strong>
          ]}
          rows={productRows}
        />
      </div>
    </>
  );
}
