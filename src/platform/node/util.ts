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
import { ExportResult, ExportResultCode } from '@opentelemetry/core';

import * as Libhoney from "libhoney";
import * as honeyTypes from '../../types';

type _response = { 
  status_code: number,
  duration: number,
  metadata: object,
  error?: any
};

var printError = function(error, explicit) {
  console.log(`[${explicit ? 'EXPLICIT' : 'INEXPLICIT'}] ${error.name}: ${error.message}`);
}

/**
 * Prepares send function that will send spans to the remote Zipkin service.
 */
export function prepareSend(
  logger: api.Logger,
  dataset: string,
  writeKey: string,
  apiHost: string | null,
) {
  const hny = new Libhoney({
    writeKey: writeKey,
    dataset: dataset,
    apiHost: apiHost || "https://api.honeycomb.io/",
    responseCallback: (responses : _response[]) => {
      responses.forEach((resp : _response) => {
        console.log(resp);
      });
    }
  });
  /**
   * Send spans to the remote Zipkin service.
   */
  return function send(
    events: honeyTypes.Event[],
    done: (result: ExportResult) => void
  ) {
    if (events.length === 0) {
      logger.debug('Honeycomb send with empty spans');
      return done({ code: ExportResultCode.SUCCESS });
    }
    for (let event of events) {
      let ev = hny.newEvent();
      for (let key in event) {
        ev.addField(key, event[key])
      }
      ev.send()
    }
  }

}
