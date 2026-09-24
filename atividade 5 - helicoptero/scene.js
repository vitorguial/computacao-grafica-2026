// ==================================================
// CLASS - SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.renderer =
            new Renderer(gl, program);

        // Figura que será exibida
        this.helicopterBody = new HelicopterBody();

        this.helicopterTopShaft = new HelicopterTopShaft();

        this.helicopterTail = new HelicopterTail();

        this.helicopterPropellers = new HelicopterPropellers();

        this.helicopterTailPropeller = new HelicopterTailPropeller();

        this.position = {x: 0.0, y: 0.0, z: 0.0};

        this.speed = 0.02;
        this.theta = 0.0;
        this.tailTheta = 0.0;

        this.keys = {w: false,s: false,a: false,d: false};

        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener("keydown", (event) => {
            const key = event.key.toLowerCase();

            if (key === "w") this.keys.w = true;
            if (key === "s") this.keys.s = true;
            if (key === "a") this.keys.a = true;
            if (key === "d") this.keys.d = true;
        });

        document.addEventListener("keyup", (event) => {
            const key = event.key.toLowerCase();

            if (key === "w") this.keys.w = false;
            if (key === "s") this.keys.s = false;
            if (key === "a") this.keys.a = false;
            if (key === "d") this.keys.d = false;
        });
    }

    update() {
        this.theta += 0.35;
        this.tailTheta += 0.55;

        if (this.keys.a){
            this.position.x -= this.speed;
        }

        if( this.keys.d){
            this.position.x += this.speed;
        }
        
        if (this.keys.w){
            this.position.y += this.speed;
        }

        if (this.keys.s){
            this.position.y -= this.speed;
        }

        const helicopterTransform = m4.translation(this.position.x,this.position.y,this.position.z);

        this.helicopterBody.update(helicopterTransform);
        this.helicopterTopShaft.update(helicopterTransform);
        this.helicopterTail.update(helicopterTransform);

        this.helicopterPropellers.update(m4.multiply(helicopterTransform,m4.yRotation(this.theta)));
        this.helicopterTailPropeller.update(m4.multiply(helicopterTransform,m4.multiply(m4.translation(0.7, 0, 0),m4.multiply(m4.zRotation(this.tailTheta),m4.translation(-0.7, 0, 0)))));
    }

    draw() {

        gl.clear(
            gl.COLOR_BUFFER_BIT |
            gl.DEPTH_BUFFER_BIT
        );

        gl.useProgram(program);

        this.helicopterBody.draw(
            this.renderer
        );

        this.helicopterTopShaft.draw(
            this.renderer
        );

        this.helicopterTail.draw(
            this.renderer
        );

        this.helicopterPropellers.draw(
            this.renderer
        );

        this.helicopterTailPropeller.draw(
            this.renderer
        );
    }

    execute() {

        this.update();
        this.draw();

        requestAnimationFrame(
            () => this.execute()
        );
    }

    init() {

        requestAnimationFrame(
            () => this.execute()
        );
    }
}
