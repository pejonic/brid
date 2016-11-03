/// <reference path="../../typings/index.d.ts" />
import {DrawArea, FlowDirection} from "./utils"
import {Layer, StackLayer, OverlayLayer, MarqueeLayer, CrossLayer, HeadlineLayer, NameLayer} from "./layer";

export class MixingDeck {
    private canvasRoot :JQuery;
    private canvas :HTMLCanvasElement;
    private context2d :CanvasRenderingContext2D;
    private widgetRoot :JQuery;
    private layers :Layer[];
    private cardArea :DrawArea;

    constructor(public root :JQuery) {
        this.canvasRoot = root.find(".card-canvas").first();
        this.canvas = this.canvasRoot[0] as HTMLCanvasElement;
        this.context2d = this.canvas.getContext("2d");
        this.widgetRoot = root.find("form.card-widgets-root").first();

        if (this.widgetRoot.length == 0) {
            console.warn("Couldn't find root element for widgets");
        }
        
        this.layers = [
            new OverlayLayer(
                "background",
                "#222"
            ),
            new StackLayer(
                "stack",
                FlowDirection.TopDown,
                [
                    new HeadlineLayer(
                        "headline",
                        "police 995"
                    ),
                    new NameLayer(
                        "name"
                    )
                ]
            ),
            new CrossLayer(
                "x"
            ),
            new MarqueeLayer(
                "marquee",
                "test"
            ),
        ];
    }

    addWidgets() {
        for (let layer of this.layers) {
            layer.addWidget(this.widgetRoot);
        }
    }

    /// call this every time the page resizes
    initialise() { 

        // Handle flexible canvas size + HiDPI screens
        let devicePixelRatio = window.devicePixelRatio || 1,
            canvasWidth = this.canvasRoot.innerWidth(),
            canvasHeight = this.canvasRoot.innerHeight();
        this.canvas.width = canvasWidth * devicePixelRatio;
        this.canvas.height = canvasHeight * devicePixelRatio;
        this.canvas.style.width = canvasWidth + "px";
        this.canvas.style.height = canvasHeight + "px";
        this.context2d.scale(devicePixelRatio, devicePixelRatio);

        let canvasArea = new DrawArea(0, 0, this.canvas.width, this.canvas.height);

        let cardOriginX :number, cardOriginY :number;
        let cardHeight :number, cardWidth :number;
        let cardRatio = 1.545; // standard UK business card ratio https://en.wikipedia.org/wiki/Business_card#Dimensions
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
        this.cardArea = new DrawArea(cardOriginX, cardOriginY, cardWidth, cardHeight);

        for (let layer of this.layers) {
            layer.initialise(canvasArea);
        }
    }

    update() {
        for (let layer of this.layers) {
            layer.update();
        }
    }

    render() {
        this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context2d.globalCompositeOperation = "source-over";

        for (let layer of this.layers) {
            layer.render(this.context2d, this.cardArea);
        }
    }
}