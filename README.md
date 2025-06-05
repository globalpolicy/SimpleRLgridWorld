# Gridworld solution with Reinforcement Learning
Implemention of the classic textbook gridworld problem where an agent is supposed to take the highest-return path to a set target.
Only meant as an exercise for me and anyone who may be interested in learning Reinforcement Learning and Dynamic Programming.
The resources followed for the algorithms have been mentioned on top of the respective source files.

TypeScript has been used instead of JavaScript wherever possible for sanity.

p5.js library has been used for the graphics.

![image](https://github.com/user-attachments/assets/2be6088b-56f7-473a-84f4-7df465561772)

## Dynamics of the gridworld:
Red cells are obstacles and give a -2 reward when trying to moving into them and the agent doesn't move

The boundaries give a -1 reward when trying to move into them and the agent doesn't move

Green triangle = Target = +1 reward

Moving into any cell other than an obstacle or target or boundary gives a -1 reward and the agent does successfully move into the intended cell

Add more obstacles by press-dragging your mouse in the intended cells, hold down shift while doing so to remove obstacles

The cell numbers are state values

## So far, the following methods have been implemented:
- Policy/Value Iteration
- Monte Carlo methods have

More reading @ [c0dew0rth](c0dew0rth.blogspot.com)
