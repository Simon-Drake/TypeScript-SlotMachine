var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Spark } from './Spark.js';
import { Game } from './Game.js';
import { Star } from './Star.js';
import { Dim } from './Dimensions.js';
import { Arithmetic } from './Arithmetic.js';
/**
 * Class related to drawing
 */
export class Draw {
    /**
     * Initialising the Canvas
     * @param el Canvas element
     * @param game Game object
     */
    static init(el, game) {
        // Load fonts and images first
        Draw.loadFonts();
        Draw.loadImages();
        // Make references and update state
        Draw.ctx = el.getContext("2d");
        Draw.game = game;
        Draw.dim = new Dim(el);
        Draw.game.state = Game.states["ZERO_SPINS"];
        // Event listener for window resize
        window.addEventListener('resize', function () {
            Draw.sparks = [];
            Draw.dim.sizeCanvas();
            Draw.drawImages();
            Draw.glowInterv = setInterval(Draw.generateSparks, 450);
            Draw.flashInterv = setInterval(Draw.flashSpin, 500);
        });
        // Click event listener
        el.addEventListener('click', function (e) {
            if (Draw.game.state == Game.states["ZERO_SPINS"] || Draw.game.state == Game.states["SPUN"])
                Draw.intersectButton(e.offsetX, e.offsetY);
            if (Draw.game.state == Game.states["LOST"])
                Draw.intersectReplay(e.offsetX, e.offsetY);
        });
        // Set animation intervals
        Draw.lightsInterv = setInterval(function () {
            Draw.dim.changeLights();
            Draw.drawLights();
        }, 1000);
        Draw.glowInterv = setInterval(Draw.generateSparks, 450);
        Draw.flashInterv = setInterval(Draw.flashSpin, 500);
    }
    //---------- LOAD ASSETS --------//
    /**
     * Method that loads images
     * Once all images loaded calls the draw method
     * Not async because it we need the images before doing anything else
     */
    static loadImages() {
        this.lights.src = '../../images/leds_safe_dial_minigame.png';
        this.backg.src = '../../images/background_safe_minigame.png';
        this.safe.src = '../../images/safe_minigame.png';
        this.screen.src = '../../images/screen_safe_minigame.png';
        this.suppDial.src = '../../images/support_safe_dial_minigame.png';
        this.sparkSafe.src = '../../images/spark_safe.png';
        this.dial.src = '../../images/safe_dial_minigame.png';
        this.spin.src = '../../images/text_spin_safe_dial_minigame.png';
        this.safeOpen.src = '../../images/safe_open_minigame.png';
        this.coin.src = '../../images/coins.png';
        this.marker.src = '../../images/marker.png';
        this.ring.src = '../../images/ring.png';
        this.notes.src = '../../images/notes.png';
        this.gold.src = '../../images/gold.png';
        this.dia.src = '../../images/diamond.png';
        this.winScr.src = '../../images/screen_safe_win.png';
        this.star.src = '../../images/star.png';
        this.panelBackg.src = '../../images/display_panel_background.png';
        this.screenBackg.src = '../../images/screen_safe_background.png';
        this.backg.onload = this.dial.onload = this.lights.onload = this.safe.onload = this.suppDial.onload = this.coin.onload =
            this.ring.onload = this.notes.onload = this.spin.onload = this.safeOpen.onload = this.screen.onload = this.sparkSafe.onload =
                this.gold.onload = this.dia.onload = this.winScr.onload = this.marker.onload = this.star.onload = this.panelBackg.onload =
                    this.screenBackg.onload = Draw.counter;
    }
    /**
     * Async font loading method
     */
    static loadFonts() {
        return __awaiter(this, void 0, void 0, function* () {
            const unl = new FontFace('unlocked', 'url(../../src/fonts/TitanOne-Regular.ttf)');
            const inst = new FontFace('instructions', 'url(../../src/fonts/Dimbo-Italic.ttf)');
            yield Promise.all([unl.load(), inst.load()]);
            document.fonts.add(unl);
            document.fonts.add(inst);
            Draw.fontsLoaded = true;
            // Once the fonts are loaded write instructions
            Draw.writeWords(Dim.instFontSize);
        });
    }
    //---------- CLICK HANDLERS --------// 
    /**
     * Checks if a click intersects the spin button
     * Handles button click
     * @param x x coord of mouse click
     * @param y y coord of mouse click
     */
    static intersectButton(x, y) {
        let inside = Math.sqrt(Math.pow((Draw.dim.centrDial[0] - x), 2) + Math.pow((Draw.dim.centrDial[1] - y), 2)) < Draw.dim.radiusSpin;
        if (inside) {
            // Update runtime variables
            Draw.game.state = Game.states["SPINNING"];
            Draw.spinOn = false;
            Draw.game.spins += 1;
            Draw.sparks = [];
            // Clear sparks and button
            clearInterval(Draw.glowInterv);
            clearInterval(Draw.flashInterv);
            Draw.drawBackgroundAndSupport();
            // Introduce some stochasticity to the spin
            let state;
            let antiClockwise = Math.round(Math.random()) * Math.random() * Math.PI;
            antiClockwise
                ? state = 0
                : state = 1;
            Draw.spinWheel(Draw.currentRot, antiClockwise, -Arithmetic.degToRadians(360 / 9 * Arithmetic.getRandomInt(9)), Arithmetic.degToRadians(360 / 9 * Arithmetic.getRandomInt(9)), state);
            // Write spinning
            Draw.writeWords(Dim.headrFontSize);
        }
    }
    /**
     * Reloads game
     * @param x x coord of mouse
     * @param y y coord of mouse
     */
    static intersectReplay(x, y) {
        if (x > Draw.dim.width / 4 && x < Draw.dim.width / 4 * 3 && y > Draw.dim.height / 3 && y < Draw.dim.height / 3 * 2)
            location.reload();
    }
    //---------- ANIMATIONS --------//
    /**
     * Method to handle the spinning of the wheel
     * @param rotation current rotation
     * @param antiClockwise Initial anticlockwise spin (50% chance)
     * @param clockwise Clockwise spin
     * @param antiClockwise2 Final anticlockwise spin to final position
     * @param state State of the spin
     */
    static spinWheel(rotation, antiClockwise, clockwise, antiClockwise2, state) {
        switch (state) {
            case 0: {
                rotation += 0.05;
                Draw.rotate(rotation, 0);
                rotation >= antiClockwise
                    ? setTimeout(function () { Draw.spinWheel(rotation, antiClockwise, clockwise, antiClockwise2, state + 1); }, 20)
                    : setTimeout(function () { Draw.spinWheel(rotation, antiClockwise, clockwise, antiClockwise2, state); }, 20);
                break;
            }
            case 1: {
                rotation -= 0.05;
                Draw.rotate(rotation, 0);
                rotation <= clockwise
                    ? setTimeout(function () { Draw.spinWheel(rotation, antiClockwise, clockwise, antiClockwise2, state + 1); }, 20)
                    : setTimeout(function () { Draw.spinWheel(rotation, antiClockwise, clockwise, antiClockwise2, state); }, 20);
                break;
            }
            case 2: {
                rotation += 0.05;
                if (rotation >= antiClockwise2) {
                    Draw.rotate(antiClockwise2, 0);
                    Draw.evaluateScore(antiClockwise2);
                }
                else {
                    Draw.rotate(rotation, 0);
                    setTimeout(function () { Draw.spinWheel(rotation, antiClockwise, clockwise, antiClockwise2, state); }, 20);
                }
                break;
            }
        }
    }
    /**
     *  Draw star particls for win
     * @param move boolean to determine if we update the position of stars
     *             - needed when drawing stars out of interval
     */
    static drawStars(move) {
        // Draw everything under the stars
        Draw.fillCanvasColour();
        Draw.drawImages();
        Draw.winSpin(0, false);
        Draw.drawLights();
        Draw.writeWords(Dim.winScrnFontSize);
        // Delete star if out of range
        // or update its position
        for (let i = 0; i < Draw.stars.length; i++) {
            if (Draw.stars[i]) {
                if (Draw.stars[i].distanceFromSource >= Dim.maxStarDistance) {
                    delete Draw.stars[i];
                }
                else {
                    if (move) {
                        Draw.stars[i].x += Draw.stars[i].dx;
                        Draw.stars[i].y += Draw.stars[i].dy;
                        Draw.stars[i].rotation += Draw.stars[i].drotation;
                        Draw.stars[i].distanceFromSource = Math.sqrt(Math.pow((Draw.stars[i].x - Draw.stars[i].source[0]), 2) + Math.pow((Draw.stars[i].y - Draw.stars[i].source[1]), 2));
                    }
                    Draw.rotateStar(Draw.stars[i]);
                }
            }
        }
        // Locals to improve readability and maintenance
        let image = Draw.winImage;
        let s1x = Draw.dim.ratios[Draw.game.winSafesStrings[0]][0] * Draw.dim.width + Dim.priseXTrans * Draw.dim.shrink;
        let s1y = Draw.dim.ratios[Draw.game.winSafesStrings[0]][1] * Draw.dim.height + Dim.priseYTrans * Draw.dim.shrink;
        let s2x = Draw.dim.ratios[Draw.game.winSafesStrings[1]][0] * Draw.dim.width + Dim.priseXTrans * Draw.dim.shrink;
        let s2y = Draw.dim.ratios[Draw.game.winSafesStrings[1]][1] * Draw.dim.height + Dim.priseYTrans * Draw.dim.shrink;
        let scale = Draw.scale;
        Draw.ctx.drawImage(image, Draw.dim.winImageSX, 0, image.width / 2, image.height, s1x - image.width * (scale - 1) / 4, s1y - image.height * (scale - 1) / 2, scale * image.width * Draw.dim.shrink / 2, scale * image.height * Draw.dim.shrink);
        Draw.ctx.drawImage(image, Draw.dim.winImageSX, 0, image.width / 2, image.height, s2x - image.width * (scale - 1) / 4, s2y - image.height * (scale - 1) / 2, scale * image.width * Draw.dim.shrink / 2, scale * image.height * Draw.dim.shrink);
        if (Draw.dim.winImageSX > 0) {
            Draw.drawMultiplier(Draw.game.boxes[Draw.game.winSafes[0]], Draw.game.winSafesStrings[0]);
            Draw.drawMultiplier(Draw.game.boxes[Draw.game.winSafes[1]], Draw.game.winSafesStrings[1]);
        }
    }
    static evaluateScore(rotation) {
        Draw.currentRot = rotation;
        Draw.game.result = Arithmetic.getResult(rotation);
        if (Draw.game.unlockedSafes.indexOf(Draw.game.result) === -1) {
            Draw.game.unlockedSafes.push(Draw.game.result);
            Draw.openSafe(Draw.game.result);
            Draw.game.assessWin(Draw.game.boxes[Draw.game.result])
                ? setTimeout(function () { Draw.implementWin(); }, 2000)
                : Draw.redDial(0);
        }
        else {
            Draw.glowInterv = setInterval(Draw.generateSparks, 450);
            Draw.flashInterv = setInterval(Draw.flashSpin, 500);
        }
        Draw.writeWords(110);
    }
    static implementWin() {
        Draw.game.state = Game.states["WON"];
        Draw.sparks = [];
        clearInterval(Draw.glowInterv);
        clearInterval(Draw.flashInterv);
        setInterval(function () { Draw.winSpin(0.18, true); }, 35);
        Draw.game.setWinSafes();
        Draw.winImage = Draw.mapMultiplierToImage(Draw.game.boxes[Draw.game.winSafes[0]]);
        Draw.starParticles();
        setInterval(function () { Draw.drawStars(true); }, 100);
        setInterval(function () { Draw.dim.changeSX(Draw.winImage.width); }, 500);
        setTimeout(function () { setInterval(function () { Draw.changeScale(); }, 30); }, 3000);
        setInterval(function () { Draw.starParticles(); }, 2500);
    }
    static changeScale() {
        Draw.scale += 0.05 * Draw.scaleDir;
        if (Draw.scale > 1.4)
            Draw.scaleDir = -1;
        if (Draw.scale <= 1)
            Draw.scaleDir = +1;
    }
    static starParticles() {
        Draw.game.winSafesStrings[0] = "safe" + Draw.game.winSafes[0].toString();
        Draw.game.winSafesStrings[1] = "safe" + Draw.game.winSafes[1].toString();
        for (let i = 0; i < 8; i++) {
            Draw.stars.push(new Star(Draw.dim.ratios[Draw.game.winSafesStrings[0]][0] * Draw.dim.width + Dim.starXTrans * Draw.dim.shrink, Draw.dim.ratios[Draw.game.winSafesStrings[0]][1] * Draw.dim.height + Dim.starYTrans * Draw.dim.shrink, 20 + 80 * Math.random()));
            Draw.stars.push(new Star(Draw.dim.ratios[Draw.game.winSafesStrings[1]][0] * Draw.dim.width + Dim.starXTrans * Draw.dim.shrink, Draw.dim.ratios[Draw.game.winSafesStrings[1]][1] * Draw.dim.height + Dim.starYTrans * Draw.dim.shrink, 20 + 80 * Math.random()));
        }
    }
    static fillCanvasColour() {
        Draw.ctx.fillStyle = 'silver';
        Draw.ctx.fillRect(0, 0, Draw.dim.width, Draw.dim.height);
        Draw.ctx.fillStyle = 'black';
    }
    static drawMultiplier(multiple, safe) {
        let fontSize = 65 * Draw.dim.shrink;
        let scaledFont = fontSize * Draw.scale;
        Draw.ctx.font = `${fontSize}px unlocked`;
        let blackfx = Draw.dim.ratios[safe][0] * Draw.dim.width + Dim.fontXTrans * Draw.dim.shrink - Dim.blackFont * Draw.dim.shrink;
        let blackfy = Draw.dim.ratios[safe][1] * Draw.dim.height + Dim.fontYTrans * Draw.dim.shrink + Dim.blackFont * Draw.dim.shrink;
        let whitefx = Draw.dim.ratios[safe][0] * Draw.dim.width + Dim.fontXTrans * Draw.dim.shrink;
        let whitefy = Draw.dim.ratios[safe][1] * Draw.dim.height + Dim.fontYTrans * Draw.dim.shrink;
        Draw.ctx.fillText(`x${multiple}`, blackfx - fontSize * (scaledFont / fontSize - 1) / 2, blackfy + fontSize * (scaledFont / fontSize - 1) / 2);
        Draw.ctx.fillStyle = 'white';
        Draw.ctx.fillText(`x${multiple}`, whitefx - fontSize * (scaledFont / fontSize - 1) / 2, whitefy + fontSize * (scaledFont / fontSize - 1) / 2);
        Draw.ctx.fillStyle = 'black';
    }
    static rotateStar(star) {
        let centerX = star.x + star.size * Draw.dim.shrink / 2;
        let centerY = star.y + star.size * Draw.dim.shrink / 2;
        Draw.ctx.translate(centerX, centerY);
        Draw.ctx.rotate(star.rotation);
        let gA = Math.sqrt(-star.distanceFromSource + 200) / 9 || 0.1;
        gA > 1
            ? Draw.ctx.globalAlpha = 1
            : Draw.ctx.globalAlpha = gA;
        Draw.ctx.drawImage(Draw.star, star.x - centerX, star.y - centerY, star.size * Draw.dim.shrink, star.size * Draw.dim.shrink);
        Draw.ctx.setTransform(1, 0, 0, 1, 0, 0);
        Draw.ctx.globalAlpha = 1;
    }
    static winSpin(increment, drawStars) {
        Draw.drawBackgroundAndSupport();
        Draw.ctx.putImageData(Draw.behindMarker, Draw.dim.ratios["marker"][0] * Draw.dim.width, Draw.dim.ratios["marker"][1] * Draw.dim.height, 0, 0, Draw.behindMarker.width * Draw.dim.shrink, Draw.behindMarker.height * Draw.dim.shrink);
        Draw.ctx.drawImage(Draw.marker, Draw.marker.width / 2, 0, Draw.marker.width / 2, Draw.marker.height, Draw.dim.ratios["marker"][0] * Draw.dim.width, Draw.dim.ratios["marker"][1] * Draw.dim.height, Draw.marker.width * Draw.dim.shrink / 2, Draw.marker.height * Draw.dim.shrink);
        Draw.currentRot = Draw.currentRot + increment;
        Draw.rotate(Draw.currentRot, Draw.dim.thirdDialW * 2);
        if (drawStars)
            Draw.drawStars(false);
    }
    static implementLoss() {
        // stop lights 
        clearInterval(Draw.lightsInterv);
        // put background screen and header
        Draw.ctx.drawImage(Draw.panelBackg, Draw.dim.ratios["panelBackground"][0] * Draw.dim.width, Draw.dim.ratios["panelBackground"][1] * Draw.dim.height, Draw.panelBackg.width * Draw.dim.shrink, Draw.panelBackg.height * Draw.dim.shrink);
        Draw.ctx.drawImage(Draw.screenBackg, Draw.dim.ratios["screenBackground"][0] * Draw.dim.width, Draw.dim.ratios["screenBackground"][1] * Draw.dim.height, Draw.screenBackg.width * Draw.dim.shrink, Draw.screenBackg.height * Draw.dim.shrink);
        setTimeout(function () { Draw.showReplayButton(); }, 2000);
    }
    static showReplayButton() {
        // replay button
        Draw.ctx.fillStyle = 'black';
        Draw.ctx.fillRect(Draw.dim.width / 4, Draw.dim.height / 3 + 3, Draw.dim.width / 2, Draw.dim.height / 3);
        Draw.ctx.fillStyle = `rgb(64, 64, 64)`;
        Draw.ctx.fillRect(Draw.dim.width / 4 + 1, Draw.dim.height / 3 - 1, Draw.dim.width / 2, Draw.dim.height / 3);
        Draw.writeWords(110);
    }
    static redDial(counter) {
        Draw.game.state = Game.states["ANIMATING"];
        if (counter == 10) {
            if (Draw.game.spins >= 4) {
                Draw.game.state = Game.states["LOST"];
                setTimeout(() => Draw.implementLoss(), 3000);
            }
            else {
                Draw.game.state = Game.states["SPUN"];
                Draw.glowInterv = setInterval(Draw.generateSparks, 450);
                Draw.flashInterv = setInterval(Draw.flashSpin, 500);
                Draw.writeWords(110);
            }
        }
        else {
            Draw.drawBackgroundAndSupport();
            if (counter % 2 == 0) {
                Draw.rotate(Draw.currentRot, Draw.dim.thirdDialW);
                // hard
                Draw.ctx.drawImage(Draw.marker, 0, 0, Draw.marker.width / 2, Draw.marker.height, Draw.dim.ratios["marker"][0] * Draw.dim.width, Draw.dim.ratios["marker"][1] * Draw.dim.height, Draw.marker.width * Draw.dim.shrink / 2, Draw.marker.height * Draw.dim.shrink);
            }
            else {
                Draw.ctx.putImageData(Draw.behindMarker, Draw.dim.ratios["marker"][0] * Draw.dim.width, Draw.dim.ratios["marker"][1] * Draw.dim.height, 0, 0, Draw.behindMarker.width * Draw.dim.shrink, Draw.behindMarker.height * Draw.dim.shrink);
                Draw.rotate(Draw.currentRot, 0);
            }
            counter++;
            setTimeout(function () { Draw.redDial(counter); }, 200);
        }
    }
    static openSafe(result) {
        let s = "safe" + result.toString();
        // need to scale for browser resize
        Draw.ctx.putImageData(Draw.behindSafes[s], Draw.dim.ratios[s][0] * Draw.dim.width, Draw.dim.ratios[s][1] * Draw.dim.height, 0, 0, Draw.behindSafes[s].width * Draw.dim.shrink, Draw.behindSafes[s].height * Draw.dim.shrink);
        Draw.ctx.drawImage(Draw.safeOpen, Draw.dim.ratios[s][0] * Draw.dim.width + Dim.openSafeXTrans * Draw.dim.shrink, Draw.dim.ratios[s][1] * Draw.dim.height + Dim.openSafeYTrans * Draw.dim.shrink, Draw.safeOpen.width * Draw.dim.shrink, Draw.safeOpen.height * Draw.dim.shrink);
        let image = Draw.mapMultiplierToImage(Draw.game.boxes[result]);
        // /2 once
        Draw.ctx.drawImage(image, 0, 0, image.width / 2, image.height, Draw.dim.ratios[s][0] * Draw.dim.width +
            Dim.priseXTrans * Draw.dim.shrink, Draw.dim.ratios[s][1] * Draw.dim.height +
            Dim.priseYTrans * Draw.dim.shrink, image.width * Draw.dim.shrink / 2, image.height * Draw.dim.shrink);
        if (Draw.game.state !== Game.states["WON"]) {
            Draw.drawMultiplier(Draw.game.boxes[result], s);
        }
    }
    static mapMultiplierToImage(multiplier) {
        // need all square brackets?
        switch (multiplier) {
            case 11: {
                return Draw.coin;
            }
            case 12: {
                return Draw.coin;
            }
            case 13: {
                return Draw.coin;
            }
            case 14: {
                return Draw.coin;
            }
            case 15: {
                return Draw.coin;
            }
            case 16: {
                return Draw.ring;
            }
            case 17: {
                return Draw.notes;
            }
            case 18: {
                return Draw.gold;
            }
            case 19: {
                return Draw.dia;
            }
        }
    }
    static rotate(rotation, xTranslate) {
        Draw.ctx.translate(Draw.dim.centrDial[0], Draw.dim.centrDial[1]);
        Draw.ctx.rotate(rotation);
        Draw.ctx.drawImage(this.dial, xTranslate, 0, Draw.dim.thirdDialW, this.dial.height, Draw.dim.ratios["dial"][0] * Draw.dim.width - Draw.dim.centrDial[0], Draw.dim.ratios["dial"][1] * Draw.dim.height - Draw.dim.centrDial[1], Draw.dim.thirdDialW * Draw.dim.shrink, this.dial.height * Draw.dim.shrink);
        Draw.ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (Draw.spinOn) {
            Draw.ctx.drawImage(this.spin, Draw.dim.ratios["spin"][0] * Draw.dim.width, Draw.dim.ratios["spin"][1] * Draw.dim.height, this.spin.width * Draw.dim.shrink, this.spin.height * Draw.dim.shrink);
        }
    }
    // 45 or 110 or 75
    static writeWords(fSize) {
        let fontSize = fSize * Draw.dim.shrink;
        Draw.ctx.font = `${fontSize}px instructions`;
        switch (Draw.game.state) {
            case Game.states["ZERO_SPINS"]: {
                Draw.drawScreen();
                Draw.ctx.fillText('Match a pair of symbols for a safe busting multiplier!', Draw.dim.ratios["instructionsTop"][0] * Draw.dim.width, Draw.dim.ratios["instructionsTop"][1] * Draw.dim.height);
                Draw.ctx.fillText('TOUCH THE DIAL TO SPIN YOUR 4 DIGIT COMBINATION', Draw.dim.ratios["instructionsBottom"][0] * Draw.dim.width, Draw.dim.ratios["instructionsBottom"][1] * Draw.dim.height);
                Draw.ctx.font = `${fontSize}px unlocked`;
                Draw.ctx.fillText("-   -   -   -", Draw.dim.ratios["unlockedSafes"][0] * Draw.dim.width, Draw.dim.ratios["unlockedSafes"][1] * Draw.dim.height);
                break;
            }
            case Game.states["SPINNING"]: {
                Draw.drawBehindInst();
                Draw.ctx.fillText('SPINNING!', Draw.dim.ratios["spinning"][0] * Draw.dim.width, Draw.dim.ratios["spinning"][1] * Draw.dim.height);
                break;
            }
            case Game.states["SPUN"]: {
                Draw.writeSPUNstate();
                break;
            }
            case Game.states["ANIMATING"]: {
                Draw.writeSPUNstate();
                break;
            }
            case Game.states["WON"]: {
                Draw.ctx.drawImage(Draw.winScr, Draw.dim.ratios["winScreen"][0] * Draw.dim.width, Draw.dim.ratios["winScreen"][1] * Draw.dim.height, Draw.winScr.width * Draw.dim.shrink, Draw.winScr.height * Draw.dim.shrink);
                Draw.ctx.font = `${fontSize}px unlocked`;
                Draw.ctx.fillText("WIN", Draw.dim.ratios["winText"][0] * Draw.dim.width, Draw.dim.ratios["winText"][1] * Draw.dim.height);
                Draw.ctx.font = `${Dim.headrFontSize * Draw.dim.shrink}px instructions`;
                let amountWon = Draw.game.boxes[Draw.game.winSafes[0]] * Game.bet;
                Draw.ctx.fillText(`YOU WIN £${amountWon}!`, Draw.dim.ratios["safeText"][0] * Draw.dim.width, Draw.dim.ratios["safeText"][1] * Draw.dim.height);
                break;
            }
            case Game.states["LOST"]: {
                Draw.ctx.fillStyle = 'black';
                Draw.ctx.fillText(`NO LUCK THIS TIME!`, Draw.dim.ratios["noLuckText"][0] * Draw.dim.width -
                    Dim.blackFont * Draw.dim.shrink, Draw.dim.ratios["noLuckText"][1] * Draw.dim.height +
                    Dim.blackFont * Draw.dim.shrink);
                Draw.ctx.fillStyle = 'white';
                Draw.ctx.font = `${Dim.replayFontSize * Draw.dim.shrink}px instructions`;
                Draw.ctx.fillText(`Click to replay`, Draw.dim.ratios["replayText"][0], Draw.dim.ratios["replayText"][1]);
                Draw.ctx.font = `${fontSize * Draw.dim.shrink}px instructions`;
                Draw.ctx.fillText(`NO LUCK THIS TIME!`, Draw.dim.ratios["noLuckText"][0] * Draw.dim.width, Draw.dim.ratios["noLuckText"][1] * Draw.dim.height);
                break;
            }
        }
    }
    static writeSPUNstate() {
        Draw.drawBehindInst();
        Draw.ctx.font = `${Dim.headrFontSize * Draw.dim.shrink}px instructions`;
        Draw.ctx.fillText("SAFE" + Draw.game.result.toString(), Draw.dim.ratios["safeText"][0] * Draw.dim.width, Draw.dim.ratios["safeText"][1] * Draw.dim.height);
        Draw.drawScreen();
        Draw.ctx.font = `${Dim.instFontSize * Draw.dim.shrink}px unlocked`;
        Draw.ctx.fillText(Draw.game.getUnlockedSafesString(), Draw.dim.ratios["unlockedSafes"][0] * Draw.dim.width, Draw.dim.ratios["unlockedSafes"][1] * Draw.dim.height);
    }
    static drawScreen() {
        Draw.ctx.drawImage(Draw.screen, Draw.dim.ratios["screen"][0] * Draw.dim.width, Draw.dim.ratios["screen"][1] * Draw.dim.height, Draw.screen.width * Draw.dim.shrink, Draw.screen.height * Draw.dim.shrink);
    }
    static drawBehindInst() {
        Draw.ctx.putImageData(Draw.behindInst, Draw.dim.ratios["instructions"][0] * Draw.dim.width, Draw.dim.ratios["instructions"][1] * Draw.dim.height, 0, 0, Draw.behindInst.width * Draw.dim.shrink, Draw.behindInst.height * Draw.dim.shrink);
    }
    static counter() {
        Draw.count--;
        if (Draw.count === 0) {
            Draw.dim.thirdLightsW = Draw.lights.width / 3;
            Draw.dim.thirdDialW = Draw.dial.width / 3;
            Draw.dim.sizeCanvas();
            Draw.drawImages();
        }
    }
    static drawImages() {
        Draw.ctx.drawImage(this.backg, 0, 0, Draw.dim.width, Draw.dim.height);
        const widthFactor = this.safe.width * Draw.dim.shrink;
        const heightFactor = this.safe.height * Draw.dim.shrink;
        // Make a loop?
        if (Draw.initialDraw) {
            // hard code and shrink
            Draw.behindSupp = Draw.ctx.getImageData(Draw.dim.ratios["supportDial"][0] * Draw.dim.width, Draw.dim.ratios["supportDial"][1] * Draw.dim.height, Draw.suppDial.width, Draw.suppDial.height);
            Draw.behindInst = Draw.ctx.getImageData(Draw.dim.ratios["instructions"][0] * Draw.dim.width, Draw.dim.ratios["instructions"][1] * Draw.dim.height, 800, 90);
            for (let i = 1; i <= 9; i++) {
                Draw.behindSafes[`safe${i}`] = Draw.ctx.getImageData(Draw.dim.ratios[`safe${i}`][0] * Draw.dim.width, Draw.dim.ratios[`safe${i}`][1] * Draw.dim.height, widthFactor, heightFactor);
            }
        }
        for (let i = 1; i <= 9; i++) {
            let s = "safe" + i.toString();
            Draw.game.unlockedSafes.indexOf(i) === -1
                ? Draw.ctx.drawImage(this.safe, Draw.dim.ratios[s][0] * Draw.dim.width, Draw.dim.ratios[s][1] * Draw.dim.height, widthFactor, heightFactor)
                : Draw.openSafe(i);
        }
        if (Draw.game.state !== Game.states["WON"]) {
            Draw.ctx.drawImage(this.suppDial, Draw.dim.ratios["supportDial"][0] * Draw.dim.width, Draw.dim.ratios["supportDial"][1] * Draw.dim.height, this.suppDial.width * Draw.dim.shrink, this.suppDial.height * Draw.dim.shrink);
            Draw.ctx.drawImage(this.dial, 0, 0, Draw.dim.thirdDialW, this.dial.height, Draw.dim.ratios["dial"][0] * Draw.dim.width, Draw.dim.ratios["dial"][1] * Draw.dim.height, Draw.dim.thirdDialW * Draw.dim.shrink, this.dial.height * Draw.dim.shrink);
        }
        if (Draw.initialDraw) {
            Draw.behindLight2 = Draw.ctx.getImageData(Draw.dim.ratios["lights2"][0] * Draw.dim.width, Draw.dim.ratios["lights2"][1] * Draw.dim.height, Draw.dim.thirdLightsW, this.lights.height);
            Draw.behindLight1 = Draw.ctx.getImageData(Draw.dim.ratios["lights1"][0] * Draw.dim.width, Draw.dim.ratios["lights1"][1] * Draw.dim.height, Draw.dim.thirdLightsW, this.lights.height);
            Draw.behindSpin = Draw.ctx.getImageData(Draw.dim.ratios["spin"][0] * Draw.dim.width, Draw.dim.ratios["spin"][1] * Draw.dim.height, this.spin.width, this.spin.height);
            Draw.behindMarker = Draw.ctx.getImageData(Draw.dim.ratios["marker"][0] * Draw.dim.width, Draw.dim.ratios["marker"][1] * Draw.dim.height, Draw.marker.width / 2, Draw.marker.height);
        }
        if (Draw.game.state !== Game.states["WON"]) {
            Draw.ctx.drawImage(this.spin, Draw.dim.ratios["spin"][0] * Draw.dim.width, Draw.dim.ratios["spin"][1] * Draw.dim.height, this.spin.width * Draw.dim.shrink, this.spin.height * Draw.dim.shrink);
            Draw.ctx.drawImage(this.lights, 0, 0, Draw.dim.thirdLightsW, this.lights.height, Draw.dim.ratios["lights1"][0] * Draw.dim.width, Draw.dim.ratios["lights1"][1] * Draw.dim.height, Draw.dim.thirdLightsW * Draw.dim.shrink, this.lights.height * Draw.dim.shrink);
            Draw.ctx.drawImage(this.lights, Draw.dim.thirdLightsW, 0, Draw.dim.thirdLightsW, this.lights.height, Draw.dim.ratios["lights2"][0] * Draw.dim.width, Draw.dim.ratios["lights2"][1] * Draw.dim.height, Draw.dim.thirdLightsW * Draw.dim.shrink, this.lights.height * Draw.dim.shrink);
        }
        if (Draw.fontsLoaded) {
            Draw.writeWords(45);
        }
        if (Draw.initialDraw) {
            Draw.dim.setDimensions(Draw.suppDial.width, Draw.suppDial.height, Draw.dial.width, Draw.dial.height, Draw.spin.width);
            Draw.initialDraw = false;
        }
    }
    static drawLights() {
        Draw.ctx.putImageData(Draw.behindLight1, Draw.dim.ratios["lights1"][0] * Draw.dim.width, Draw.dim.ratios["lights1"][1] * Draw.dim.height, 0, 0, Draw.behindLight1.width * Draw.dim.shrink, Draw.behindLight1.height * Draw.dim.shrink);
        Draw.ctx.putImageData(Draw.behindLight2, Draw.dim.ratios["lights2"][0] * Draw.dim.width, Draw.dim.ratios["lights2"][1] * Draw.dim.height, 0, 0, Draw.behindLight2.width * Draw.dim.shrink, Draw.behindLight2.height * Draw.dim.shrink);
        Draw.ctx.drawImage(Draw.lights, Draw.dim.xLights1 * Draw.dim.thirdLightsW, 0, Draw.dim.thirdLightsW, Draw.lights.height, Draw.dim.ratios["lights1"][0] * Draw.dim.width, Draw.dim.ratios["lights1"][1] * Draw.dim.height, Draw.dim.thirdLightsW * Draw.dim.shrink, Draw.lights.height * Draw.dim.shrink);
        Draw.ctx.drawImage(Draw.lights, Draw.dim.xLights2 * Draw.dim.thirdLightsW, 0, Draw.dim.thirdLightsW, Draw.lights.height, Draw.dim.ratios["lights2"][0] * Draw.dim.width, Draw.dim.ratios["lights2"][1] * Draw.dim.height, Draw.dim.thirdLightsW * Draw.dim.shrink, Draw.lights.height * Draw.dim.shrink);
    }
    // make it async?
    // Don't use hard numbers, save as constants 
    static generateSparks() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([Draw.dim.getPoint(), Draw.dim.getPoint(), Draw.dim.getPoint(), Draw.dim.getPoint(),
                Draw.dim.getPoint(), Draw.dim.getPoint(), Draw.dim.getPoint(), Draw.dim.getPoint()]).then(function (values) {
                for (let x in values) {
                    let spark = new Spark(values[x][0], values[x][1], 10);
                    Draw.sparks.push(spark);
                }
                Draw.drawSparks(Draw.sparks.length - values.length);
            });
        });
    }
    static drawSparks(index) {
        if (Draw.game.state == Game.states["ZERO_SPINS"] || Draw.game.state == Game.states["SPUN"]) {
            const set = new Set([index, index + 1, index + 2, index + 3, index + 4, index + 5, index + 6, index + 7]);
            Draw.drawBackgroundAndSupport();
            Draw.rotate(Draw.currentRot, 0);
            for (let i = 0; i < Draw.sparks.length; i++) {
                if (Draw.sparks[i]) {
                    if (set.has(i)) {
                        Draw.sparks[i].size += 5;
                        Draw.ctx.drawImage(Draw.sparkSafe, Draw.sparks[i].x - Draw.sparks[i].size * Draw.dim.shrink / 2, Draw.sparks[i].y - Draw.sparks[i].size * Draw.dim.shrink / 2, Draw.sparks[i].size * Draw.dim.shrink, Draw.sparks[i].size * Draw.dim.shrink);
                    }
                    else {
                        Draw.ctx.drawImage(Draw.sparkSafe, Draw.sparks[i].x - Draw.sparks[i].size * Draw.dim.shrink / 2, Draw.sparks[i].y - Draw.sparks[i].size * Draw.dim.shrink / 2, Draw.sparks[i].size * Draw.dim.shrink, Draw.sparks[i].size * Draw.dim.shrink);
                    }
                }
            }
            if (Draw.sparks[index].size == 55) {
                Draw.reduceSpark(index);
            }
            else {
                setTimeout(function () { Draw.drawSparks(index); }, 60);
            }
        }
    }
    static reduceSpark(index) {
        if (Draw.game.state == Game.states["ZERO_SPINS"] || Draw.game.state == Game.states["SPUN"]) {
            const set = new Set([index, index + 1, index + 2, index + 3, index + 4, index + 5, index + 6, index + 7]);
            if (Draw.sparks[index].size == 0) {
                for (let i = index; i <= index + 7; i++) {
                    delete Draw.sparks[i];
                }
            }
            else {
                Draw.drawBackgroundAndSupport();
                Draw.rotate(Draw.currentRot, 0);
                for (let i = 0; i < Draw.sparks.length; i++) {
                    if (Draw.sparks[i]) {
                        if (set.has(i)) {
                            Draw.sparks[i].size -= 5;
                            Draw.ctx.drawImage(Draw.sparkSafe, Draw.sparks[i].x - Draw.sparks[i].size * Draw.dim.shrink / 2, Draw.sparks[i].y - Draw.sparks[i].size * Draw.dim.shrink / 2, Draw.sparks[i].size * Draw.dim.shrink, Draw.sparks[i].size * Draw.dim.shrink);
                        }
                        else {
                            Draw.ctx.drawImage(Draw.sparkSafe, Draw.sparks[i].x - Draw.sparks[i].size * Draw.dim.shrink / 2, Draw.sparks[i].y - Draw.sparks[i].size * Draw.dim.shrink / 2, Draw.sparks[i].size * Draw.dim.shrink, Draw.sparks[i].size * Draw.dim.shrink);
                        }
                    }
                }
                setTimeout(function () { Draw.reduceSpark(index); }, 60);
            }
        }
    }
    // clip larger area so you don't get the line half way through
    static drawBackgroundAndSupport() {
        // can implement DRY morE?
        // if change radius change increment
        // I shouldnt have to clip twice
        Draw.ctx.save();
        Draw.ctx.beginPath();
        Draw.ctx.arc(Draw.dim.centrDial[0], Draw.dim.centrDial[1], Draw.dim.radiusSupport + 25 * Draw.dim.shrink, 0, Math.PI * 2);
        Draw.ctx.clip();
        Draw.ctx.drawImage(this.backg, 0, 0, Draw.dim.width, Draw.dim.height);
        Draw.ctx.drawImage(this.suppDial, Draw.dim.ratios["supportDial"][0] * Draw.dim.width, Draw.dim.ratios["supportDial"][1] * Draw.dim.height, this.suppDial.width * Draw.dim.shrink, this.suppDial.height * Draw.dim.shrink);
        Draw.drawLights();
        Draw.ctx.restore();
        Draw.drawLights();
    }
    // Method that flashes the "Spin" button. 
    // Called by a "setInterval"
    static flashSpin() {
        Draw.ctx.putImageData(Draw.behindSpin, Draw.dim.ratios["spin"][0] * Draw.dim.width, Draw.dim.ratios["spin"][1] * Draw.dim.height, 0, 0, Draw.behindSpin.width * Draw.dim.shrink, Draw.behindSpin.height * Draw.dim.shrink);
        if (Draw.spinOn) {
            Draw.spinOn = false;
        }
        else {
            Draw.ctx.drawImage(Draw.spin, Draw.dim.ratios["spin"][0] * Draw.dim.width, Draw.dim.ratios["spin"][1] * Draw.dim.height, Draw.spin.width * Draw.dim.shrink, Draw.spin.height * Draw.dim.shrink);
            Draw.spinOn = true;
        }
    }
}
/**
 *  Image cache references
 */
Draw.lights = new Image();
Draw.backg = new Image();
Draw.safe = new Image();
Draw.safeOpen = new Image();
Draw.screen = new Image();
Draw.suppDial = new Image();
Draw.sparkSafe = new Image();
Draw.dial = new Image();
Draw.spin = new Image();
Draw.coin = new Image();
Draw.dia = new Image();
Draw.gold = new Image();
Draw.notes = new Image();
Draw.ring = new Image();
Draw.winScr = new Image();
Draw.marker = new Image();
Draw.panelBackg = new Image();
Draw.screenBackg = new Image();
Draw.star = new Image();
Draw.images = [Draw.lights, Draw.backg, Draw.safe, Draw.safeOpen, Draw.gold,
    Draw.dia, Draw.coin, Draw.ring, Draw.notes, Draw.sparkSafe, Draw.screen, Draw.suppDial,
    Draw.dial, Draw.spin, Draw.marker, Draw.winScr, Draw.star, Draw.panelBackg, Draw.screenBackg];
Draw.count = Draw.images.length;
Draw.behindSafes = {};
/**
 * Runtime state variables
 */
Draw.scale = 1;
Draw.currentRot = 0;
Draw.scaleDir = 1;
Draw.fontsLoaded = false;
Draw.spinOn = true;
Draw.initialDraw = true;
Draw.sparks = [];
Draw.stars = [];
