const socket = io.connect("http://24.16.255.56:8888");

// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game) {
    this.player = 1;
    this.radius = 5;
    this.visualRadius = 500;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.red = function () {
    this.it = true;
    this.color = "#ff0000";
    this.radius = 5;
    this.visualRadius = 500;
    this.life = 1000;
};

Circle.prototype.green = function () {
    this.it = true;
    this.color = "#00ff00";
    this.radius = 5;
    this.visualRadius = 200;
    this.life = 300;
};

Circle.prototype.blue = function () {
    this.it = false;
    this.color = "#0000ff";
    this.radius = 5;
    this.visualRadius = 100;
    this.life = 10000;
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);

    this.life -= 1;

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.life <= 0){
        this.removeFromWorld = true;
    }

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
            
            if (this.color === "#ff0000" && ent.color === "#0000ff") {
                this.life = this.life + 20;
                ent.life = 0;
            }
            /*
            else if (this.color === "#00ff00" && ent.color === "#00ff00") {
                this.green();
                ent.green();
                if(Math.floor((Math.random()*10)+1) === 1 ){
                    var circle = new Circle(this.game);
                    circle.green();
                    this.game.addEntity(circle);   
                }
            }
            */
            else if (this.color === "#ff0000" && ent.color === "#ff0000") {
                var circle = new Circle(this.game);
                circle.blue();
                this.game.addEntity(circle);
                
            }
            else if (this.color == "#00ff00" && ent.color == "#0000ff"){
                ent.life = 0;
                if (Math.floor((Math.random()*4)+1) === 1){
                    var circle = new Circle(this.game);
                    circle.green();
                    this.game.addEntity(circle);
                }
            }

            else if (this.color === "#ff0000" && ent.color == "#00ff00") {
                ent.life = 0;
                this.life= this.life+50;
            }

        }

        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.it && dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (ent.it && dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};

// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    let saveButton = document.getElementById("save");
    let loadButton = document.getElementById("load");

    saveButton.onclick = function (e) {
        console.log('save pressed');
        let message = gameEngine.save();
        // console.log(message);
        socket.emit("save", message);
    };
    loadButton.onclick = function (e) {
        console.log('load pressed');
        console.log(socket);
        socket.emit("load", {studentname:"Korey Pecha", statename:"aState"});
    };
    socket.on("load", function(data) {
        console.log(data);
        let saveState = data.data;
        gameEngine.load(saveState);
    });
    socket.on("connect", function () {
        console.log("Socket connected.")
    });
    socket.on("disconnect", function () {
        console.log("Socket disconnected.")
    });
    socket.on("reconnect", function () {
        console.log("Socket reconnected.")
    });

    var gameEngine = new GameEngine();

    for( var i = 0; i < 150; i++){
        var circle = new Circle(gameEngine);
        circle.blue();
        gameEngine.addEntity(circle);
    }

    for (var i = 0; i < 150; i++){
        var circle = new Circle(gameEngine);
        circle.red();
        gameEngine.addEntity(circle);
    }

    for (var i = 0; i < 50; i++){
        var circle = new Circle(gameEngine);
        circle.green();
        gameEngine.addEntity(circle);
    }

    gameEngine.init(ctx);
    gameEngine.start();
});
