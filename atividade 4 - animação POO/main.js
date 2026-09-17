const canvas = document.getElementById("canvas1");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


// ==================================================
// SHADERS
// ==================================================

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_viewTransform;
uniform mat3 u_modelTransform;

void main() {
    vec3 position = u_viewTransform * u_modelTransform * vec3(aPosition, 1.0);
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec3 uColor;

out vec4 outColor;

void main() {
    outColor = vec4(uColor, 1.0);
}
`;


// ==================================================
// CRIAÇÃO DOS SHADERS
// ==================================================

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


function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program));
    }

    return program;
}


const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);


// ==================================================
// CLASSE RENDERER
// ==================================================

class Renderer {

    constructor(gl, program) {
        this.gl = gl;
        this.program = program;

        this.positionLocation = gl.getAttribLocation(program, "aPosition");
        this.colorLocation = gl.getUniformLocation(program, "uColor");
        this.viewTransformLocation = gl.getUniformLocation(program, "u_viewTransform");
        this.modelTransformLocation = gl.getUniformLocation(program, "u_modelTransform");

        this.viewTransform = m3.identity();

        this.verticesBuffer = gl.createBuffer();
    }

    defineViewTransform(viewTransform) {
        this.viewTransform = viewTransform;
    }

    draw(object) {
        const gl = this.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, object.vertices, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(this.positionLocation);

        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform3fv(this.colorLocation, object.color);

        gl.uniformMatrix3fv(this.modelTransformLocation, false, object.modelTransform);

        gl.uniformMatrix3fv(this.viewTransformLocation, false, this.viewTransform);

        gl.drawArrays(gl.TRIANGLES, 0, object.vertices.length / 2);
    }
}


// ==================================================
// FUNÇÕES PARA CRIAR VÉRTICES
// ==================================================

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

    for (let i = 0; i < numSides; i++) {
        const angle1 = i * 2 * Math.PI / numSides;
        const angle2 = (i + 1) * 2 * Math.PI / numSides;

        vertices.push(posX, posY);

        vertices.push(radius * Math.cos(angle1) + posX, radius * Math.sin(angle1) + posY);

        vertices.push(radius * Math.cos(angle2) + posX, radius * Math.sin(angle2) + posY);
    }

    return new Float32Array(vertices);
}


// ==================================================
// CORES
// ==================================================

function rectColors(r, g, b) {
    const colors = [];

    for (let i = 0; i < 6; i++) {
        colors.push(r, g, b);
    }

    return new Float32Array(colors);
}


function circleColors(numSides, r, g, b) {
    const colors = [];

    for (let i = 0; i < numSides; i++) {
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


// ==================================================
// CLASSE SCENE OBJECT
// ==================================================

class SceneObject {

    constructor(vertices, color) {
        this.vertices = vertices;
        this.color = color;
        this.modelTransform = m3.identity();
    }

    updateModelTransform(modelTransform) {
        this.modelTransform = modelTransform;
    }
}


// ==================================================
// CLASSE ROBOT
// ==================================================

class Robot {

    constructor() {

        // ------------------------------------------
        // CORES
        // ------------------------------------------

        const grayDark = new Float32Array([0.4, 0.4, 0.4]);

        const grayLight = new Float32Array([0.7, 0.7, 0.7]);

        const black = new Float32Array([0.25, 0.25, 0.25]);


        // ==================================================
        // JUNTA ESQUERDA
        // ==================================================

        this.leftJoint = new SceneObject(anglerectVertices(0.4, 0.1, -0.4, 0.2, 225 * Math.PI / 180), grayDark);


        // ==================================================
        // JUNTA DIREITA
        // ==================================================

        this.rightJoint = new SceneObject(anglerectVertices(0.4, 0.1, 0.4, 0.2, 315 * Math.PI / 180), grayDark);


        // ==================================================
        // BRAÇO ESQUERDO
        // ==================================================

        this.leftArm = new SceneObject(rectVertices(0.2, 0.6, -0.6, 0.0), grayLight);


        // ==================================================
        // BRAÇO DIREITO
        // ==================================================

        this.rightArm = new SceneObject(rectVertices(0.2, 0.6, 0.6, 0.0), grayLight);


        // ==================================================
        // PESCOÇO
        // ==================================================

        this.centralJoint = new SceneObject(rectVertices(0.2, 0.4, 0.0, 0.4), grayDark);


        // ==================================================
        // PROPULSOR EXTERNO
        // ==================================================

        this.outerPropulsor = new SceneObject(circleVertices(0.3, 40, 0, -0.6), new Float32Array([1.0, 0.2, 0.2]));


        // ==================================================
        // PROPULSOR INTERNO
        // ==================================================

        this.innerPropulsor = new SceneObject(circleVertices(0.2, 40, 0, -0.6), new Float32Array([1.0, 1.0, 0.2]));


        // ==================================================
        // CORPO
        // ==================================================

        this.body = new SceneObject(rectVertices(0.6, 0.9, 0.0, 0.0), grayLight);


        // ==================================================
        // CABEÇA
        // ==================================================

        this.head = new SceneObject(rectVertices(0.6, 0.5, 0.0, 0.8), grayLight);


        // ==================================================
        // OLHO ESQUERDO
        // ==================================================

        this.leftEyeOuter = new SceneObject(circleVertices(0.1, 40, 0.3, 0.8), black);

        this.leftEyeInner = new SceneObject(circleVertices(0.05, 40, 0.3, 0.8), new Float32Array([1.0, 0.1, 0.1]));


        // ==================================================
        // OLHO DIREITO
        // ==================================================

        this.rightEyeOuter = new SceneObject(circleVertices(0.1, 40, -0.3, 0.8), black);

        this.rightEyeInner = new SceneObject(circleVertices(0.05, 40, -0.3, 0.8), new Float32Array([1.0, 0.1, 0.1]));


        // ==================================================
        // NARIZ
        // ==================================================

        this.nose = new SceneObject(trapezoidVertices(0.05, 0.1, 0.3, 0.0, 0.8), black);


        // ==================================================
        // POSIÇÃO DO ROBÔ
        // ==================================================

        this.tx = 0.0;
        this.ty = 0.0;


        // ==================================================
        // TEMPO
        // ==================================================

        this.time = 0.0;


        // ==================================================
        // FLUTUAÇÃO
        // ==================================================

        this.floatAmplitude = 0.08;
        this.floatSpeed = 2.0;


        // ==================================================
        // ACENO
        // ==================================================

        this.waveAmplitude = 30 * Math.PI / 180;
        this.waveSpeed = 3.0;
    }


    // ==================================================
    // ATUALIZAÇÃO DA ANIMAÇÃO
    // ==================================================

    update(deltaTime) {

        this.time += deltaTime;


        // ==================================================
        // FLUTUAÇÃO
        // ==================================================

        this.ty = Math.sin(this.time * this.floatSpeed) * this.floatAmplitude;


        // ==================================================
        // MOVIMENTO DO TCHAU
        // ==================================================

        const waveAngle = Math.sin(this.time * this.waveSpeed) * this.waveAmplitude;


        // ==================================================
        // TRANSFORMAÇÃO GERAL DO ROBÔ
        // ==================================================

        const robotTransform = m3.translation(this.tx, this.ty);


        // ==================================================
        // BRAÇO ESQUERDO
        // ==================================================

        this.leftJoint.updateModelTransform(robotTransform);

        this.leftArm.updateModelTransform(robotTransform);


        // ==================================================
        // BRAÇO DIREITO + JUNTA DIREITA
        // ==================================================

        const shoulderX = 0.22;
        const shoulderY = 0.31;

        const waveTransform = m3.multiply(m3.translation(shoulderX, shoulderY), m3.multiply(m3.rotation(waveAngle), m3.translation(-shoulderX, -shoulderY)));


        // ==================================================
        // JUNTA DIREITA
        // ==================================================

        const rightJointTransform = m3.multiply(robotTransform, waveTransform);

        this.rightJoint.updateModelTransform(rightJointTransform);


        // ==================================================
        // BRAÇO DIREITO
        // ==================================================

        const rightArmTransform = m3.multiply(robotTransform, waveTransform);

        this.rightArm.updateModelTransform(rightArmTransform);


        // ==================================================
        // RESTANTE DO ROBÔ
        // ==================================================

        this.centralJoint.updateModelTransform(robotTransform);

        this.outerPropulsor.updateModelTransform(robotTransform);

        this.innerPropulsor.updateModelTransform(robotTransform);

        this.body.updateModelTransform(robotTransform);

        this.head.updateModelTransform(robotTransform);

        this.leftEyeOuter.updateModelTransform(robotTransform);

        this.leftEyeInner.updateModelTransform(robotTransform);

        this.rightEyeOuter.updateModelTransform(robotTransform);

        this.rightEyeInner.updateModelTransform(robotTransform);

        this.nose.updateModelTransform(robotTransform);
    }


    // ==================================================
    // DESENHAR ROBÔ
    // ==================================================

    draw(renderer) {

        // Braços e juntas
        renderer.draw(this.leftArm);
        renderer.draw(this.leftJoint);

        renderer.draw(this.rightArm);
        renderer.draw(this.rightJoint);


        // Propulsores
        renderer.draw(this.outerPropulsor);
        renderer.draw(this.innerPropulsor);


        // Corpo
        renderer.draw(this.body);


        // Pescoço
        renderer.draw(this.centralJoint);


        // Cabeça
        renderer.draw(this.head);


        // Olhos
        renderer.draw(this.leftEyeOuter);
        renderer.draw(this.leftEyeInner);

        renderer.draw(this.rightEyeOuter);
        renderer.draw(this.rightEyeInner);


        // Nariz
        renderer.draw(this.nose);
    }
}


// ==================================================
// CLASSE SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.renderer = new Renderer(gl, program);

        this.viewTransform = m3.setClippingWindow(-2.0, -1.5, 2.0, 1.5);

        this.renderer.defineViewTransform(this.viewTransform);

        this.robot = new Robot();

        this.lastTime = 0;
    }


    // ==================================================
    // UPDATE
    // ==================================================

    update(currentTime) {

        if (this.lastTime === 0) {
            this.lastTime = currentTime;
        }

        const deltaTime = (currentTime - this.lastTime) / 1000;

        this.lastTime = currentTime;

        this.robot.update(deltaTime);
    }


    // ==================================================
    // DRAW
    // ==================================================

    draw() {

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        this.robot.draw(this.renderer);
    }


    // ==================================================
    // LOOP DA ANIMAÇÃO
    // ==================================================

    execute(currentTime) {

        this.update(currentTime);

        this.draw();

        requestAnimationFrame((time) => this.execute(time));
    }


    // ==================================================
    // INICIAR
    // ==================================================

    init() {

        requestAnimationFrame((time) => this.execute(time));
    }
}


// ==================================================
// CONFIGURAÇÃO DO WEBGL
// ==================================================

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.viewport(0, 0, canvas.width, canvas.height);


// ==================================================
// CRIAR CENA
// ==================================================

const scene = new Scene(gl, program);


// ==================================================
// INICIAR ANIMAÇÃO
// ==================================================

scene.init();