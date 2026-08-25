{
const canvas = document.getElementById("canvas2");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

function trapezoidVertices(topWidth, bottomWidth, height, posX, posY) {
    const halfTopWidth = topWidth / 2;
    const halfBottomWidth = bottomWidth / 2;
    const halfHeight = height / 2;

    const vertices = [
        posX - halfBottomWidth, posY - halfHeight,
        posX + halfBottomWidth, posY - halfHeight,
        posX + halfTopWidth, posY + halfHeight,

        posX - halfBottomWidth, posY - halfHeight,
        posX + halfTopWidth, posY + halfHeight,
        posX - halfTopWidth, posY + halfHeight
    ];

    return new Float32Array(vertices);
}

function anglerectVertices(sizeX, sizeY, posX, posY, angle) {
    const halfSizeX = sizeX / 2;
    const halfSizeY = sizeY / 2;

    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    const vertices = [
        posX - halfSizeX * cosAngle + halfSizeY * sinAngle, posY - halfSizeX * sinAngle - halfSizeY * cosAngle,
        posX + halfSizeX * cosAngle + halfSizeY * sinAngle, posY + halfSizeX * sinAngle - halfSizeY * cosAngle,
        posX + halfSizeX * cosAngle - halfSizeY * sinAngle, posY + halfSizeX * sinAngle + halfSizeY * cosAngle,

        posX - halfSizeX * cosAngle + halfSizeY * sinAngle, posY - halfSizeX * sinAngle - halfSizeY * cosAngle,
        posX + halfSizeX * cosAngle - halfSizeY * sinAngle, posY + halfSizeX * sinAngle + halfSizeY * cosAngle,
        posX - halfSizeX * cosAngle - halfSizeY * sinAngle, posY - halfSizeX * sinAngle + halfSizeY * cosAngle
    ];

    return new Float32Array(vertices);
}

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

    //juntas
    ...anglerectVertices(0.4, 0.1, -0.4, 0.2, 225 * Math.PI / 180),
    ...anglerectVertices(0.4, 0.1,  0.4, 0.2, 315 * Math.PI / 180),
    
    ...rectVertices(0.2, 0.4, 0.0, 0.4),

    //propulsores
    ...circleVertices(0.3, 40, 0, -0.6),
    ...circleVertices(0.2, 40, 0, -0.6),

    //corpo
    ...rectVertices(0.6, 0.5, 0.0, 0.8),
    ...rectVertices(0.2, 0.6, -0.6, 0.0),
    ...rectVertices(0.2, 0.6, 0.6, 0.0),
    ...rectVertices(0.6, 0.9, 0.0, 0.0),

    //olho esquerdo
    ...circleVertices(0.1, 40, 0.3, 0.8),
    ...circleVertices(0.05, 40, 0.3, 0.8),

    //olho direito
    ...circleVertices(0.1, 40, -0.3, 0.8),
    ...circleVertices(0.05, 40, -0.3, 0.8),

    //nariz
    ...trapezoidVertices(0.05, 0.1, 0.3, 0.0, 0.8)
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

function trapezoidColors(r, g, b) {
    const colors = [];

    for (let i = 0; i < 6; i++) {
        colors.push(r, g, b);
    }

    return new Float32Array(colors);
}
const colors = new Float32Array([
    
    ...rectColors(0.4, 0.4, 0.4),
    ...rectColors(0.4, 0.4, 0.4),

    ...rectColors(0.4, 0.4, 0.4),

    ...circleColors(40, 1.0, 0.2, 0.2),
    ...circleColors(40, 1.0, 1.0, 0.2),

    ...rectColors(0.7, 0.7, 0.7),
    ...rectColors(0.7, 0.7, 0.7),
    ...rectColors(0.7, 0.7, 0.7),
    ...rectColors(0.7, 0.7, 0.7),

    ...circleColors(40, 0.25, 0.25, 0.25),
    ...circleColors(40, 1.0, 0.1, 0.1),

    ...circleColors(40, 0.25, 0.25, 0.25),
    ...circleColors(40, 1.0, 0.1, 0.1),

    ...trapezoidColors(0.25, 0.25, 0.25)
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