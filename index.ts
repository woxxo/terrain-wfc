import { Terrain } from './terrain.ts';

const ter = new Terrain(30, 10);
ter.generate();

console.log(ter.text);
