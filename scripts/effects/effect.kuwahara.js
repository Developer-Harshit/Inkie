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

    Seriously.plugin("kuwahara", {
        shader: function (inputs, shaderSource, utilities) {
            shaderSource.fragment = [
                "precision mediump float;",

                "#define Blend(base, blend, funcf)		vec3(funcf(base.r, blend.r), funcf(base.g, blend.g), funcf(base.b, blend.b))",
                "#define BlendOverlayf(base, blend) (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)))",
                "#define BlendOverlay(base, blend)		Blend(base, blend, BlendOverlayf)",

                "varying vec2 vTexCoord;",

                "uniform sampler2D source;",

                "uniform vec2 resolution;",
                "uniform float amount;",
                "uniform float time;",

                utilities.shader.noiseHelpers,
                utilities.shader.snoise3d,
                utilities.shader.random,

                // Port of Anisotropic Kuwahara Filtering on the GPU by Jan Eric Kyprianidis >
                // Also implemented by Brad Larson

                "	vec2 src_size = 1. / resolution.xy;",
                "const int radius = 4;",
                "vec4 lookup(int dx, int dy) {",
                "   vec2 uv = src_size * vec2(dx, dy) + vTexCoord;",
                "	return texture2D(source, uv);",

                "}",

                "void main(void) {",

                "	float n = float((radius + 1) * (radius + 1));",

                "	vec3 m0 = vec3(0.0);",
                "	vec3 m1 = vec3(0.0);",
                "	vec3 m2 = vec3(0.0);",
                "	vec3 m3 = vec3(0.0);",
                "	vec3 s0 = vec3(0.0);",
                "	vec3 s1 = vec3(0.0);",
                "	vec3 s2 = vec3(0.0);",
                "	vec3 s3 = vec3(0.0);",
                "	vec3 c;",

                "	for (int j = -radius; j <= 0; ++j) {",
                "		for (int i = -radius; i <= 0; ++i) {",
                "			c = lookup(i, j).rgb;",
                "			m0 += c;",
                "			s0 += c * c;",
                "		}",
                "	}",

                "	for (int j = -radius; j <= 0; ++j) {",
                "		for (int i = 0; i <= radius; ++i) {",
                "			c = lookup(i, j).rgb;",
                "			m1 += c;",
                "			s1 += c * c;",
                "		}",
                "	}",

                "	for (int j = 0; j <= radius; ++j) {",
                "		for (int i = 0; i <= radius; ++i) {",
                "			c = lookup(i, j).rgb;",
                "			m2 += c;",
                "			s2 += c * c;",
                "		}",
                "	}",

                "	for (int j = 0; j <= radius; ++j) {",
                "		for (int i = -radius; i <= 0; ++i) {",
                "			c = lookup(i, j).rgb;",
                "			m3 += c;",
                "			s3 += c * c;",
                "		}",
                "	}",

                "	float min_sigma2 = 1e+2;",
                "	m0 /= n;",
                "	s0 = abs(s0 / n - m0 * m0);",

                "	float sigma2 = s0.r + s0.g + s0.b;",
                "	if (sigma2 < min_sigma2) {",
                "		min_sigma2 = sigma2;",
                "		gl_FragColor = vec4(m0, 1.0);",
                "	}",

                "	m1 /= n;",
                "	s1 = abs(s1 / n - m1 * m1);",

                "	sigma2 = s1.r + s1.g + s1.b;",
                "	if (sigma2 < min_sigma2) {",
                "		min_sigma2 = sigma2;",
                "		gl_FragColor = vec4(m1, 1.0);",
                "	}",

                "	m2 /= n;",
                "	s2 = abs(s2 / n - m2 * m2);",

                "	sigma2 = s2.r + s2.g + s2.b;",
                "	if (sigma2 < min_sigma2) {",
                "		min_sigma2 = sigma2;",
                "		gl_FragColor = vec4(m2, 1.0);",
                "	}",

                "	m3 /= n;",
                "	s3 = abs(s3 / n - m3 * m3);",

                "	sigma2 = s3.r + s3.g + s3.b;",
                "	if (sigma2 < min_sigma2) {",
                "		min_sigma2 = sigma2;",
                "		gl_FragColor = vec4(m3, 1.0);",
                "	}",
                "	gl_FragColor*=1.2;",
                "	gl_FragColor = floor(gl_FragColor * (10.0-1.0)+0.5)/(10.0-1.0);",
                "	vec4 pixel = gl_FragColor;",
                "	float r = random(vec2(time * vTexCoord.xy));",
                "	float noise = snoise(vec3(vTexCoord * (1024.4 + r * 512.0), time)) * 0.5;",

                "	vec3 overlay = BlendOverlay(pixel.rgb, vec3(noise));",

                "	pixel.rgb = mix(pixel.rgb, overlay, amount);",
                "	gl_FragColor = pixel;",
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

            amount: {
                type: "number",
                uniform: "amount",
                min: 0,
                max: 1,
                defaultValue: 0.2,
            },
            time: {
                type: "number",
                uniform: "time",
                defaultValue: 0,
                mod: 65536,
            },
        },
        title: "Kuwahara",
        description: " Kuwahara",
    });
});
