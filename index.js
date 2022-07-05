var config = {
    gameAreaSize : 256,
    tankSpeed : 1,
    tankSize : 32,
    bulletSpeed : 4,
    bulletSize : 8,
    reloadTime : 1000,
}

var tank1;
var tank2;
var bullet1;
var bullet2;

window.onload = function () {
    startGame();
}

function startGame() {
    tank1 = new tank(0, 0, 1);
    tank2 = new tank(config.gameAreaSize - config.tankSize, config.gameAreaSize - config.tankSize, 2);
    bullet1 = new bullet(-10, -10, "left");
    bullet2 = new bullet(-10, -10, "left");
    gameArea.start();
}

var gameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = config.gameAreaSize;
        this.canvas.height = config.gameAreaSize;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            gameArea.keys = (gameArea.keys || []);
            gameArea.keys[e.keyCode] = (e.type == "keydown" );
        })
        window.addEventListener('keyup', function (e) {
            gameArea.keys[e.keyCode] = (e.type == "keydown");
        })
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function tank(x, y, id) {
    this.id = id;
    this.width = config.tankSize;
    this.height = config.tankSize;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    if (id == 1) {
        this.view = "left";
        this.image = new Image();
        this.image.src = "asset/tank_player1_left.png";
    }else if(id == 2){
        this.view = "right";
        this.image = new Image();
        this.image.src = "asset/tank_basic_right.png";
    };
    this.update = function () {
        ctx = gameArea.context;
        ctx.drawImage(this.image,
            this.x,
            this.y,
            this.width, this.height);
    };
    this.newPos = function () {
        //checkIntersect
        let check = false;
        if(this.id==1){
            check = checkIntersect(this.x+this.speedX, this.y+this.speedY, this.width, this.height, tank2.x, tank2.y, tank2.width, tank2.height);
        }
        if(this.id==2){
            check = checkIntersect(this.x+this.speedX, this.y+this.speedY, this.width, this.height, tank1.x, tank1.y, tank1.width, tank1.height);
        }

        if(check==false){
            this.x += this.speedX;
            this.y += this.speedY;
            
            // end of map
            this.x = Math.min(Math.max(this.x, 0), config.gameAreaSize-config.tankSize);
            this.y = Math.min(Math.max(this.y, 0), config.gameAreaSize-config.tankSize);
        }
    };
}

function bullet(x, y, view){
    this.loading = false;
    this.lastFire = 0;
    this.x = x;
    this.y = y;
    this.width = config.bulletSize;
    this.height = config.bulletSize;
    this.view = view;
    this.image = new Image();
    this.update = function () {
        ctx = gameArea.context;
        ctx.drawImage(this.image,
            this.x, this.y,
            this.width, this.height);
    };
    this.newPos = function(){
        this.image.src = "asset/bullet_"+this.view+".png";
        if(this.view == "left"){
            this.x -= config.bulletSpeed;
        }else if(this.view == "up"){
            this.y -= config.bulletSpeed;
        }else if(this.view == "right"){
            this.x += config.bulletSpeed;
        }else if(this.view == "down"){
            this.y += config.bulletSpeed;
        }

        //checkIntersect
        let check = false;
        if(checkIntersect(this.x, this.y, this.width, this.height, tank1.x, tank1.y, tank1.width, tank1.height)==true){
            alert("tank2 win!");
            startGame();
            window.location.reload();
        }
        if(checkIntersect(this.x, this.y, this.width, this.height, tank2.x, tank2.y, tank2.width, tank2.height)==true){
            alert("tank1 win!");
            startGame();
            window.location.reload();
        }
    }
}

function updateGameArea() {
    gameArea.clear();

    //tank1
    tank1.speedX = 0;
    tank1.speedY = 0;
    if (gameArea.keys && gameArea.keys[37]) { move("left", 1); }
    else if (gameArea.keys && gameArea.keys[38]) { move("up", 1); }
    else if (gameArea.keys && gameArea.keys[39]) { move("right", 1); }
    else if (gameArea.keys && gameArea.keys[40]) { move("down", 1); }
    tank1.newPos();
    tank1.update();
    
    //tank2
    tank2.speedX = 0;
    tank2.speedY = 0;
    if (gameArea.keys && gameArea.keys[65]) { move("left", 2); }
    else if (gameArea.keys && gameArea.keys[87]) { move("up", 2); }
    else if (gameArea.keys && gameArea.keys[68]) { move("right", 2); }
    else if (gameArea.keys && gameArea.keys[83]) { move("down", 2); }
    tank2.newPos();
    tank2.update();

    //bullet1
    if (gameArea.keys && gameArea.keys[76]) {
        if((currentTime()-bullet1.lastFire) > config.reloadTime){
            bullet1.loading = false;
        }
        if(bullet1.loading == false){
            bullet1.x = tank1.x;
            bullet1.y = tank1.y;
            bullet1.view = tank1.view;
            bullet1.loading = true;
            bullet1.lastFire = currentTime();
            if(bullet1.view=="up"){
                bullet1.x += tank1.width/2 - bullet1.width/2;
                bullet1.y -= bullet1.height;
            }else if(bullet1.view=="down"){
                bullet1.x += tank1.width/2 - bullet1.width/2;
                bullet1.y += tank1.height;
            }else if(bullet1.view == "left"){
                bullet1.x -= bullet1.width;
                bullet1.y += tank1.height/2 - bullet1.height/2;
            }else if(bullet1.view == "right"){
                bullet1.x += tank1.width;
                bullet1.y += tank1.height/2 - bullet1.height/2;
            }
        }
    }
    bullet1.newPos();
    bullet1.update(); 

    //bullet2
    if (gameArea.keys && gameArea.keys[32]) {
        if(currentTime()-bullet2.lastFire>config.reloadTime){
            bullet2.loading = false;
        }
        if(bullet2.loading == false){
            bullet2.x = tank2.x;
            bullet2.y = tank2.y;
            bullet2.view = tank2.view; 
            bullet2.loading = true;
            bullet2.lastFire = currentTime();
            if(bullet2.view=="up"){
                bullet2.x += tank2.width/2 - bullet2.width/2;
                bullet2.y -= bullet2.height;
            }else if(bullet2.view=="down"){
                bullet2.x += tank2.width/2 - bullet2.width/2;
                bullet2.y += tank2.height;
            }else if(bullet2.view == "left"){
                bullet2.x -= bullet2.width;
                bullet2.y += tank2.height/2 - bullet2.height/2;
            }else if(bullet2.view == "right"){
                bullet2.x += tank2.width;
                bullet2.y += tank2.height/2 - bullet2.height/2;
            }
        }
    }
    bullet2.newPos();
    bullet2.update();
}

function move(dir, id) {
    if(id==1){
        if (dir == "up") {
            tank1.view = dir;
            tank1.image.src = "asset/tank_player1_up.png";
            tank1.speedY = -config.tankSpeed;
        }
        if (dir == "down") {
            tank1.view = dir;
            tank1.image.src = "asset/tank_player1_down.png";
            tank1.speedY = config.tankSpeed; 
        }
        if (dir == "left") {
            tank1.view = dir;
            tank1.image.src = "asset/tank_player1_left.png";
            tank1.speedX = -config.tankSpeed; 
        }
        if (dir == "right") {
            tank1.view = dir;
            tank1.image.src = "asset/tank_player1_right.png";
            tank1.speedX = config.tankSpeed; 
        }
    }else if(id == 2){
        if (dir == "up") {
            tank2.view = dir;
            tank2.image.src = "asset/tank_basic_up.png";
            tank2.speedY = -config.tankSpeed;
        }
        if (dir == "down") {
            tank2.view = dir;
            tank2.image.src = "asset/tank_basic_down.png";
            tank2.speedY = config.tankSpeed; 
        }
        if (dir == "left") {
            tank2.view = dir;
            tank2.image.src = "asset/tank_basic_left.png";
            tank2.speedX = -config.tankSpeed; 
        }
        if (dir == "right") {
            tank2.view = dir;
            tank2.image.src = "asset/tank_basic_right.png";
            tank2.speedX = config.tankSpeed; 
        }
    }
    
}

function checkIntersect(x1, y1, w1, h1, x2, y2, w2, h2){
    // return ((x1+w1 >= x2) && (x2+w2 >= x1) && (y1+w1 >= y2) && (y2+w2 >= y1));
    if((x1<x2+w2)&&(x1+w1>x2)&&(y1<y2+h2)&&(y1+h1>y2)){
        return true;
    }else{
        return false;
    }
}

function currentTime(){
    var d = new Date();
    return ((((d.getHours() * 60) + d.getMinutes()) * 60) + d.getSeconds()) * 1000 + d.getMilliseconds();
}
