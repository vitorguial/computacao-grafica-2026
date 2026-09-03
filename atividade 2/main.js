{
const canvas = document.getElementById("canvas1");
const gl = canvas.getContext("webgl2");

const modo = document.getElementById("modo");
const tamanho = document.getElementById("tamanho");
const cor = document.getElementById("cor");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// se for r é linha e se for t é triangulo
let tipo = "r"

//auxiliador para a contabilização de quantidade de pontos
let qntponto = 0
// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

function BrasehamPoints(P1x, P1y, P2x, P2y) {
    let points = [];
    let dx = P2x - P1x;
    let dy = P2y - P1y;

    //caso seja reta vertical
    if(dx == 0){
        x = P1x; y = P1y;
        points.push(x, y);
        if (y == P2y){
            return new Float32Array(points);
        }
        if (y < P2y){
            while (y < P2y){
                y++;
                points.push(x,y)
            }
        }else{
            while (y > P2y){
                y--;
                points.push(x,y)
            }
        }
        return new Float32Array(points);
    }

    //caso seja reta horizontal
    if(dy == 0){
        x = P1x; y = P1y;
        points.push(x, y);
        if (x == P2x){
            return new Float32Array(points);
        }
        if (x < P2x){
            while (x < P2x){
                x++;
                points.push(x,y)
            }
        }else{
            while (x > P2x){
                x--;
                points.push(x,y)
            }
        }
        return new Float32Array(points);
    }

    //flag pra reverter a lista de vertices depois
    let reverte = false;

    //se for o caso que uma simples troca resolve
    if((dx < 0 && dy < 0) || (dx < 0 && dy > 0)){

        reverte = true

        let salvaP2x = P2x
        let salvaP2y = P2y

        P2y = P1y
        P2x = P1x

        P1x = salvaP2x
        P1y = salvaP2y

        dx = P2x - P1x;
        dy = P2y - P1y;
    }

    const m = (dy/dx)

    x = P1x; y = P1y;
    points.push(x, y);

    //caso seja função decrescente
    if(dx > 0 && dy < 0) {

        //caso tenha menos de 45º
        if (m < 0 && m > -1){
            const incSup = 2*(-dy - dx);
            const incInf = 2*-dy;

            let p = 2 * -dy - dx;

            while (x < P2x) {
                if (p < 0) {
                    p += incInf;
                } else {
                    p += incSup;
                    y--;
                }
                x++;
                points.push(x, y);
            }
        }else{
            const incSup = 2*(dx + dy);
            const incInf = 2*dx;

            let p = 2 * dx + dy;

            while (y > P2y) {
                if (p < 0) {
                    p += incInf;
                } else {
                    p += incSup;
                    x++;
                }
                y--;
                points.push(x, y);
            }
        }
    
    //caso seja função crescente
    }else{

        //caso tenha menos de 45º
        if(m > 0 && m < 1){

            const incSup = 2*(dy - dx);
            const incInf = 2*dy;

            let p = 2 * dy - dx;

            while (x < P2x) {
                if (p < 0) {
                    p += incInf;
                } else {
                    p += incSup;
                    y++;
                }
                x++;
                points.push(x, y);
            }
        }else{
            let p = 2 * dx - dy;

            const incSup = 2*(dx - dy);
            const incInf = 2*dx;
            
            while (y < P2y) {
                if (p < 0) {
                    p += incInf;
                } else {
                    p += incSup;
                    x++;
                }
                y++;
                points.push(x, y);
            }
        }
    }

    if (reverte){
        const resultado = [];

        for (let i = points.length - 2; i >= 0; i -= 2) {
            resultado.push(points[i], points[i + 1]);
        }

        points = resultado;
    }
    

    return new Float32Array(points);
}

function convertToNDC(points, canvasWidth, canvasHeight) {
    const ndcPoints = [];
    for (let i = 0; i < points.length; i += 2) {
        const x = (points[i] / (canvasWidth/2)) - 1;
        const y = -((points[i + 1] / (canvasHeight/2)) - 1);
        ndcPoints.push(x, y);
    }
    return new Float32Array(ndcPoints);
}

function createTriagle(points){
    let res = [];
    let res_aux = [];
    for(let i=0; i < canvas.height; i++){
        
        for(let j=1; j < points.length; j+=2){
            
            if(Math.floor(points[j]) == i){
                res_aux.push(points[j-1]);
            }
        }
        const menor = Math.min(...res_aux);
        const maior = Math.max(...res_aux);

        for(let j=menor+1; j<maior; j++){
            res.push(j,i);
        }
        res_aux = [];
    }
    return [...points, ...res];
}

let vertices = new Float32Array([]);

// --------------------------------------------------
// 1. CORES
// --------------------------------------------------
function LineColor(numPoints, r, g, b) {

    const colors = [];

    for (let i = 0; i < numPoints; i++) {
        colors.push(r, g, b);
    }

    return new Float32Array(colors);
}

let color_aux = [1.0, 1.0, 0.0]
let colors = new Float32Array([...LineColor(vertices.length / 2, ...color_aux)]);

// --------------------------------------------------
// 1. TAMANHO DOS PONTOS
// --------------------------------------------------

function pointSizesCalculado(numPoints, size) {
    const sizes = [];

    for (let i = 0; i < numPoints; i++) {
        sizes.push(size);
    }

    return new Float32Array(sizes);
}

// tamanho ponto
let pointSizes_aux = 5.0
let pointSizes = new Float32Array([...pointSizesCalculado(vertices.length / 2, pointSizes_aux)]);

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

const pointSizesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    pointSizes,
    gl.STATIC_DRAW
);


// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;
in vec3 aColor;
in float aPointSize;

out vec3 vColor;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    gl_PointSize = aPointSize;
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

const pointSizeLocation =
    gl.getAttribLocation(
        program,
        "aPointSize"
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

gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);

gl.enableVertexAttribArray(pointSizeLocation);

gl.vertexAttribPointer(
    pointSizeLocation,
    1,
    gl.FLOAT,
    false,
    0,
    0
);


//impede que o botão direito abra o menu browser
canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

//interação com mouse
canvas.addEventListener("mousedown", mouseClick, false);

function mouseClick(event) {

    const x = event.offsetX;
    const y = event.offsetY;

    if(tipo == "r"){
        if(qntponto == 0){
            vertices = new Float32Array([...convertToNDC([x, y, x, y], canvas.width, canvas.height)]);
            qntponto += 1;
        }else{
            if (event.button === 2) {
                vertices = new Float32Array([
                    ...convertToNDC(BrasehamPoints((vertices[0]+1)*300, ((-vertices[1]+1)*300), x, y), canvas.width, canvas.height),
                ]);
            }else{
                vertices = new Float32Array([
                    ...convertToNDC(BrasehamPoints(x, y, (vertices[vertices.length-2]+1)*300, ((-vertices[vertices.length-1]+1)*300)), canvas.width, canvas.height),
                ]);
            }
        }
    }else{
        if(qntponto < 3){
            let novoPontoNDC = convertToNDC([x, y], canvas.width, canvas.height);
            vertices = new Float32Array([...vertices, ...novoPontoNDC]);
            qntponto += 1;
            
            if(qntponto == 3){
                vertices = new Float32Array([
                    ...convertToNDC([
                    ...createTriagle([
                        ...BrasehamPoints((vertices[0]+1)*300, ((-vertices[1]+1)*300), (vertices[2]+1)*300, ((-vertices[3]+1)*300)),
                        ...BrasehamPoints((vertices[2]+1)*300, ((-vertices[3]+1)*300), (vertices[4]+1)*300, ((-vertices[5]+1)*300)),
                        ...BrasehamPoints((vertices[0]+1)*300, ((-vertices[1]+1)*300), (vertices[4]+1)*300, ((-vertices[5]+1)*300))
                    ])], canvas.width, canvas.height)
                ]);
            }
        }else{
            vertices = new Float32Array([])
            let novoPontoNDC = convertToNDC([x, y], canvas.width, canvas.height);
            vertices = new Float32Array([...vertices, ...novoPontoNDC]);
            qntponto = 1
        }
    }

    colors = new Float32Array([...LineColor(vertices.length / 2, ...color_aux),]);

    pointSizes = new Float32Array([...pointSizesCalculado(vertices.length / 2, pointSizes_aux)]);

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, pointSizes, gl.STATIC_DRAW);

    drawScene();
}

window.addEventListener("keydown", function(event) {
    
    switch(event.key) {
        case "t":
            
            tipo = "t"
            modo.textContent = "MODO: TRIÂNGULO"
            qntponto = 0
            vertices = new Float32Array([])
            break;

        case "r":
            tipo = "r"
            modo.textContent = "MODO: RETA"
            qntponto = 0
            vertices = new Float32Array([])
            break;

        case "ArrowUp":
            pointSizes_aux += 5.0;
            tamanho.textContent = "TAMANHO: "+pointSizes_aux
            pointSizes = new Float32Array([...pointSizesCalculado(vertices.length / 2, pointSizes_aux)])
            break;

        case "ArrowDown":
            pointSizes_aux -= 5.0;
            if (pointSizes_aux < 1.0) {
                pointSizes_aux = 1.0;
            }
            tamanho.textContent = "TAMANHO: "+pointSizes_aux
            pointSizes = new Float32Array([...pointSizesCalculado(vertices.length / 2, pointSizes_aux)])
            break;

        case "0":
            cor.textContent = "COR: BRANCO"
            color_aux = [1.0, 1.0, 1.0]
            colors = new Float32Array([...LineColor(vertices.length / 2, ...color_aux)]);
            break;

        case "1":
            cor.textContent = "COR: VERMELHO"
            color_aux = [1.0, 0.0, 0.0]
            colors = new Float32Array([...LineColor(vertices.length / 2, ...color_aux)]);
            break;

        case "2":
            cor.textContent = "COR: VERDE"
            color_aux = [0.0, 1.0, 0.0]
            colors = new Float32Array([...LineColor(vertices.length / 2, ...color_aux)]);
            break;

        case "3":
            cor.textContent = "COR: AZUL"
            color_aux = [0.0, 0.0, 1.0]
            colors = new Float32Array([...LineColor(vertices.length / 2, ...color_aux)]);
            break;

        case "4":
            cor.textContent = "COR: AMARELO"
            color_aux = [ 1.0, 1.0, 0.0]
            colors = new Float32Array([...LineColor(vertices.length / 2, ...color_aux)]);
            break;

        case "5":
            cor.textContent = "COR: ROSA CHOQUE"
            color_aux = [1.0, 0.0, 1.0]
            colors = new Float32Array([...LineColor(vertices.length / 2, ...color_aux)]);
            break;

        case "6":
            cor.textContent = "COR: CIANO"
            color_aux = [0.0, 1.0, 1.0]
            colors = new Float32Array([...LineColor(vertices.length / 2, ...color_aux)]);
            break;

        case "7":
            cor.textContent = "COR: LARANJA"
            color_aux = [1.0, 0.5, 0.0]
            colors = new Float32Array([...LineColor(vertices.length / 2, ...color_aux)]);
            break;

        case "8":
            cor.textContent = "COR: ROXO"
            color_aux = [0.5, 0.0, 1.0]
            colors = new Float32Array([...LineColor(vertices.length / 2, ...color_aux)]);
            break;

        case "9":
            cor.textContent = "COR: ROSA"
            color_aux = [1.0, 0.4, 0.7]
            colors = new Float32Array([...LineColor(vertices.length / 2, ...color_aux)]);
            break;

        default:
            return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, pointSizes, gl.STATIC_DRAW);

    drawScene();

});


gl.clearColor(0.0, 0.0, 0.0, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// 10. DESENHAR
// --------------------------------------------------

gl.useProgram(program);

const numComponents = 2;

function drawScene(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.drawArrays(
        gl.POINTS,
        0,
        vertices.length / numComponents
    );
}

drawScene();
}