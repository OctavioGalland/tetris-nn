function generateGenotype(paramCount, mean, sd) {
  const genotype = Array(paramCount);
  for (let i = 0; i < paramCount; i++) {
    genotype[i] = randomValue(mean, sd);
  }
  return genotype;
}

function genotype2nn(genotype, layerSizes) {
  const ind = Array(layerSizes.length - 1);
  let k = 0;
  for (let l = 0; l < layerSizes.length - 1; l++) {
    const prevLayerSize = layerSizes[l];
    const layerSize = layerSizes[l + 1];
    const M = Array(layerSize);
    const b = Array(layerSize);
    for (let i = 0; i < layerSize; i++){
      M[i] = Array(prevLayerSize);
      for (let j = 0; j < prevLayerSize; j++) {
        M[i][j] = genotype[k + i * prevLayerSize + j];
      }
      b[i] = genotype[k + layerSize * prevLayerSize + i];
    }
    ind[l] = [M, b];
    k += layerSize * prevLayerSize + layerSize;
  }
  return ind;
}

function getFitness(genotype, layerSizes) {
  const individual = genotype2nn(genotype, layerSizes);
  let i = 0;
  while (!gameOver) {
    update(false, individual)
    i++;
    if (i > 100000 && !gameOver) {
      console.log('Fitness evaluation took too long, aborting.');
      resetGame();
      return Infinity;
    }
  }
  const fitness = score;
  resetGame();
  return fitness;
}

function selection(population, sampleSize) {
  return population[Math.floor(Math.random() * sampleSize)];
}

function mutate(genotype, mean, sd) {
  for (let k = 0; k < genotype.length; k++) {
    genotype[k] += randomValue(mean, sd);
  }
}

function sortedInsert(population, fitnesses, fitness, genotype, to) {
  let inserted = false;
  for (let j = 0; j < to; j++) {
    if (fitness >= fitnesses[j]) { // prioritize new genotypes
      for (let k = to; k > j; k--) {
        fitnesses[k] = fitnesses[k - 1];
        population[k] = population[k - 1];
      }
      fitnesses[j] = fitness;
      population[j] = genotype;
      inserted = true;
      break;
    }
  }
  if (!inserted) {
    fitnesses[to] = fitness;
    population[to] = genotype;
  }
}

function evolve(params) {
  const { maxSeconds, populationSize, parentGroupSize, eliteSize, layerSizes, mean, sd } = params;
  const biases = Array(layerSizes.length - 1);
  const weights = Array(layerSizes.length - 1);
  for (let i = 1; i < layerSizes.length; i++) {
    biases[i-1] = layerSizes[i];
    weights[i-1] = layerSizes[i] * layerSizes[i-1];
  }
  const biasesCount = biases.reduce((a, b) => a + b, 0);
  const weightsCount = weights.reduce((a, b) => a + b, 0);
  const paramCount = biasesCount + weightsCount;

  console.log(`Param count: ${paramCount}`);

  let population = [...Array(populationSize)].map(_ => generateGenotype(paramCount, mean, sd));
  let fitnesses = population.map(genotype => getFitness(genotype, layerSizes));

  // Insertion sort
  for (let i = 0; i < population.length - 1; i++) {
    for (let j = 0; j < population.length - 1; j++) {
      if (fitnesses[j] < fitnesses[j + 1]) {
        const tmpGen = population[j];
        population[j] = population[j + 1];
        population[j + 1] = tmpGen;

        const tmpFit = fitnesses[j];
        fitnesses[j] = fitnesses[j + 1];
        fitnesses[j + 1] = tmpFit;
      }
    }
  }

  let newPopulation = Array(populationSize);
  let newFitnesses = Array(populationSize);

  for (let i = 0; i < eliteSize; i++) {
    newPopulation[i] = population[i];
    newFitnesses[i] = fitnesses[i];
  }

  let generation = 0;
  let generationsNoImprovement = 0;

  let start = Date.now();
  while ((Date.now() - start) / 1000 < maxSeconds) {
    if (generation % 100 == 0) {
      console.log(`Generation ${generation}:`);
      for (let i = 0; i < populationSize; i++) {
        console.log(`    ${i}: ${fitnesses[i]}`);
      }
    }

    if (fitnesses[0] == Infinity) {
      console.log('    Best individual took too long to loose, assuming it is perfect!');
      break;
    }


    for (let i = eliteSize; i < populationSize; i++) {
      const parent = selection(population, parentGroupSize);
      const offspring = [...parent];
      mutate(offspring, mean, sd);
      const fitness = getFitness(offspring, layerSizes);
      sortedInsert(newPopulation, newFitnesses, fitness, offspring, i);
    }

    if (newFitnesses[0] > fitnesses[0]) {
      generationsNoImprovement = 0;
    } else {
      generationsNoImprovement++;
      if (generationsNoImprovement > 1000) {
        console.log('This is not going anywhere');
        break;
      }
    }
    population = [...newPopulation];
    fitnesses = [...newFitnesses];
    generation++;
  }
  console.log('Done!');

  console.log(`Best individual fitness ${fitnesses[0]}`);
  return genotype2nn(population[0], layerSizes);
}

const best = evolve(
  {
    maxSeconds: 180,
    populationSize: 15,
    parentGroupSize: 7,
    eliteSize: 3,
    layerSizes: [200, 32, 16, 4],
    mean: 0,
    sd: 0.5
  });

// Evolutionary
setInterval(() => {
  update(true, best);
}, 100);

// Random individual
// setInterval(() => {
//   update(true, generateIndividual([200, 10, 10, 4], 0, 0));
// }, 100);

// Manual play
// setInterval(() => {
//   update(true);
// }, 1000);
