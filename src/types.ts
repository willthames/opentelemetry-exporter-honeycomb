/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as api from '@opentelemetry/api';
import { ExportResult } from '@opentelemetry/core';

/**
 * Exporter config
 */
export interface ExporterConfig {
  url?: string;
  logger?: api.Logger;
  serviceName?: string;
  writeKey: string;
  dataset: string;
  // Optional mapping overrides for OpenTelemetry status code and description.
  statusCodeTagName?: string;
  statusDescriptionTagName?: string;
}

export type Event = Record<string, any>

/**
 * interface for function that will send honeycomb events
 */
export type SendFunction = (
  events: Event[],
  done: (result: ExportResult) => void
) => void;
