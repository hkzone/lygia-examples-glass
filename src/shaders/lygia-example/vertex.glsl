#ifndef PI
#define PI 3.141592653589793
#endif

precision highp float;

uniform mat4 invProjectionMatrix;
uniform mat4 invModelMatrix;

varying vec2 v_uv;
varying vec3 v_normal;
varying vec4 v_position;
varying vec2 v_texcoord;
varying vec4 v_color;

#include ../lygia/math/inverse.glsl

void main() {
    v_uv = uv;
    v_texcoord = uv;
    v_normal = normal;
    v_color = vec4(1.0);
    v_position = vec4(position, 1.0);
    gl_Position = projectionMatrix * modelMatrix * viewMatrix * vec4(position, 1.0);
}