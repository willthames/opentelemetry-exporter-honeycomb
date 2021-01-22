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
import { ReadableSpan } from '@opentelemetry/tracing';
import { hrTimeToMilliseconds } from '@opentelemetry/core';
import { Event } from './types';

export const statusCodeTagName = 'ot.status_code';
export const statusDescriptionTagName = 'ot.status_description';

/**
 * Translate OpenTelemetry ReadableSpan to ZipkinSpan format
 * @param span Span to be translated
 */
export function toEvent(
  span: ReadableSpan,
  serviceName: string,
  statusCodeTagName: string,
  statusDescriptionTagName: string
): Event {
  let event: Event = {}
  event.trace_id = span.spanContext.traceId
  event.parent_id = span.parentSpanId
  event.name = span.name
  event.id = span.spanContext.spanId
  event.kind = span.kind
  event.timestamp = new Date(hrTimeToMilliseconds(span.startTime))
  event.duration_ms = hrTimeToMilliseconds(span.duration)
  event.service_name = serviceName
  for (const key of Object.keys(span.attributes)) {
    event[key] = String(span.attributes[key]);
  }
  Object.keys(span.resource.attributes).forEach(
    name => (event[name] = String(span.resource.attributes[name]))
  );
  event.events = span.events.map(event => ({
    timestamp: new Date(hrTimeToMilliseconds(event.time)),
    value: event.name,
  }));
  event[statusCodeTagName] = String(api.StatusCode[span.status.code]);
  if (span.status.message) {
    event[statusDescriptionTagName] = span.status.message;
  }

  return event;
}