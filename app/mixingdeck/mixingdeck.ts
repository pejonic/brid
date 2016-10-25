/// <reference path="../../typings/index.d.ts" />
import {DrawArea} from "./drawarea"
import {Layer, OverlayLayer, MarqueeLayer} from "./layer";

export class MixingDeck {
    private canvas :HTMLCanvasElement;
    private context2d :CanvasRenderingContext2D;
    private widgetRoot :JQuery;
    private layers :Layer[];

    constructor(public root :JQuery) {
        this.canvas = root.find(".card-canvas").first()[0] as HTMLCanvasElement;
        this.context2d = this.canvas.getContext("2d");
        this.widgetRoot = root.find("form.card-widgets-root").first();

        if (this.widgetRoot.length == 0) {
            console.warn("Couldn't find root element for widgets");
        }
        
        this.layers = [
            new OverlayLayer(
                "background",
                "#fdd700"
            ),
            new MarqueeLayer(
                "marquee",
                "test"
            ),
        ];
    }

    initialise() {
        let canvasArea = new DrawArea(0, 0, this.canvas.width, this.canvas.height);

        let cardOriginX :number, cardOriginY :number;
        let cardHeight :number, cardWidth :number;
        let cardRatio = 1.3; // height/width
        if (cardRatio >= 1) { // height is longest side; align horizontally
            cardHeight = this.canvas.height;
            cardWidth = cardHeight / cardRatio;
            cardOriginY = 0;
            cardOriginX = (this.canvas.width - cardWidth) / 2;
        }
        else { // width is longest side; align vertically
            cardWidth = this.canvas.width;
            cardHeight = cardWidth / cardRatio; 
            cardOriginX = 0;
            cardOriginY = (this.canvas.height - cardHeight) / 2;
        }

        // TODO change this area depending on configured card size, if responsive then just use whole canvas
        let cardArea = new DrawArea(cardOriginX, cardOriginY, cardWidth, cardHeight);

        for (let layer of this.layers) {
            layer.initialise(canvasArea, cardArea);

            let widget = layer.buildWidget();
            if (widget) {
                this.widgetRoot.append(widget);
                console.debug("Added widget for layer <%s>", layer.name);
            }
        }
    }

    update() {
        for (let layer of this.layers) {
            layer.update();
        }
    }

    render() {
        this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let layer of this.layers) {
            layer.render(this.context2d);
        }
    }
}