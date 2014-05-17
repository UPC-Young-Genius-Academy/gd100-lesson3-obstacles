var OBSTACLE_GAP = 300;
var OBSTACLE_MARGIN = 128;
var OBSTACLE_OPENNING_HEIGHT = 150;

var pipeTexture = null;

function rectFromSprite(sprite) {
	return {
		left: sprite.position.x,
		top: sprite.position.y,
		right: sprite.position.x + sprite.width,
		bottom: sprite.position.y + sprite.height
	};
}

function detectCollision(r1, r2) {
	return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}

function GameObstacles() {
	this.allObstacles = [];
	this.score = 0;
	this.distance = renderer.width / 2 - 32;
	
	this.advanceObstacles = function(distance) {
		wrapWidth = (this.allObstacles.length) * OBSTACLE_GAP;
		
		for (i = 0; i < this.allObstacles.length; i++) {
			var obstacle = this.allObstacles[i];
			obstacle.advance(distance, wrapWidth);
		}
		
		this.distance += distance;
	};
	
	this.createObstacle = function(openning) {
		var obstacle = new Obstacle(openning);
		obstacle.adjustPosition(this.allObstacles.length * OBSTACLE_GAP + renderer.width + 200);
		this.allObstacles.push(obstacle);
	};
	
	this.hasCollision = function(bird) {
		for (i = 0; i < this.allObstacles.length; i++) {
			var obstacle = this.allObstacles[i];
			if (obstacle.hasCollision(bird)) {
				return true;
			}
		}
		
		var oldScore = this.score;
		
		this.score = Math.max(0, Math.floor((this.distance - (renderer.width + 200 - OBSTACLE_GAP)) / OBSTACLE_GAP));
		
		document.getElementById("score").innerHTML = this.score;
		if (oldScore != this.score)
		{
			score.value = this.score;
			//var scoreElement = document.getElementById("score");
			//scoreElement.value = this.score;
		}
		
		return false;
	};
}

function Obstacle(openning) {
	if (null == pipeTexture) {
		pipeTexture = PIXI.Texture.fromImage("pipe.png");
	}
	
	this.fromOpenningToPlacement = function(openning) {
		openning = Math.abs(openning) % 10;
		
		var OBSTACLE_WIDTH = 64;
		var ENTRY_HEIGHT = 64;
		
		var openningUpper = ((renderer.height - OBSTACLE_MARGIN * 2 - OBSTACLE_OPENNING_HEIGHT) * (openning / 9.0)) + OBSTACLE_MARGIN;
		var openningLower = openningUpper + OBSTACLE_OPENNING_HEIGHT;
		
		var placement = new Object();
		placement.upper = new Object();
		placement.upper.width = OBSTACLE_WIDTH;
		placement.upper.pipeHeight = openningUpper - ENTRY_HEIGHT;
		placement.upper.entryHeight = ENTRY_HEIGHT;
		placement.lower = new Object();
		placement.lower.width = OBSTACLE_WIDTH;
		placement.lower.pipeHeight = renderer.height - openningLower - ENTRY_HEIGHT;
		placement.lower.entryHeight = ENTRY_HEIGHT;
		
		return placement;
	};
	
	this.fromCoordinatesToPosition = function(coordinates) {
		var position = new Object();
		position.x = coordinates.x;
		position.y = coordinates.y;
		return position;
	};
	
	this.fromPositionToCoordinates = function(position) {
		var coordinates = new Object();
		coordinates.x = position.x;
		coordinates.y = position.y;
		return coordinates;
	};
	
	this.hasCollision = function(bird) {
		var birdRect = rectFromSprite(bird);
		var r1 = rectFromSprite(this.sprites.upper.pipe);
		var r2 = rectFromSprite(this.sprites.upper.entry);
		var r3 = rectFromSprite(this.sprites.lower.pipe);
		var r4 = rectFromSprite(this.sprites.lower.entry);
		
		return detectCollision(birdRect, r1)
			|| detectCollision(birdRect, r2)
			|| detectCollision(birdRect, r3)
			|| detectCollision(birdRect, r4);
	};
	
	this.adjustPosition = function(positionX) {
		this.sprites.upper.pipe.position.x = positionX;
		this.sprites.upper.entry.position.x = positionX;
		
		this.sprites.lower.pipe.position.x = positionX;
		this.sprites.lower.entry.position.x = positionX;
	};
	
	this.advance = function(distance, wrapWidth) {
		if (this.sprites.upper.pipe.position.x + this.sprites.upper.pipe.width - distance < 0)
		{
			distance -= wrapWidth;
		}
		
		this.sprites.upper.pipe.position.x -= distance;
		this.sprites.upper.entry.position.x -= distance;
		
		this.sprites.lower.pipe.position.x -= distance;
		this.sprites.lower.entry.position.x -= distance;
	};
	
	var placement = this.fromOpenningToPlacement(openning);
	
	this.sprites = new Object();
	this.sprites.upper = new Object();
	this.sprites.upper.pipe = loadStaticSprite(pipeTexture, placement.upper.width, placement.upper.pipeHeight, 0, 128, .25, 128);
	this.sprites.upper.entry = loadStaticSprite(pipeTexture, placement.upper.width, placement.upper.entryHeight, placement.upper.pipeHeight - 1, 128, .25, 128);
	this.sprites.upper.entry.tileScale.y = -this.sprites.upper.entry.tileScale.y;
	this.sprites.lower = new Object();
	this.sprites.lower.pipe = loadStaticSprite(pipeTexture, placement.lower.width, placement.lower.pipeHeight, renderer.height - placement.lower.pipeHeight - 1, 128, .25, 128);
	this.sprites.lower.entry = loadStaticSprite(pipeTexture, placement.lower.width, placement.lower.entryHeight, renderer.height - placement.lower.pipeHeight - 1, 128, .25, 0);	
	
	// wrap the sprites
	// project coordinates back and forth
	// perform collision detection
	// ++ detect passed pipe
}