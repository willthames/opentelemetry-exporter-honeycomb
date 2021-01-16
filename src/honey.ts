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
import { SpanExporter, ReadableSpan } from '@opentelemetry/tracing';
import { prepareSend } from './platform/index';
import * as honeyTypes from './types';
import {
  toEvent,
  statusCodeTagName,
  statusDescriptionTagName,
} from './transform';
import { SERVICE_RESOURCE } from '@opentelemetry/resources';

/**
 * Honeycomb Exporter
 */
export class HoneycombExporter implements SpanExporter {
  static readonly DEFAULT_API = 'api.honeycomb.io';
  private readonly DEFAULT_SERVICE_NAME = 'OpenTelemetry Service';
  private readonly _logger: api.Logger;
  private readonly _statusCodeTagName: string;
  private readonly _statusDescriptionTagName: string;
  private _send: honeyTypes.SendFunction;
  private _serviceName?: string;
  private _isShutdown: boolean;
  private _sendingPromises: Promise<unknown>[] = [];

  constructor(config: honeyTypes.ExporterConfig) {
    const api_url = config.url || HoneycombExporter.DEFAULT_API;
    this._logger = config.logger || new api.NoopLogger();
    this._send = prepareSend(this._logger, api_url, config.dataset, config.writeKey);
    this._serviceName = config.serviceName;
    this._statusCodeTagName = config.statusCodeTagName || statusCodeTagName;
    this._statusDescriptionTagName =
      config.statusDescriptionTagName || statusDescriptionTagName;
    this._isShutdown = false;
  }

  /**
   * Export spans.
   */
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ) {
    if (typeof this._serviceName !== 'string') {
      this._serviceName = String(
        spans[0].resource.attributes[SERVICE_RESOURCE.NAME] ||
          this.DEFAULT_SERVICE_NAME
      );
    }
    this._logger.debug('Zipkin exporter export');
    if (this._isShutdown) {
      // @ts-ignore
      setTimeout(() =>
        resultCallback({
          code: ExportResultCode.FAILED,
          error: new Error('Exporter has been shutdown'),
        })
      );
      return;
    }
    const promise = new Promise<void>(resolve => {
      this._sendSpans(spans, this._serviceName!, result => {
        resolve();
        resultCallback(result);
        const index = this._sendingPromises.indexOf(promise);
        this._sendingPromises.splice(index, 1);
      });
    });
    this._sendingPromises.push(promise);
  }

  /**
   * Shutdown exporter. Noop operation in this exporter.
   */
  shutdown(): Promise<void> {
    this._logger.debug('Zipkin exporter shutdown');
    this._isShutdown = true;
    return new Promise((resolve, reject) => {
      Promise.all(this._sendingPromises).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * Transform spans and sends to Zipkin service.
   */
  private _sendSpans(
    spans: ReadableSpan[],
    serviceName: string,
    done?: (result: ExportResult) => void
  ) {
    const events = spans.map(span =>
      toEvent(
        span,
        serviceName,
        this._statusCodeTagName,
        this._statusDescriptionTagName
      )
    );
    return this._send(events, (result: ExportResult) => {
      if (done) {
        return done(result);
      }
    });
  }
}
