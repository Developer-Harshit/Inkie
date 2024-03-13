/* global define, require */
(function (root, factory) {
    "use strict";

    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["seriously"], factory);
    } else if (typeof exports === "object") {
        // Node/CommonJS
        factory(require("seriously"));
    } else {
        if (!root.Seriously) {
            root.Seriously = {
                plugin: function (name, opt) {
                    this[name] = opt;
                },
            };
        }
        factory(root.Seriously);
    }
})(window, function (Seriously) {
    "use strict";

    Seriously.plugin("crosshatch", {
        commonShader: true,
        shader: function (inputs, shaderSource) {
            shaderSource.fragment = [
                "precision mediump float;",

                "varying vec2 vTexCoord;",

                "uniform vec2 resolution;",
                "uniform sampler2D source;",
                // how close lines are
                "float pDensity = 5.0;",

                // width of lines
                "float pWidth = 2.0;",

                // threadhold of each hatch lines
                "float hatch_1 = 0.9;",
                "float hatch_2 = 0.7;",
                "float hatch_3 = 0.5;",
                "float hatch_4 = 0.15;",

                // gray lines
                "float hatch_1_brightness = 0.4;",
                "float hatch_2_brightness = 0.3;",
                "float hatch_3_brightness = 0.2;",
                "float hatch_4_brightness = 0.0;",

                // kernel offset
                "float d = 1.0;",

                // lookup function
                "float lookup(float dx, float dy) {",
                "vec2 uv = (gl_FragCoord.xy + vec2(dx * d, dy * d)) / resolution.xy;",
                "vec4 c = texture2D(source, uv.xy);",
                // return as luma,
                "return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;",
                "}",

                // get color

                "void main(void) {",
                "vec2 fragCoord = vTexCoord * resolution;",

                "float ratio = resolution.y / resolution.x;",
                "float coordX = fragCoord.x / resolution.x;",
                "float coordY = fragCoord.y / resolution.x;",
                "vec2 dstCoord = vec2(coordX, coordY);",
                "vec2 srcCoord = vec2(coordX, coordY / ratio);",
                "vec2 uv = srcCoord.xy;",

                "vec3 res = vec3(1.0, 1.0, 1.0);",
                "vec4 tex = texture2D(source, uv);",
                "float brightness = (0.2126 * tex.x) + (0.7152 * tex.y) + (0.0722 * tex.z);",

                "if (brightness < hatch_1) {",
                "if (mod(fragCoord.x + fragCoord.y, pDensity) <= pWidth)",
                "res = vec3(hatch_1_brightness);",
                "}",

                "if (brightness < hatch_2) {",
                "if (mod(fragCoord.x - fragCoord.y, pDensity) <= pWidth)",
                "res = vec3(hatch_2_brightness);",
                "}",

                "if (brightness < hatch_3) {",
                "if (mod(fragCoord.x + fragCoord.y - (pDensity * 0.5), pDensity) <= pWidth)",
                "res = vec3(hatch_3_brightness);",
                "}",

                "if (brightness < hatch_4) {",
                "if (mod(fragCoord.x - fragCoord.y - (pDensity * 0.5), pDensity) <= pWidth)",
                "res = vec3(hatch_4_brightness);",
                "}",

                ///sobel filter
                "float gx = 0.0;",
                "gx += -1.0 * lookup(-1.0, -1.0);",
                "gx += -2.0 * lookup(-1.0, 0.0);",
                "gx += -1.0 * lookup(-1.0, 1.0);",
                "gx += 1.0 * lookup(1.0, -1.0);",
                "gx += 2.0 * lookup(1.0, 0.0);",
                "gx += 1.0 * lookup(1.0, 1.0);",

                "float gy = 0.0;",
                "gy += -1.0 * lookup(-1.0, -1.0);",
                "gy += -2.0 * lookup(0.0, -1.0);",
                "gy += -1.0 * lookup(1.0, -1.0);",
                "gy += 1.0 * lookup(-1.0, 1.0);",
                "gy += 2.0 * lookup(0.0, 1.0);",
                "gy += 1.0 * lookup(1.0, 1.0);",

                // hack: use g^2 to conceal noise in the video
                "float g = gx * gx + gy * gy;",
                "res *= (1.0 - g);",
                "gl_FragColor = vec4(res+ tex.rgb*tex.rgb * tex.rgb*1.3 , 1.0);",
                // fun stuff

                // "vec3 col = tex.rgb*1.2;",

                // "gl_FragColor = vec4(res+(1.0-res)*col.rgb , 1.0);",

                "}",
            ].join("\n");
            return shaderSource;
        },
        inPlace: true,
        inputs: {
            source: {
                type: "image",
                uniform: "source",
                shaderDirty: false,
            },
        },
        title: "Crosshatch",
        description: "Cross hatch images",
    });
});
