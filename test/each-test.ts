import addClosest from "element-closest";

import "saddle-up/matchers";
import "saddle-up/koa-matchers";
import "./matchers";
import "@shopify/ast-utilities/dist/src/matchers";
import "@shopify/react-testing/dist/src/matchers";
import "@shopify/graphql-testing/dist/src/matchers";

import { destroyAll } from "@shopify/react-testing/dist/src/destroy";

if (typeof window !== "undefined") {
  addClosest(window);
}

// eslint-disable-next-line jest/require-top-level-describe
afterEach(() => {
  destroyAll();
});
