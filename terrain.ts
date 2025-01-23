export class Terrain {
	static #tiles = {
		'~': { '~': 4, '.': 2, 'p': 0, 'M': 0 },
		'.': { '~': 10, '.': 2, 'p': 5, 'M': 0 },
		'p': { '~': 0, '.': 1, 'p': 10, 'M': 2 },
		'M': { '~': 0, '.': 0, 'p': 1, 'M': 2 },
	};
	static #adjacent = [[-1, 0], [1, 0], [0, -1], [0, 1]];
	#text: string = '';
	#buffer: string[];
	#x: number;
	#y: number;
	#queue: { x: number, y: number, d: string}[];

	constructor(x = 50, y = 20) {
		this.#x = x;
		this.#y = y;
		this.#buffer = new Array(x * y);
	}

	generate(): boolean {
		for (let i = 0; i < this.#buffer.length; i++) {
			this.#buffer[i] = '-';
		}

		let currX = this.#x / 2 | 0;
		let currY = this.#y / 2 | 0;
		//console.log(currX, currY);

		this.#buffer[currX + currY * this.#x] = 'p';
		this.#queue = [{ x: currX + 1, y: currY, d: 'p' }];

		this.#setTile();
		return true;
	}

	#setTile(): void {
		let currCoord: { x: number, y: number, d: string} | undefined;

		do {
			currCoord = this.#queue.shift();
			if (typeof currCoord === 'undefined') return;
		} while (this.#buffer[currCoord.x + currCoord.y * this.#x] !== '-');

		let variants = Terrain.#tiles[currCoord.d];
		let summ = 0;
		const prob: (string | number)[][] = [];
		for (const [key, value] of Object.entries(variants)) {
			if (typeof value !== 'number' || !value) continue;
			summ += value;
			prob.push([key, summ]);
		}
		//console.log(prob, summ);

		let newTile: string = '';
		let rndProb = Math.random() * summ;
		for (const [key, value] of prob) {
			if (typeof value === 'number' && typeof key === 'string' && rndProb < value) {
				//console.log(value, rndProb);
				newTile = key;
				break;
			}
		}

		this.#buffer[currCoord.x + currCoord.y * this.#x] = newTile;
		const rndAdjacent = Terrain.#adjacent.sort(() => Math.random() - 0.5);
		for (const [dx, dy] of rndAdjacent) {
			if (currCoord.x + dx < 0 || currCoord.x + dx >= this.#x ||
				currCoord.y + dy < 0 || currCoord.y + dy >= this.#y) continue;
			if (this.#buffer[currCoord.x + dx + (currCoord.y + dy) * this.#x] !== '-') continue;
			this.#queue.push({ x: currCoord.x + dx, y: currCoord.y + dy, d: newTile });
		}
		//console.log(this.#queue);

		return this.#setTile();
	}

	get text(): string {
		// \x1b[32m - green, \x1b[38;5;94m - brown, \x1b[38;5;190m - yellow, \x1b[34m - blue
		const colors = {
			'~': '\x1b[34m',
			'.': '\x1b[38;5;190m',
			'p': '\x1b[32m',
			'M': '\x1b[38;5;94m',
		};
		
		this.#text = '';
		let curr = '';

		for (let i = 0; i < this.#buffer.length; i++) {
			if (curr !== this.#buffer[i]) {
				curr = this.#buffer[i];
				this.#text += colors[curr];
			}

			this.#text += (this.#buffer[i]).repeat(2);
			if (!((i + 1) % this.#x)) this.#text += `
`;
		}

		this.#text += '\x1b[0m';

		return this.#text;
	}
}