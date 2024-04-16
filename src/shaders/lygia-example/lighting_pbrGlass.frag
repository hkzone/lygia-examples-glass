// https ://github.com/patriciogonzalezvivo/lygia_examples/blob/main/lighting_pbrGlass.frag
// Copyright Patricio Gonzalez Vivo, 2022 - http://patriciogonzalezvivo.com/

#ifdef GL_ES
precision mediump float;
#endif

uniform samplerCube u_cubeMap;
uniform vec3 u_SH[9];

uniform vec3 u_camera;

uniform vec3 u_light;
uniform vec3 u_lightColor;

uniform vec2 u_resolution;
uniform float u_time;

varying vec4 v_position;
varying vec4 v_color;
varying vec3 v_normal;
varying vec2 v_texcoord;

#define RESOLUTION          u_resolution
#define SURFACE_POSITION    v_position
#define CAMERA_POSITION     cameraPosition
#define LIGHT_DIRECTION     u_light
#define LIGHT_COLOR         u_lightColor

// #define TRANSPARENT_DISPERSION 0.1
// #define TRANSPARENT_DISPERSION_PASSES 4
// #define TRANSPARENT_DISPERSION_FAST

#define SCENE_CUBEMAP           u_cubeMap
#define SCENE_SH_ARRAY          u_SH

#include ../lygia/color/space/linear2gamma.glsl
#include ../lygia/lighting/pbrGlass.glsl
#include ../lygia/lighting/material/new.glsl

void main(void) {
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    vec2 pixel = 1.0 / u_resolution;
    vec2 st = gl_FragCoord.xy * pixel;

    Material mat = materialNew();
    // mat.roughness = 0.05;

    color = pbrGlass(mat);
    color = linear2gamma(color);
    // color = textureCube(u_cubeMap, vec3(v_texcoord, 1.));
    // color = vec4(u_SH[0], 1.);

    gl_FragColor = color;
}