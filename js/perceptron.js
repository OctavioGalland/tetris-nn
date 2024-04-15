function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function relu(x) {
  return Math.max(x, 0);
}

function matTimesVec(M, v) {
  let res = Array(M.length)
  for (let i = 0; i < M.length; i++) {
    res[i] = 0;
    for (let j = 0; j < M[i].length; j++) {
      res[i] += v[j] * M[i][j];
    }
  }
  return res;
}

function vecPlusVec(a, b) {
  let res = Array(a.length);
  for (let i = 0; i < a.length; i++) {
    res[i] = a[i] + b[i];
  }
  return res;
}

// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean=0, stdev=1) {
  let u = 1 - Math.random(); // Converting [0,1) to (0,1]
  let v = Math.random();
  let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

function randomValue(mean, sd) {
  return gaussianRandom(mean, sd);
}

function randomVector(n, mean, sd) {
  let res = Array(n);
  for (let i = 0; i < n; i++) {
    res[i] = randomValue(mean, sd);
  }
  return res;
}

function randomMatrix(rows, cols, mean, sd) {
  let res = Array(rows);
  for (let i = 0; i < rows; i++) {
    res[i] = randomVector(cols, mean, sd);
  }
  return res;
}

function predict(x, nn) {
  let out = x;
  // console.log(`in: ${x}`);

  for (let layer = 0; layer < nn.length; layer++) {
    const M = nn[layer][0], b = nn[layer][1];
    // console.log(`Layer ${layer}`);
    // console.log(`    M is ${M.length}x${M[0].length}`)
    // console.log(`    b is ${b.length}`)
    out = vecPlusVec(matTimesVec(M, out), b).map(x => relu(x));
    // console.log(`    after layer ${layer}: ${out}`);
  }

  return out;
}