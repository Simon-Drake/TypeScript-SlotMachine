var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Canvas {
    static init(el) {
        Canvas.loadFonts();
        this.canvasElement = el;
        this.lights.src = '../../images/leds_safe_dial_minigame.png';
        this.background.src = '../../images/background_safe_minigame.png';
        this.safe.src = '../../images/safe_minigame.png';
        this.screen.src = '../../images/screen_safe_minigame.png';
        this.supportDial.src = '../../images/support_safe_dial_minigame.png';
        window.addEventListener('resize', function () { Canvas.sizeCanvas(); }, false);
        Canvas.context = el.getContext("2d");
        this.background.onload = this.lights.onload = this.safe.onload = this.supportDial.onload = this.screen.onload = Canvas.counter;
    }
    static loadFonts() {
        return __awaiter(this, void 0, void 0, function* () {
            const unl = new FontFace('unlocked', 'url(../../src/fonts/TitanOne-Regular.ttf)');
            const inst = new FontFace('instructions', 'url(../../src/fonts/Dimbo-Italic.ttf)');
            yield Promise.all([unl.load(), inst.load()]);
            document.fonts.add(unl);
            document.fonts.add(inst);
            Canvas.fontsLoaded = true;
            Canvas.writeWords();
        });
    }
    static writeWords() {
        const shrinkFactor = Canvas.width / Canvas.maxWidth;
        let fontSize = 45 * shrinkFactor;
        Canvas.context.font = `${fontSize}px instructions`;
        Canvas.context.fillText('Match a pair of symbols for a safe busting multiplier!', Canvas.ratios["instructionsTop"][0] * Canvas.width, Canvas.ratios["instructionsTop"][1] * Canvas.height);
        Canvas.context.fillText('TOUCH THE DIAL TO SPIN YOUR 4 DIGIT COMBINATION', Canvas.ratios["instructionsBottom"][0] * Canvas.width, Canvas.ratios["instructionsBottom"][1] * Canvas.height);
        Canvas.context.font = `${fontSize}px unlocked`;
        Canvas.context.fillText('-   -   -   -', Canvas.ratios["unlockedSafes"][0] * Canvas.width, Canvas.ratios["unlockedSafes"][1] * Canvas.height);
    }
    static counter() {
        Canvas.count--;
        if (Canvas.count === 0) {
            Canvas.sizeCanvas();
        }
    }
    static sizeCanvas() {
        // If the browser is large enough scale the canvas to its maximum dimensions.
        if (document.body.clientWidth > this.maxWidth && window.innerHeight > this.maxHeight) {
            Canvas.canvasElement.width = Canvas.maxWidth;
            Canvas.width = Canvas.maxWidth;
            Canvas.canvasElement.height = Canvas.maxHeight;
            Canvas.height = Canvas.maxHeight;
        }
        else {
            // If both width and height are smaller than max determine which ratio is smallest and rescale accordingly.
            // Else if its just width than scale to width otherwise its height and scale to height. 
            document.body.clientWidth < this.maxWidth && document.body.clientHeight < this.maxHeight
                ? document.body.clientWidth / this.maxWidth <= document.body.clientHeight / this.maxHeight
                    ? Canvas.scaleToWidth(Canvas.canvasElement)
                    : Canvas.scaleToHeight(Canvas.canvasElement)
                : document.body.clientWidth < this.maxWidth ? Canvas.scaleToWidth(Canvas.canvasElement) : Canvas.scaleToHeight(Canvas.canvasElement);
        }
        Canvas.drawImages();
    }
    static scaleToWidth(el) {
        el.width = document.body.clientWidth * 0.95;
        Canvas.width = document.body.clientWidth * 0.95;
        el.height = Canvas.width * this.heightToWidthRatio;
        Canvas.height = Canvas.width * this.heightToWidthRatio;
    }
    static scaleToHeight(el) {
        el.height = document.body.clientHeight * 0.95;
        Canvas.height = document.body.clientHeight * 0.95;
        el.width = Canvas.height * this.widthToHeightRatio;
        Canvas.width = Canvas.height * this.widthToHeightRatio;
    }
    static drawImages() {
        const shrinkFactor = Canvas.width / Canvas.maxWidth;
        Canvas.context.drawImage(this.background, 0, 0, Canvas.width, Canvas.height);
        const widthFactor = this.safe.width * shrinkFactor;
        const heightFactor = this.safe.height * shrinkFactor;
        // Make a loop?
        Canvas.context.drawImage(this.safe, Canvas.ratios["safe1"][0] * Canvas.width, Canvas.ratios["safe1"][1] * Canvas.height, widthFactor, heightFactor);
        Canvas.context.drawImage(this.safe, Canvas.ratios["safe2"][0] * Canvas.width, Canvas.ratios["safe2"][1] * Canvas.height, widthFactor, heightFactor);
        Canvas.context.drawImage(this.safe, Canvas.ratios["safe3"][0] * Canvas.width, Canvas.ratios["safe3"][1] * Canvas.height, widthFactor, heightFactor);
        Canvas.context.drawImage(this.safe, Canvas.ratios["safe4"][0] * Canvas.width, Canvas.ratios["safe4"][1] * Canvas.height, widthFactor, heightFactor);
        Canvas.context.drawImage(this.safe, Canvas.ratios["safe5"][0] * Canvas.width, Canvas.ratios["safe5"][1] * Canvas.height, widthFactor, heightFactor);
        Canvas.context.drawImage(this.safe, Canvas.ratios["safe6"][0] * Canvas.width, Canvas.ratios["safe6"][1] * Canvas.height, widthFactor, heightFactor);
        Canvas.context.drawImage(this.safe, Canvas.ratios["safe7"][0] * Canvas.width, Canvas.ratios["safe7"][1] * Canvas.height, widthFactor, heightFactor);
        Canvas.context.drawImage(this.safe, Canvas.ratios["safe8"][0] * Canvas.width, Canvas.ratios["safe8"][1] * Canvas.height, widthFactor, heightFactor);
        Canvas.context.drawImage(this.safe, Canvas.ratios["safe9"][0] * Canvas.width, Canvas.ratios["safe9"][1] * Canvas.height, widthFactor, heightFactor);
        Canvas.context.drawImage(this.screen, Canvas.ratios["screen"][0] * Canvas.width, Canvas.ratios["screen"][1] * Canvas.height, this.screen.width * shrinkFactor, this.screen.height * shrinkFactor);
        Canvas.context.drawImage(this.supportDial, Canvas.ratios["supportDial"][0] * Canvas.width, Canvas.ratios["supportDial"][1] * Canvas.height, this.supportDial.width * shrinkFactor, this.supportDial.height * shrinkFactor);
        // Do once
        // draw image under support dial?
        Canvas.behindLightsOne = Canvas.context.getImageData(Canvas.ratios["lights1"][0] * Canvas.width, Canvas.ratios["lights1"][1] * Canvas.height, this.lights.width / 3, this.lights.height);
        Canvas.context.drawImage(this.lights, 0, 0, this.lights.width / 3, this.lights.height, Canvas.ratios["lights1"][0] * Canvas.width, Canvas.ratios["lights1"][1] * Canvas.height, this.lights.width * shrinkFactor / 3, this.lights.height * shrinkFactor);
        // Do /3 once
        Canvas.behindLightsTwo = Canvas.context.getImageData(Canvas.ratios["lights2"][0] * Canvas.width, Canvas.ratios["lights2"][1] * Canvas.height, this.lights.width / 3, this.lights.height);
        Canvas.context.drawImage(this.lights, this.lights.width / 3, 0, this.lights.width / 3, this.lights.height, Canvas.ratios["lights2"][0] * Canvas.width, Canvas.ratios["lights2"][1] * Canvas.height, this.lights.width * shrinkFactor / 3, this.lights.height * shrinkFactor);
        if (Canvas.fontsLoaded) {
            Canvas.writeWords();
        }
        Canvas.drawn = true;
        Canvas.setDimensions();
        Canvas.supportGlow();
    }
    static setDimensions() {
        const shrinkFactor = Canvas.width / Canvas.maxWidth;
        Canvas.radiusSupport = this.supportDial.width / 2 * shrinkFactor;
        Canvas.radiusDial = Canvas.radiusSupport * 0.9;
        Canvas.centerSupport = [Canvas.ratios["supportDial"][0] * Canvas.width + this.supportDial.width / 2, Canvas.ratios["supportDial"][1] * Canvas.height + this.supportDial.height / 2];
    }
    static changeLights() {
        Canvas.context.putImageData(Canvas.behindLightsOne, Canvas.ratios["lights1"][0] * Canvas.width, Canvas.ratios["lights1"][1] * Canvas.height);
        Canvas.context.putImageData(Canvas.behindLightsTwo, Canvas.ratios["lights2"][0] * Canvas.width, Canvas.ratios["lights2"][1] * Canvas.height);
        const shrinkFactor = Canvas.width / Canvas.maxWidth;
        Canvas.context.drawImage(Canvas.lights, Canvas.xLights1 * Canvas.lights.width / 3, 0, Canvas.lights.width / 3, Canvas.lights.height, Canvas.ratios["lights1"][0] * Canvas.width, Canvas.ratios["lights1"][1] * Canvas.height, Canvas.lights.width * shrinkFactor / 3, Canvas.lights.height * shrinkFactor);
        Canvas.context.drawImage(Canvas.lights, Canvas.xLights2 * Canvas.lights.width / 3, 0, Canvas.lights.width / 3, Canvas.lights.height, Canvas.ratios["lights2"][0] * Canvas.width, Canvas.ratios["lights2"][1] * Canvas.height, Canvas.lights.width * shrinkFactor / 3, Canvas.lights.height * shrinkFactor);
        Canvas.xLights1 < 2
            ? Canvas.xLights1++
            : Canvas.xLights1 = 0;
        // probably dont need this one
        Canvas.xLights2 < 2
            ? Canvas.xLights2++
            : Canvas.xLights2 = 0;
    }
    // clen this up
    static getPoint() {
        return __awaiter(this, void 0, void 0, function* () {
            // Canvas.centerSupport = [0,0]
            // Canvas.radiusDial = 5
            // Canvas.radiusSupport = 6
            const a = Math.random() * 2 * Math.PI;
            const r = Canvas.radiusSupport * Math.sqrt(Math.random());
            console.log(Canvas.centerSupport);
            if (Math.sqrt(Math.pow((r * Math.cos(a)), 2) + Math.pow((r * Math.sin(a)), 2)) > Canvas.radiusDial) {
                return [r * Math.cos(a) + Canvas.centerSupport[0], r * Math.sin(a) + Canvas.centerSupport[1]];
            }
            else {
                return Canvas.getPoint();
            }
        });
    }
    static supportGlow() {
        Canvas.getPoint().then(function (value) { console.log(value); });
    }
}
Canvas.drawn = false;
Canvas.fontsLoaded = false;
Canvas.maxWidth = 916;
Canvas.maxHeight = 623;
Canvas.widthToHeightRatio = Canvas.maxWidth / Canvas.maxHeight;
Canvas.heightToWidthRatio = Canvas.maxHeight / Canvas.maxWidth;
// How far left is it, how far down, 
// Do divisions once?
Canvas.ratios = {
    "safe1": [(50 / Canvas.maxWidth), (173 / Canvas.maxHeight)],
    "safe2": [(220 / Canvas.maxWidth), (173 / Canvas.maxHeight)],
    "safe3": [(390 / Canvas.maxWidth), (173 / Canvas.maxHeight)],
    "safe4": [(50 / Canvas.maxWidth), (320 / Canvas.maxHeight)],
    "safe5": [(220 / Canvas.maxWidth), (320 / Canvas.maxHeight)],
    "safe6": [(390 / Canvas.maxWidth), (320 / Canvas.maxHeight)],
    "safe7": [(50 / Canvas.maxWidth), (467 / Canvas.maxHeight)],
    "safe8": [(220 / Canvas.maxWidth), (467 / Canvas.maxHeight)],
    "safe9": [(390 / Canvas.maxWidth), (467 / Canvas.maxHeight)],
    "screen": [(578 / Canvas.maxWidth), (183 / Canvas.maxHeight)],
    "supportDial": [(582 / Canvas.maxWidth), (280 / Canvas.maxHeight)],
    "lights1": [(582 / Canvas.maxWidth), (270 / Canvas.maxHeight)],
    "lights2": [(758 / Canvas.maxWidth), (270 / Canvas.maxHeight)],
    "instructionsTop": [(68 / Canvas.maxWidth), (65 / Canvas.maxHeight)],
    "instructionsBottom": [(68 / Canvas.maxWidth), (110 / Canvas.maxHeight)],
    "unlockedSafes": [(642 / Canvas.maxWidth), (243 / Canvas.maxHeight)]
};
Canvas.lights = new Image();
Canvas.background = new Image();
Canvas.safe = new Image();
Canvas.screen = new Image();
Canvas.supportDial = new Image();
Canvas.images = [Canvas.lights, Canvas.background, Canvas.safe, Canvas.screen, Canvas.supportDial];
Canvas.count = Canvas.images.length;
Canvas.xLights1 = 1;
Canvas.xLights2 = 2;
// //Testing custom event making
// this.supportDial.addEventListener('redraw', function(e){
//     console.log("triggered i think")
// })
// let event = new CustomEvent('redraw')
// this.supportDial.dispatchEvent(event)
