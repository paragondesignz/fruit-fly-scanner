/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_analyzeImage from "../actions/analyzeImage.js";
import type * as actions_fetchMpiRss from "../actions/fetchMpiRss.js";
import type * as crons from "../crons.js";
import type * as detections from "../detections.js";
import type * as hornetSightings from "../hornetSightings.js";
import type * as lib_imageSearch from "../lib/imageSearch.js";
import type * as lib_security from "../lib/security.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/analyzeImage": typeof actions_analyzeImage;
  "actions/fetchMpiRss": typeof actions_fetchMpiRss;
  crons: typeof crons;
  detections: typeof detections;
  hornetSightings: typeof hornetSightings;
  "lib/imageSearch": typeof lib_imageSearch;
  "lib/security": typeof lib_security;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
