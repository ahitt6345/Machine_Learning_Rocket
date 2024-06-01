// p5 is global context
var asteroidCount = 50;
/* we want the ship to either rotate left, rotate right, or go forward where its facing, using acceleration/velocity controls */
var Ship = function (x, y) { 
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.velocity = 0;
    this.acceleration = 0;
    this.radius = 20;
};

// we want to draw the ship. it will just be a simple triangle with another triangle for the thruster that will be drawn when the ship is accelerating
Ship.prototype.draw = function () {
    fill(255);
    stroke(0);
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    beginShape();
    vertex(0, -this.radius * 2);
    vertex(-this.radius, this.radius * 2);
    vertex(this.radius, this.radius * 2);
    endShape(CLOSE);
    if (this.acceleration > 0) {
        beginShape();
        fill(255, 0, 0);
        vertex(-this.radius / 2, this.radius * 2);
        vertex(this.radius / 2, this.radius * 2);
        vertex(0, this.radius * 2 + this.acceleration * 10);
        endShape(CLOSE);
    }
    pop();
};

// we want to update the ship's position based on its velocity and angle
Ship.prototype.update = function () {
    this.x += this.velocity * sin(this.angle);
    this.y -= this.velocity * cos(this.angle);
    this.velocity += this.acceleration;
    this.velocity *= 0.99;
    this.acceleration = 0;
};

Ship.prototype.toTuple = function () {
    return [this.x, this.y, this.angle, this.velocity];
};
var asteroids = [];
var Asteroid = function (x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius || 30;
    asteroids.push(this);
};

Asteroid.prototype.draw = function () {
    fill(255);
    stroke(0);
    ellipse(this.x, this.y, this.radius);
};

Asteroid.prototype.update = function (ship) {
    if (dist(this.x,this.y, ship.x, ship.y) < this.radius) {
        // we have collided with an asteroid. push final game state, delete all asteroids, and generate new ones. 
        // send ship back to starting position and reset velocity and angle to 0. print the stringified game states
        timer[1] = Date.now();
        gameStates.push(new GameState(ship, asteroids, goal, timer, 0));
        console.log(JSON.stringify(gameStates.map(function (gs) { return gs.toTuple(); })));
        asteroids = [];
        
        ship.x = width / 2;
        ship.y = 700;
        ship.velocity = 0;
        ship.angle = 0;
        for (var i = 0; i < asteroidCount; i++) {
            var x,y;
            do {
                x = random(50, width - 50);
                y = random(50, height - 50);
            } while (dist(x, y, goal.x, goal.y) < 75 || dist(x,y, ship.x, ship.y) < 75);
            new Asteroid(x, y);
        }
        timer = [Date.now(), -1];
    }

};

Asteroid.prototype.toTuple = function () {
    return [this.x, this.y, this.radius];
};

// This is just to specify whether AI or human is controlling the ship
var Controller = function (update) {
    this.human = true;
    this.update = update;
}

// if human, we want to listen for key presses and update the ship accordingly
var humanControllerFunction = function () {
    if (keyIsDown(LEFT_ARROW) || (keyIsPressed && key === "a")) {
        ship.angle -= 0.1;
    }
    if (keyIsDown(RIGHT_ARROW) || (keyIsPressed && key === "d")) {
        ship.angle += 0.1;
    }
    if (keyIsDown(UP_ARROW) || (keyIsPressed && key === "w")) {
        ship.acceleration = 0.1;
    }
};
var gameStates = [];
var GameState = function (ship, asteroids, goal, timer, gameWon) {
    this.ship = ship;
    this.asteroids = asteroids;
    this.goal = goal;
    this.timer = timer.slice();
    this.gameWon = gameWon || 0;
};
GameState.prototype.toTuple = function () {
    return [this.ship.toTuple(), this.asteroids.map(function (a) { return a.toTuple(); }), this.goal.toTuple(), this.timer, this.gameWon];
};

var Goal = function (x, y) {
    this.x = x;
    this.y = y;
    this.radius = 50;
}
Goal.prototype.draw = function () {
    fill(0, 255, 0);
    stroke(0);
    ellipse(this.x, this.y, 50);
};
Goal.prototype.update = function (ship) {
    if (dist(this.x, this.y, ship.x, ship.y) < this.radius - 10) {
        // we have reached the goal. push final game state, delete all asteroids, and generate new ones. 
        // send ship back to starting position and reset velocity and angle to 0. print the stringified game states
        timer[1] = Date.now();
        gameStates.push(new GameState(ship, asteroids, goal, timer, 1));
        console.log(JSON.stringify(gameStates.map(function (gs) { return gs.toTuple(); })));
        asteroids = [];
        
        ship.x = width / 2;
        ship.y = 700;
        ship.velocity = 0;
        ship.angle = 0;
        for (var i = 0; i < asteroidCount; i++) {
            var x,y;
            do {
                x = random(50, width - 50);
                y = random(50, height - 50);
            } while (dist(x, y, goal.x, goal.y) < 75 || dist(x,y, ship.x, ship.y) < 75);
            new Asteroid(x, y);
        }
        timer = [Date.now(), -1];
        
    }
};
Goal.prototype.toTuple = function () {
    return [this.x, this.y];
}
var AIControllerFunction = function () {
    // AI is not implemented yet
};



var timer = [-1,-1];
var ship;
var controller;
var goal;
var setup = function () {
    createCanvas(800, 800);
    frameRate(30);
    background(0);
    ship = new Ship(width / 2, 700);
    controller = new Controller(humanControllerFunction);
    goal = new Goal(width/2, height/2);
    ellipseMode(CENTER);
    // generate some asteroids that are not too close to the center
    for (var i = 0; i < 50; i++) {
        var x = random(50, width - 50);
        var y = random(50, height - 50);
        while (dist(x, y, goal.x, goal.y) < 75 || dist(x,y, ship.x, ship.y) < 75) {
            x = random(50, width - 50);
            y = random(50, height - 50);
        }
        new Asteroid(x, y);
    }
    // set the timer
    timer = [Date.now(), Date.now()];
};
var draw = function () {
    background(0);
    timer[1] = Date.now();
    gameStates.push(new GameState(ship, asteroids, goal, timer));
    var dt = timer[1] - timer[0]; // time derivative
    controller.update();
    ship.update();
    goal.update(ship);

    ship.draw();
    for (var i = 0; i < asteroids.length; i++) {
        asteroids[i].update(ship);
        asteroids[i].draw();
    }
    goal.draw();
}