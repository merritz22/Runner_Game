let audio = document.querySelector('audio');
let canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight/2;

//creation de la zone de jeux

let main_height = 120,
    main_width = 400,
    horizontal_padd = (window.innerWidth - main_width)/2,
    vertical_padd = (window.innerHeight/2 - main_height)/2,
    sand_position_d = vertical_padd + main_height,
    sand_position = vertical_padd + main_height,
    road_enemies = [],
    fly_enemies = [],
    coins = [],
    enemies_approach = 2.5,
    coin_approach = 1.5,
    player_y,
    enemies_xx,
    player_jump,
    game_started,
    clicked,
    my_coin = 0,
    max_life = 3,
    begin_x = 0,
    min1 = min2 = 0,
    sec1 =sec2 = 0,
    main,
    ctx = canvas.getContext('2d');


const min_enemies_x = 200,
    max_enemies_x = 500;
start_play();
// fonction de demarrage du jeux pour quand on aura cliquez sur play
function start_play() {
    player_y = 0;
    enemies_xx = 0;
    clicked = false;
    player_jump = 0;
    enemies_approach = 2;//normal is 2
    game_started = false;
    for (let i = 1;i<50; i++) generate_road_enemies();
    for (let i = 1;i<50; i++) generate_coin();

    draw_element();
}

// evenmnt de jeux

window.addEventListener('load',function(){
    window.addEventListener('click',function () {
        // this.alert(sand_position_d +' //// '+ sand_position)
        if (sand_position_d >= sand_position) {
            clicked = true;   
        }       
    })
    if(!game_started){
        audio.src = "view/sound/Windless Slopes.mp3";
        audio.play();
        game_started = true;
        main = requestAnimationFrame(animate);
    }
});

function speed() {
    if (min2 == 1) {
        coin_approach = 1.5;
        enemies_approach = 2.7;
    }else if (min2 == 2) {
        coin_approach = 1.6;
        enemies_approach = 2.9;
    }else if (min2 == 3) {
        coin_approach = 1.7;
        enemies_approach = 2.9;
    }else if (min2 == 4) {
        coin_approach = 1.8;
        enemies_approach = 3;
    }else if (min2 == 5) {
        coin_approach = 1.9;
        enemies_approach = 3.2;
    }else if (min2 > 5) {
        coin_approach = 2;
        enemies_approach = 3.5;
    }
}

function animate() {
    const jump_force = 0.3;
    // alert(clicked)
    speed();
    if (clicked) {
        // j'ai sauté
        if (sand_position_d - player_jump > sand_position - 95) {
            player_jump += jump_force;
            sand_position_d -= player_jump;
        }else{
            // alert('f44')
            clicked = false;
        }
    }else{
        if (sand_position_d <= sand_position) {
            player_jump = 0;
            sand_position_d += jump_force*5;
        }
    }

    //deplacements enemies
    for (let i = 0; i < road_enemies.length; i++) {
        road_enemies[i].enemies_x -= enemies_approach;
        if ( road_enemies[i].enemies_x >= horizontal_padd && road_enemies[i].enemies_x <= horizontal_padd + 48) {
            // alert('ok');
            if ( (sand_position_d >= (sand_position -30)) ) {
                // on doit arreter le jeux car il a perdue
                if (max_life < 2) {
                    alert("You have lost IDIOT !!!");
                    document.querySelector('canvas').remove();
                }
                max_life -=1;
                clear_life();
                road_enemies[i].enemies_x = -40;
            }
        }
    }


    //deplacements des pieces
    for (let i = 0; i < coins.length; i++) {
        // alert(coins[i].coin_x);
        coins[i].coin_x -= coin_approach;
        if ( coins[i].coin_x >= horizontal_padd && coins[i].coin_x <= horizontal_padd + 48) {
            // alert('ok');
            if ((sand_position_d >= (sand_position -30)) ) {
                // on doit augmentez le stock de pieces
                my_coin += 10;
                coins[i].coin_x= -30;
                generate_coin();
                draw_coin_jauge();
            }
        }
    }

    //chargement et dechargement d'enemies
    if(road_enemies[0].enemies_x < -40){
        //on retire l'element en tete
        road_enemies.shift();
        //on insere un nouvelle element en queue
        generate_road_enemies();
    }

    if(coins[0].coin_x < -40){
        //on retire l'element en tete
        coins.shift();
        //on insere un nouvelle element en queue
        generate_coin();
    }

    begin_x -=1;

    main = requestAnimationFrame(animate);
}

function draw_element() {
    // on nettoie la scene
    ctx.clearRect(0,0,window.innerWidth,window.innerHeight/2);

    // on sauvegarde l'etat avant la transformation
    ctx.save();

    //  et on deplace le curseur
    ctx.translate(horizontal_padd, sand_position);

    // on dessine ce que l'on veut
    draw_road();
    draw_coin();
    draw_road_enemies();
    dino();
    draw_coin_jauge();
    draw_live_bar();
    timer();

    //reset transformation pour restorer le dernier etat sauvegarder
    ctx.restore();
}



//insertion du dino Merritz
function dino() {
    // les sprites representent respec la taille de chaque img dans 
    // le sprite
    let sprite_W = 24,
        sprite_H = 22,
        dino_pic = document.createElement('img');
    dino_pic.addEventListener('load',function(){
        let cycle = 5;
        setInterval(function () {
            ctx.clearRect(horizontal_padd, sand_position_d, sprite_W*4, sprite_H*4+20);
            ctx.save();
            ctx.translate(horizontal_padd, sand_position_d -6);
            ctx.drawImage(dino_pic,
                //debut du rectangle a decoupez
                cycle*sprite_W, 0, sprite_W, sprite_H,
                //rectangle de destination
                0, 0, sprite_W*4-9, sprite_H*4);
            if (cycle < 5 || cycle >9) {
                cycle = 5;
            }else{
                cycle ++;
            }
            ctx.restore();
        }, 80)
    })
    dino_pic.src = "view/sheets/DinoSprites - vita.png";
}

//dessin du background
function draw_coin_jauge() {
   const xpos = 0,
        ypos  = 10,
        bar_width = 150,
        bar_height = 50,
        i_coin_x = 30,
        i_coin_y = 30,
        jauge_bar = document.createElement('img'),
        coin_in_bar = document.createElement('img');
    jauge_bar.addEventListener('load',function(){
        ctx.save();
        ctx.translate(xpos ,ypos);
        ctx.clearRect(0,0,bar_width,bar_height);
        ctx.drawImage(jauge_bar,
            0,0,jauge_bar.width,jauge_bar.height,
            0,0,bar_width,bar_height);
        ctx.restore();
        coin_in_bar.src = "view/sheets/CoinIcon.png";
        draw_text_score();
    })
    coin_in_bar.addEventListener('load',function () {
        ctx.save();
        ctx.translate(xpos + 5, ypos + 10);
        // ctx.clearRect(0,0,i_coin_x,i_coin_y);
        ctx.drawImage(coin_in_bar,
            0,0,coin_in_bar.width,coin_in_bar.height,
            0,0,i_coin_x,i_coin_y);
        ctx.restore();
    })
    jauge_bar.src = "view/sheets/EmptyScoreBar.png";
}
function draw_text_score() {
    ctx.font = '30px helvetica';
    ctx.fillStyle = "#00ff00";
    ctx.fillText(my_coin,40,47);
}

function draw_live_bar() {
    const xpos = window.innerWidth - 200,
        ypos  = 10,
        heart_width = 50,
        heart_height = 50,
        heart_img1 = document.createElement('img'),
        heart_img2 = document.createElement('img'),
        heart_img3 = document.createElement('img');
    heart_img1.addEventListener('load',function () {
        ctx.save();
        ctx.translate(xpos,ypos);
        ctx.drawImage(heart_img1,
            0,0,heart_img1.width,heart_img1.height,
            0,0,heart_width,heart_height);
        ctx.restore();
    })
    heart_img2.addEventListener('load',function () {
        ctx.save();
        ctx.translate(xpos+65,ypos);
        ctx.drawImage(heart_img2,
            0,0,heart_img2.width,heart_img2.height,
            0,0,heart_width,heart_height);
        ctx.restore();
    })
    heart_img3.addEventListener('load',function () {
        ctx.save();
        ctx.translate(xpos+130,ypos);
        ctx.drawImage(heart_img3,
            0,0,heart_img3.width,heart_img3.height,
            0,0,heart_width,heart_height);
        ctx.restore();
    })
    heart_img1.src = "view/sheets/HeartIcon.png";
    heart_img2.src = 'view/sheets/HeartIcon.png';
    heart_img3.src = "view/sheets/HeartIcon.png";
}

function clear_life() {
    let xpos = window.innerWidth - 200,
        ypos = 10;
    if (max_life == 2) {
        ctx.save();
        ctx.translate(xpos,ypos);
        ctx.clearRect(0,0, 50, 50);
        ctx.restore();
    }else if (max_life == 1) {
        ctx.save();
        ctx.translate(xpos + 65,ypos);
        ctx.clearRect(0,0, 50, 50);
        ctx.restore();
    }else {
        ctx.save();
        ctx.translate(xpos + 130,ypos);
        ctx.clearRect(0,0, 50, 50);
        ctx.restore();
    }
}

function timer() {
    const xpos = window.innerWidth/2 -25,
        ypos  = 10,
        timer_width = 25,
        timer_height = 25,
        timer_img = document.createElement('img');
    timer_img.addEventListener('load',function () {
        ctx.save();
        ctx.translate(xpos,ypos);
        ctx.clearRect(0,0,70,50);
        ctx.drawImage(timer_img,
            0,0,timer_img.width,timer_img.height,
            0,0,timer_width,timer_height);
        ctx.restore();
        setInterval(() => {
            draw_time();
            if (sec2 + 1 == 10) {
                sec1 +=1;
                sec2 = 0;
            }else if (sec1 + 1 == 7) {
                min2 += 1;
                sec1 = 0;
            }else if (min2 + 1 == 10) {
                min1 += 1;
                min2 = 0;
            }else{
                sec2 +=1;
            }
        }, 1000);
    })
    timer_img.src = "view/sheets/TimerIcon.png";
}

function draw_time() {
    let text = min1+""+min2+":"+sec1+""+sec2;
    ctx.save();
    ctx.translate(window.innerWidth/2 -50,60);
    ctx.clearRect(0,0,150,-25);
    ctx.font = '30px helvetica';
    ctx.strokeText(text,0,0);
    ctx.restore();
}


//Dessin de la route
function draw_road() {
    let sprite_H = 32,
        sprite_W = 16,
        road_pic = document.createElement('img');
    road_pic.addEventListener('load',function () {
        setInterval(() => {
            ctx.save();
            ctx.translate(0, sand_position + 80.5);
            for (let i = 0; i < window.innerWidth; i += 16) {    
                ctx.drawImage(road_pic,
                    //debut du rectangle a decoupez
                    16, 3, sprite_W, sprite_H,
                    //rectangle de destination
                    i, 0, sprite_W, sprite_H);
            }
            ctx.restore();
        }, 10);
    })
    road_pic.src = "view/sheets/tilesetplain_16x16.png";
}

//generation de pieces

function generate_coin(){
    let min_coin_x = 200,
        max_coin_x = 1000,
        coin_x = coins.length 
            ? coins[coins.length - 1].coin_x +
                min_coin_x + 
                Math.floor(Math.random()*(max_coin_x - min_coin_x))
            : min_coin_x + 100;
    coins.push({coin_x}); 
}

function draw_coin() {
    let coin = document.createElement('img');
    for (let i = 0; i < coins.length; i++) {
            coin.addEventListener('load',function () {
                let cycle = 5;
                setInterval(() => {
                    ctx.clearRect(coins[i].coin_x , sand_position +50, (coin.width)/cycle + 10, (coin.height)/cycle + 5)
                    ctx.save();
                    ctx.translate(coins[i].coin_x , sand_position +50);
                    ctx.drawImage(coin, 0, 0, (coin.width)/cycle, (coin.height)/cycle);

                    ctx.restore();
                }, 50);
            })
            coin.src = "view/sheets/CoinIcon.png";
    }
}

//generation des enemies


//generations des enemies terrestres
function generate_road_enemies() {

    let enemies_x = road_enemies.length
        ? road_enemies[road_enemies.length -1].enemies_x +
            min_enemies_x + 
            Math.floor(Math.random()*(max_enemies_x - min_enemies_x))
        : min_enemies_x + 400;
    road_enemies.push({enemies_x});
}

//insertion des enemies dans la scene

//enemies terrestres
function draw_road_enemies() {
    let sprite_W = 36,
        sprite_H = 30,
        s_img = document.createElement('img');
    for (let i = 0; i < road_enemies.length; i++) {
        s_img.addEventListener('load',function(){
            // alert(road_enemies[i].img);
            let cycle = 0;
            setInterval(function () {
                ctx.clearRect(road_enemies[i].enemies_x, sand_position + 50, sprite_W+25, sprite_H);
                ctx.save();
                ctx.translate(road_enemies[i].enemies_x, sand_position + 51);
                ctx.drawImage(s_img,
                    //debut du rectangle a decoupez
                    cycle*sprite_W, 0, sprite_W, sprite_H,
                    //rectangle de destination
                    0, 0, sprite_W, sprite_H);
                if (cycle < 0 || cycle >10) {
                    cycle = 0;
                }else{
                    cycle ++;
                }
                ctx.restore();
            }, 50)
        })
        s_img.src = "view/obstacle/AngryPig/Run (36x30).png";
    }
}

//environemment

//generation d'arbres

//generation de maisons