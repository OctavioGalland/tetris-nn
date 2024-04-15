# NNE

Trains a multi-layer perceptron to play Tetris through an evolutionary algorithm (as opposed to Q-learning or gradient descent).

## Overview

The neural network is fed the state of the game board (using an econding where `0` means free block, `1` means falling block, and `-1` means fixed block), and it outputs 4 neurons, each one indicating whether or not to exercise each of the game's inputs (i.e., buttons). The net is repeatedly fed the current game state, and the state is advanced according to its outputs until it loses.

Evolution happens through application of gaussian noise to the parameters of the network. An initial population is intialized randomly, an elite is passed on from one generation to the next (to ensure monotony), and the remainder of the population is generated through mutation of the best performing individuals of the previous population (selected at random from the top performers).

Fitness of any given inididual is a function of how many lines get cleared (clearing multiple lines at once rewards more points), and for how long the individual survives (to ensure a smooth fitness function). Encoding more information into the fitness function could yield better results (see Stevens et al below), but that feels like cheating, as ideally we would want the net to learn just from the score it achieved.

The project includes an ad-hoc implementation of Tetris and of multi-layer perceptrons, both using plain Javascript. The set of parameters can be specified when calling `evolve` (see `js/evolution.js:162`), it includes parameters such as max training time, topology of the network, mean and standard devaition, elitism size, etc.

## Running

Just open `index.html` in your browser (tested using Firefox), during the evolutionary stage some stats will be printed to the developer console, and after this stage finishes you will be able to see the resulting neural network (the best performer of the last generation) playing in your screen. Once it loses you can press space to restart the game.

## TODO

- Use convolutional neural networks! Currently, the game board (a matrix) is being serialized, but maybe this is suboptimal.
- Implement NEAT, although [some results](https://github.com/MilanFIN/tetris-neat) suggest that this might not help all that much.
- Implement multi-threading, currently the game state is global and this forces us to do everything in a single thread.

## Bibliography

- [https://github.com/uber-research/deep-neuroevolution](https://github.com/uber-research/deep-neuroevolution)
- [https://www.uber.com/blog/deep-neuroevolution/](https://www.uber.com/blog/deep-neuroevolution/)
- [https://neat-python.readthedocs.io/en/latest/neat_overview.html](https://neat-python.readthedocs.io/en/latest/neat_overview.html)
- [https://cs231n.stanford.edu/reports/2016/pdfs/121_Report.pdf](https://cs231n.stanford.edu/reports/2016/pdfs/121_Report.pdf)
