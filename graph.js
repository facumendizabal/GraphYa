function getColor(value, colors) {
    colors = sortDict(colors);
    let minValue, maxValue;
    let minColor, maxColor;

    for (let i = 1; i < colors.length; i++) {
        let lastKey = Number(colors[i - 1].key)
        let currentKey = Number(colors[i].key)

        if (lastKey <= value && value <= currentKey) {
            minValue = lastKey;
            maxValue = currentKey;

            minColor = colors[i - 1].value;
            maxColor = colors[i].value;
        }
    }

    const colorStep = scale(value, minValue, maxValue, 0, 1);
    minColor = hex2rgb(minColor);
    maxColor = hex2rgb(maxColor);

    const color = interpolate(colorStep, minColor, maxColor);

    return color;
}

function interpolate(t, c1, c2) {
    return {
        r: c1.r + t * (c2.r - c1.r),
        g: c1.g + t * (c2.g - c1.g),
        b: c1.b + t * (c2.b - c1.b)
    }
}

function scale(num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function sortDict(dict) {
    let keys = Object.keys(dict);
    keys.sort()

    let sortedDict = [];

    for (let i = 0; i < keys.length; i++) {
        let k = keys[i];
        sortedDict.push({ 'key': k, 'value': dict[k] })
    }

    return sortedDict;
}

function hex2rgb(color) {
    let r, g, b;
    if (color.charAt(0) == '#') {
        color = color.substr(1);
    }
    if (color.length == 3) {
        color = color.substr(0, 1) + color.substr(0, 1) + color.substr(1, 2) + color.substr(1, 2) + color.substr(2, 3) + color.substr(2, 3);
    }

    r = color.charAt(0) + '' + color.charAt(1);
    g = color.charAt(2) + '' + color.charAt(3);
    b = color.charAt(4) + '' + color.charAt(5);
    r = parseInt(r, 16);
    g = parseInt(g, 16);
    b = parseInt(b, 16);
    return { r: r, g: g, b: b }
}

export class Settings {
    constructor(y, h, minT, maxT, colors){
        this.y = y;;
        this.h = h;;
        this.minT = minT;;
        this.maxT = maxT;;
        this.colors = colors;;
    }
}

class Box {
    constructor(x, y, w, h, c, value, time, endTime){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;
        this.value = value;
        this.time = time;
        this.endTime = endTime;
    }
}

export class GraphYa {
    graphs = {};

    addGraph(name, ctx, settings) {
        this.graphs[name] = new Graph(ctx, settings);
    }

    setGraphData(name, points) {
        let graph = this.graphs[name];
        graph.boxs = graph.pointToBox(points);
    }

    plot() {
        Object.keys(this.graphs).forEach(name => {
            this.graphs[name].plot();
        })
    }
}

class Graph {
    constructor(ctx, settings) {
        this.ctx = ctx;
        this.settings = settings;
        this.boxs = [];
    }

    pointToBox(data) {
        let boxs = [];

        data.sort((a, b) => a.timestamp - b.timestamp);

        data.forEach((element, index) => {
            const value = element.value;
            const time = element.timestamp;

            const minT = this.settings.minT;
            const maxT = this.settings.maxT;

            const colors = this.settings.colors;
            const canvasWidth = this.ctx.canvas.width;

            const color = getColor(value, colors);

            const endTime = data[index + 1] ? data[index + 1].timestamp : data[index].timestamp;

            const x = scale(time, minT, maxT, 0, canvasWidth);
            const w = scale(endTime, minT, maxT, 0, canvasWidth);

            boxs.push(new Box(
                x, this.settings.y, w, this.settings.h,
                `rgb(${color.r}, ${color.g}, ${color.b}`,
                value, time, endTime
            ));
        });

        return boxs;
    }

    plot() {
        let j;
        for (let i = 0; j = this.boxs[i]; i++) {
            this.ctx.fillStyle = j.c;
            this.ctx.fillRect(j.x, j.y, j.w, j.h);
        }

        const length = this.boxs.length;
        const box = this.boxs[length - 1];

        //Dirt fix
        this.ctx.clearRect(box.w, box.y, this.ctx.canvas.width, box.h)
    }
}