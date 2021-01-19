# OpenTelemetry Honeycomb Trace Exporter

OpenTelemetry Honeycomb Trace Exporter allows the user to send collected traces to [Honeycomb](https://www.honeycomb.io).

## Installation

```bash
npm install --save opentelemetry-exporter-honeycomb
```

## Usage in Node

You will need a write key for your team and a dataset name (the dataset need not exist yet)

Install the exporter on your application and pass the options. `serviceName` is an optional string. If omitted, the exporter will first try to get the service name from the Resource. If no service name can be detected on the Resource, a fallback name of "OpenTelemetry Service" will be used.

```js
const { HoneycombExporter } = require('opentelemetry-exporter-honeycomb');

const options = {
  dataset: 'your-dataset'
  writeKey: 'your-write-key'
  serviceName: 'your-application-name'
}
const exporter = new HoneycombExporter(options);
```

Now, register the exporter and start tracing.

```js
tracer.addSpanProcessor(new BatchSpanProcessor(exporter));
```

You can use built-in `SimpleSpanProcessor` or `BatchSpanProcessor` or write your own.

- [SimpleSpanProcessor](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/sdk.md#simple-processor): The implementation of `SpanProcessor` that passes ended span directly to the configured `SpanExporter`.
- [BatchSpanProcessor](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/sdk.md#batching-processor): The implementation of the `SpanProcessor` that batches ended spans and pushes them to the configured `SpanExporter`. It is recommended to use this `SpanProcessor` for better performance and optimization.

## Viewing your traces

Go to https://ui.honeycomb.io

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For Honeycomb info see <https://honeycomb.io/>

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
