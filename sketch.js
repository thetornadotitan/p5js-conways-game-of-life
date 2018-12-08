let canvas;
let container;

let inputs;

let slider;
let sliderDiv;
let sliderVal;

let playButton;

let grid;
let gridSize = 15;
let gridResolution;

let playing;
let touching;

function setup() {
	container = select("#canvasTarget");
	canvas = createCanvas(container.width, container.width);
	canvas.parent(container);
	createInputs();
	setupGrid();
	stroke(0);
}

function draw() {
	let nextGrid = Create2DArray(gridSize, gridSize);

	//calc next grid
	for (let x = 0; x < gridSize; x++) {
		for (let y = 0; y < gridSize; y++) {

			nextGrid[x][y] = grid[x][y];

			if (playing) {

				let liveCount = getLiveNeighborCount(x, y);

				//console.log(`${x}, ${y} == ${grid[x][y]} in the draw loop`);

				if (grid[x][y] === 1 && (liveCount < 2 || liveCount > 3)) {
					nextGrid[x][y] = 0;
					//console.log(`dies`);
				}

				if (grid[x][y] === 0 && liveCount === 3) {
					nextGrid[x][y] = 1;
					//console.log(`lives`);
				}

			}

		}
	}

	//if (playing) playPress();

	RenderGridDifferences(grid, nextGrid);
	grid = nextGrid
}

function getLiveNeighborCount(x, y) {
	let result = 0;

	//console.log(`${x}, ${y}:`);

	for (let i = -1; i <= 1; i++) {
		for (let j = -1; j <= 1; j++) {
			let fx = (x + i + gridSize) % gridSize;
			let fy = (y + j + gridSize) % gridSize;
			//console.log(`--${fx}, ${fy} == ${grid[fx][fy]}`);
			result += grid[fx][fy];
		}
	}

	result -= grid[x][y];
	//console.log(`${result} for : ${x}, ${y}`);
	return result;
}

function RenderGridDifferences(grid1, grid2) {
	for (let x = 0; x < gridSize; x++) {
		for (let y = 0; y < gridSize; y++) {
			if (grid1[x][y] != grid2[x][y]) {
				fill(GetGridColor(grid2[x][y]));
				rect(x * gridResolution, y * gridResolution, gridResolution, gridResolution);
			}
		}
	}
}

function RenderGrid() {
	for (let x = 0; x < gridSize; x++) {
		for (let y = 0; y < gridSize; y++) {
			fill(GetGridColor(grid[x][y]));
			rect(x * gridResolution, y * gridResolution, gridResolution, gridResolution);
		}
	}
}

function mousePressed() {
	if (mouseButton == LEFT) {
		let x = Math.floor(mouseX / gridResolution);
		let y = Math.floor(mouseY / gridResolution);
		if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
			let previousGrid = Create2DArrayCopy(grid);
			grid[x][y] = Math.abs(grid[x][y] - 1);
			RenderGridDifferences(previousGrid, grid);
		}
	}
}

function Create2DArray(cols, rows) {
	let result = [];
	for (let x = 0; x < cols; x++) {
		result.push([]);
		for (let y = 0; y < rows; y++) {
			result[x].push(0);
		}
	}
	return result;
}

function Create2DArrayCopy(grid) {
	let result = Create2DArray(gridSize, gridSize);
	for (let x = 0; x < gridSize; x++) {
		for (let y = 0; y < gridSize; y++) {
			result[x][y] = grid[x][y];
		}
	}
	return result;
}

function GetGridColor(val) {
	let c;

	switch (val) {
		case 0:
			c = color(0);
			break;
		case 1:
			c = color(255);
			break;
		default:
			c = color(255, 0, 0);
			break;
	}

	return c;
}

function windowResized() {
	container = select("#canvasTarget");
	canvas.resize(container.width, container.width);
	canvas.parent(container);

	setupGrid();
}

function setupGrid() {
	playButton.elt.innerHTML = "Play";
	playing = false;
	gridResolution = width / gridSize;
	grid = Create2DArray(gridSize, gridSize);
	for (let x = 0; x < gridSize; x++) {
		for (let y = 0; y < gridSize; y++) {
			grid[x][y] = Math.round(Math.random());
		}
	}
}

function createInputs() {
	inputs = select("#inputField");

	touching = false;

	//gridSize Slider
	sliderDiv = createDiv("");
	sliderDiv.parent(inputs);
	sliderVal = createSpan(`Grid Size : ${gridSize} x ${gridSize}`);

	slider = createSlider(10, 150, gridSize);
	slider.parent(sliderDiv);
	slider.elt.oninput = ((e) => {
		let value = Math.floor(slider.value());
		sliderVal.elt.innerHTML = `Grid Size : ${value} x ${value}`;
		gridSize = value;
		windowResized();
	})

	sliderVal.parent(sliderDiv);

	//Play / Pause Button
	playButton = createButton("Play");
	playButton.mousePressed((e) => {
		playPress();
	});
	playButton.parent(inputs);
}

function playPress() {
	playing = !playing;
	if (playing) {
		RenderGrid();
		playButton.elt.innerHTML = "Pause";
	} else {
		playButton.elt.innerHTML = "Play";
	}
}