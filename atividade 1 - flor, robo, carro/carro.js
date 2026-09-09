{
const canvas = document.getElementById("canvas3");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------


function rectVertices(sizeX, sizeY, posX, posY) {
    const halfSizeX = sizeX / 2;
    const halfSizeY = sizeY / 2;

    const vertices = [
        posX - halfSizeX, posY - halfSizeY,
        posX + halfSizeX, posY - halfSizeY,
        posX + halfSizeX, posY + halfSizeY,

        posX - halfSizeX, posY - halfSizeY,
        posX + halfSizeX, posY + halfSizeY,
        posX - halfSizeX, posY + halfSizeY
    ];

    return new Float32Array(vertices);
}

function circleVertices(radius, numSides, posX, posY) {
    const vertices = [];
    let angle, x, y;

    // Calculate pentagon vertices
    for (let i = 0; i <= numSides-1; i++) {

        angle = i * 2 * Math.PI / numSides;
        x = (radius * Math.cos(angle)) + posX;
        y = (radius * Math.sin(angle)) + posY;

        vertices.push(x, y);

        angle = (i+1) * 2 * Math.PI / numSides;
        x = (radius * Math.cos(angle)) + posX;
        y = (radius * Math.sin(angle)) + posY;
        vertices.push(x, y);

        vertices.push(posX, posY);
        
    }

    return new Float32Array(vertices);
}

const vertices = new Float32Array([
    ...rectVertices(0.6, 0.3, 0.0, -0.05),
    ...rectVertices(0.3, 0.17, -0.3, -0.115),
    ...rectVertices(0.3, 0.17, 0.3, -0.115),

    ...rectVertices(0.2, 0.1, -0.10, 0.02),
    ...rectVertices(0.2, 0.1, 0.15, 0.02),

    ...circleVertices(0.1, 40, 0.2, -0.2),
    ...circleVertices(0.05, 40, 0.2, -0.2),

    ...circleVertices(0.1, 40, -0.2, -0.2),
    ...circleVertices(0.05, 40, -0.2, -0.2)
]);

// --------------------------------------------------
// 1. CORES
// --------------------------------------------------
function rectColors(r, g, b) {
    const colors = [];

    for (let i = 0; i < 6; i++) {
        colors.push(r, g, b);
    }

    return new Float32Array(colors);
}

function circleColors(numSides, r, g, b) {
    const colors = [];

    for (let i = 0; i <= numSides-1; i++) {
        // Center point of the pentagon
        colors.push(r, g, b);
        colors.push(r, g, b);
        colors.push(r, g, b);
    }

    return new Float32Array(colors);
}

const colors = new Float32Array([
    ...rectColors(1.0, 1.0, 0.0),
    ...rectColors(1.0, 1.0, 0.0),
    ...rectColors(1.0, 1.0, 0.0),

    ...rectColors(0.5, 1.0, 1.0),
    ...rectColors(0.5, 1.0, 1.0),

    ...circleColors(40, 0.1, 0.1, 0.1),
    ...circleColors(40, 0.5, 0.5, 0.5),

    ...circleColors(40, 0.1, 0.1, 0.1),
    ...circleColors(40, 0.5, 0.5, 0.5),
]);

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

gl.clearColor(1.0, 1.0, 1.0, 1.0);

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
}