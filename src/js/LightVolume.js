// #package js/main

// #include WebGL.js

class LightVolume {

    constructor(gl, type, x, y, z, dimensions, ratio) {
        this._gl = gl;

        this._type           = type;
        this._x              = x;
        this._y              = y;
        this._z              = z;
        this._dimensions     = dimensions;
        this._energyDensity  = null;
        this._ratio          = ratio;
        // this._lightDirection = null;
        this.createTextures();

    }

    createTextures() {
        this.deleteTexture();
        switch(this._type) {
            case 'distant':
                this.createDistantLight();
                break;
            case 'point':
                this.createPointLight();
                break;
        }
    }

    createDistantLight() {
        console.log("Creating distant light");
        const gl = this._gl;
        const dimensions = this._dimensions;
        const unitVector = this.toUnitVector([this._x, this._y, this._z]);
        const dirX = this._x = unitVector[0];
        const dirY = this._y = unitVector[1];
        const dirZ = this._z = unitVector[2];
        // Energy density
        this._energyDensity = gl.createTexture();

        // TODO separate function in WebGL.js
        gl.bindTexture(gl.TEXTURE_3D, this._energyDensity);
        gl.texStorage3D(gl.TEXTURE_3D, 1, gl.R32F, dimensions.width, dimensions.height, dimensions.depth);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        //let energyDensityArray = new Float32Array(dimensions.width * dimensions.height * dimensions.depth).fill(0);


        for (let z = 0; z < dimensions.depth; z++) {
            let energyDensityArray = [];
            for (let y = 0; y < dimensions.height; y++) {
                for (let x = 0; x < dimensions.width; x++) {
                    if (this.lightHitsBoundary(x, y, z, dirX, dirY, dirZ)) {
                        energyDensityArray.push(1);
                    } else {
                        energyDensityArray.push(0);
                    }
                }
            }
            gl.texSubImage3D(gl.TEXTURE_3D, 0,
                0, 0, z, dimensions.width, dimensions.height, 1,
                gl.RED, gl.FLOAT, new Float32Array(energyDensityArray));
        }

        // Light direction
        // this._lightDirection = gl.createTexture();
        //
        // // // TODO separate function in WebGL.js
        // gl.bindTexture(gl.TEXTURE_3D, this._lightDirection);
        // gl.texStorage3D(gl.TEXTURE_3D, 1, gl.RGBA32F, dimensions.width, dimensions.height, dimensions.depth);
        // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        // //
        // let lightDirectionArray = [];
        // const dirUnitVector = this.toUnitVector([dirX, dirY, dirZ]);
        //
        // for (let z = 0; z < dimensions.depth; z++) {
        //     for (let y = 0; y < dimensions.height; y++) {
        //         for (let x = 0; x < dimensions.width; x++) {
        //             lightDirectionArray.push(dirUnitVector[0]);
        //             lightDirectionArray.push(dirUnitVector[1]);
        //             lightDirectionArray.push(dirUnitVector[2]);
        //             lightDirectionArray.push(0);
        //         }
        //     }
        // }
        // gl.texSubImage3D(gl.TEXTURE_3D, 0,
        //     0, 0, 0, dimensions.width, dimensions.height, dimensions.depth,
        //     gl.RGBA, gl.FLOAT, new Float32Array(lightDirectionArray));
    }

    createPointLight() {
        const gl = this._gl;
        const dimensions = this._dimensions;
        let posX = this._x = Math.floor(this._x * dimensions.width);
        let posY = this._y = Math.floor(this._y * dimensions.height);
        let posZ = this._z = Math.floor(this._z * dimensions.depth);
        if (posX === 0)
            posX = this._x = 1;
        if (posY === 0)
            posY = this._y = 1;
        if (posZ === 0)
            posZ = this._z = 1;
        // Energy density
        this._energyDensity = gl.createTexture();

        // TODO separate function in WebGL.js
        gl.bindTexture(gl.TEXTURE_3D, this._energyDensity);
        gl.texStorage3D(gl.TEXTURE_3D, 1, gl.R32F, dimensions.width, dimensions.height, dimensions.depth);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        //let energyDensityArray = new Float32Array(dimensions.width * dimensions.height * dimensions.depth).fill(0);



        if (this.lightOutsideVolume()) {
            console.log("Creating point light - outside");
            for (let z = 0; z < dimensions.depth; z++) {
                let energyDensityArray = [];
                for (let y = 0; y < dimensions.height; y++) {
                    for (let x = 0; x < dimensions.width; x++) {
                        let dx = x - posX;
                        let dy = y - posY;
                        let dz = z - posZ;
                        if (this.lightHitsBoundary(x, y, z, dx, dy, dz)) {
                            energyDensityArray.push(1);
                        } else {
                            energyDensityArray.push(0);
                        }
                    }
                }
                gl.texSubImage3D(gl.TEXTURE_3D, 0,
                    0, 0, z, dimensions.width, dimensions.height, 1,
                    gl.RED, gl.FLOAT, new Float32Array(energyDensityArray));
            }
        } else {
            console.log("Creating point light - inside");
            for (let z = 0; z < dimensions.depth; z++) {
                let energyDensityArray = [];
                for (let y = 0; y < dimensions.height; y++) {
                    for (let x = 0; x < dimensions.width; x++) {
                        if (Math.abs(x - posX) < 2 &&
                            Math.abs(y - posY) < 2 &&
                            Math.abs(z - posZ) < 2)
                        {
                            energyDensityArray.push(1);
                        } else {
                            energyDensityArray.push(0);
                        }
                    }
                }
                gl.texSubImage3D(gl.TEXTURE_3D, 0,
                    0, 0, z, dimensions.width, dimensions.height, 1,
                    gl.RED, gl.FLOAT, new Float32Array(energyDensityArray));
            }
        }



        // Light direction
        // this._lightDirection = gl.createTexture();
        //
        // // // TODO separate function in WebGL.js
        // gl.bindTexture(gl.TEXTURE_3D, this._lightDirection);
        // gl.texStorage3D(gl.TEXTURE_3D, 1, gl.RGBA32F, dimensions.width, dimensions.height, dimensions.depth);
        // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        // //
        // let lightDirectionArray = [];
        // for (let z = 0; z < dimensions.depth; z++) {
        //     for (let y = 0; y < dimensions.height; y++) {
        //         for (let x = 0; x < dimensions.width; x++) {
        //             let dirVector = [x - posX, y - posY, z - posZ];
        //             let dirUnitVector = this.toUnitVector(dirVector);
        //             lightDirectionArray.push(dirUnitVector[0]);
        //             lightDirectionArray.push(dirUnitVector[1]);
        //             lightDirectionArray.push(dirUnitVector[2]);
        //             lightDirectionArray.push(0);
        //         }
        //     }
        // }
        // gl.texSubImage3D(gl.TEXTURE_3D, 0,
        //     0, 0, 0, dimensions.width, dimensions.height, dimensions.depth,
        //     gl.RGBA, gl.FLOAT, new Float32Array(lightDirectionArray));
    }

    hasEnergyDensity() {
        const gl = this._gl;
        return this._energyDensity && gl.isTexture(this._energyDensity);
    }

    deleteTexture() {
        const gl = this._gl;
        if (this._energyDensity && gl.isTexture(this._energyDensity)) {
            console.log("Texture deleted")
            gl.deleteTexture(this._energyDensity);
        }
    }

    toUnitVector(vector) {
        const vectorLength = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
        return [vector[0] / vectorLength, vector[1] / vectorLength, vector[2] / vectorLength];
    }

    lightOutsideVolume() {
        return  this._x < 0 || this._x >= this._dimensions.width ||
                this._y < 0 || this._y >= this._dimensions.height ||
                this._z < 0 || this._z >= this._dimensions.depth;
    }

    lightHitsBoundary(x, y, z, dx, dy, dz) {
        return x === 0 && dx > 0 ||
        x === this._dimensions.width - 1 && dx < 0 ||
        y === 0 && dy > 0 ||
        y === this._dimensions.height - 1 && dy < 0 ||
        z === 0 && dz > 0 ||
        z === this._dimensions.depth - 1 && dz < 0;
    }

    getType() {
        return this._type;
    }

    // getLightDirection() {
    //     return this._lightDirection;
    // }

    getEnergyDensity() {
        return this._energyDensity;
    }

    getDirection() {
        return [this._x, this._y, this._z];
    }

}