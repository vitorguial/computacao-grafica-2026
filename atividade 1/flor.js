const canvas = document.getElementById("canvas1");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

const vertices = new Float32Array([
     0.2203, 0.2866, //ponto J
     0.2883, 0.6871, //ponto K
     0.5335, 0.4121, //ponto L

     0.5924, 0.7156, //ponto M
     0.2883, 0.6871, //ponto K
     0.5335, 0.4121, //ponto L

     -0.2079, -0.3055, //ponto N
     -0.4892, -0.5195, //ponto O
     -0.1855, -0.6792, //ponto P

     -0.4718, -0.8289, //ponto Q
     -0.4892, -0.5195, //ponto O
     -0.1855, -0.6792, //ponto P

    -0.2, -0.2, //ponto A
     0.2, -0.2, //ponto B
     0.0,  0.2, //ponto C

    -0.4,  0.2, //ponto D
    -0.2, -0.2, //ponto A
     0.0,  0.2, //ponto C

     0.4,  0.2, //ponto E
     0.2, -0.2, //ponto B
     0.0,  0.2, //ponto C

     0.0, -0.5, //ponto F
    -0.2, -0.2, //ponto A
     0.2, -0.2, //ponto B

    -0.4, -0.3, //ponto G
    -0.4,  0.2, //ponto D
     0.0, -0.5, //ponto F

     0.0,  0.45,//ponto H
     0.4,  0.2, //ponto E
    -0.4,  0.2, //ponto D

     0.4, -0.3, //ponto I
     0.4,  0.2, //ponto E
     0.0, -0.5, //ponto F

]);


// --------------------------------------------------
// 1. CORES
// --------------------------------------------------

const colors = new Float32Array([
    0.1, 0.4, 0.1,
    0.1, 0.4, 0.1,
    0.1, 0.4, 0.1,

    0.4, 0.8, 0.4,
    0.4, 0.8, 0.4,
    0.4, 0.8, 0.4,

    0.4, 0.8, 0.4,
    0.4, 0.8, 0.4,
    0.4, 0.8, 0.4,

    0.1, 0.4, 0.1,
    0.1, 0.4, 0.1,
    0.1, 0.4, 0.1,

    1.0, 0.3, 0.3,
    1.0, 0.3, 0.3,
    1.0, 0.3, 0.3,

    0.7, 0.1, 0.1,
    0.7, 0.1, 0.1,
    0.7, 0.1, 0.1,

    0.7, 0.1, 0.1,
    0.7, 0.1, 0.1,
    0.7, 0.1, 0.1,

    0.7, 0.1, 0.1,
    0.7, 0.1, 0.1,
    0.7, 0.1, 0.1,

    0.4, 0.1, 0.1,
    0.4, 0.1, 0.1,
    0.4, 0.1, 0.1,

    0.4, 0.1, 0.1,
    0.4, 0.1, 0.1,
    0.4, 0.1, 0.1,

    0.4, 0.1, 0.1,
    0.4, 0.1, 0.1,
    0.4, 0.1, 0.1,
])


// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
);

const colorsBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    colors,
    gl.STATIC_DRAW
);


// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;
in vec3 aColor;

out vec3 vColor;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColor = aColor;
}

`;


// --------------------------------------------------
// 4. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec3 vColor;

out vec4 outColor;

void main() {
    outColor = vec4(vColor, 1.0);
}

`;


// --------------------------------------------------
// 5. COMPILAR SHADERS
// --------------------------------------------------

function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}


const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);


// --------------------------------------------------
// 6. CRIAR PROGRAMA
// --------------------------------------------------

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

    throw new Error(
        gl.getProgramInfoLog(program)
    );
}


// --------------------------------------------------
// 7. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getAttribLocation(
        program,
        "aColor"
    );


// --------------------------------------------------
// 8. CONFIGURAR ATRIBUTOS
// --------------------------------------------------

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.enableVertexAttribArray(positionLocation);

gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

gl.enableVertexAttribArray(colorLocation);

gl.vertexAttribPointer(
    colorLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
);


// --------------------------------------------------
// 9. LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.0, 0.0, 0.0, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// 10. DESENHAR
// --------------------------------------------------

gl.useProgram(program);

const numComponents = 2;

gl.drawArrays(
    gl.TRIANGLES,
    0,
    vertices.length / numComponents
);