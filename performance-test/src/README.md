### How To

Launch one of the following command according to environment from the current directory `perf-tests`.

_Note_: configure environment through `*.environment.json` file.

##### K6 Scripts
- `calculator.js`: to test calculator API

#### Example usage:
##### Local
- based on iterations

 `k6 run --iterations 2 --vus 2 --env VARS=local.environment.json <script>`
 
- based on duration

 `k6 run --duration 1m --vus 2 --env VARS=local.environment.json <script>`
 
 
##### Dev

 `k6 run --iterations 2 --vus 2 --env VARS=dev.environment.json <script>`
