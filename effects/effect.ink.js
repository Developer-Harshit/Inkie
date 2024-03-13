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

    Seriously.plugin("ink", {
        commonShader: true,
        shader: function (inputs, shaderSource) {
            var gl = this.gl;
            gl.getExtension("OES_standard_derivatives");
            gl.getExtension("EXT_shader_texture_lod");
            console.log(gl);
            shaderSource.fragment = [
                /// by Dom Mandy in 2023

                "precision mediump float;",
                "#extension GL_EXT_shader_texture_lod : enable",
                "#extension GL_OES_standard_derivatives : enable",

                "varying vec2 vTexCoord;",

                "uniform vec2 resolution;",
                "uniform sampler2D source;",
                "void main(void) {",
                // Get the gamma corrected luminance
                "vec4 tex = texture2D(source,vTexCoord);",
                "float v = dot(vec3(.2, .7, .1), pow(tex.rgb, vec3(0.5)));",

                // Tiling
                "ivec2 n = ivec2(mod(vTexCoord*resolution, 4.));",

                // Thresholds

                "vec4 t0 = vec4(0., 4., 2., 6.) / 8.0;",
                "vec4 t1 = vec4(1., 5., 3., 7.) / 8.0;",

                // Quantize pixel brightness on both axes

                "				if (t0[1] < v && t1[1] < v) {",
                "					gl_FragColor = vec4(vec3(1.0),1.0);",
                "				  } else {",
                "					gl_FragColor = vec4(tex.rgb*tex.rgb*0.6,1.0);",
                "				  }",

                // "gl_FragColor = vec4(t0[n.x] < v && t1[n.y] < v);",
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
        title: "Ink",
        description: "Ink Style",
    });
});
