(function(global) {
'use strict';

var Class = global.AbstractRenderer = AbstractRenderer;
var _ = Class.prototype;

// ========================== CLASS DECLARATION ============================ //

function AbstractRenderer(gl, volumeTexture, options) {
    this._opts = $.extend(this._opts || {}, Class.defaults, options);

    // option variables
    this._bufferSize = this._opts.bufferSize;

    // instance variables
    this._gl = gl;
    this._volumeTexture = volumeTexture;
    this._frameBuffer = null;
    this._accumulationBuffer = null;
    this._renderBuffer = null;
    this._mvpInverseMatrix = null;
    this._clipQuad = null;
    this._clipQuadProgram = null;

    // function binds

    this._init();
};

Class.defaults = {
    bufferSize: 512
};

// ======================= CONSTRUCTOR & DESTRUCTOR ======================== //

_._init = function() {
    var gl = this._gl;

    this._frameBuffer = new SingleBuffer(gl, this._getFrameBufferOptions());
    this._accumulationBuffer = new DoubleBuffer(gl, this._getAccumulationBufferOptions());
    this._renderBuffer = new SingleBuffer(gl, this._getRenderBufferOptions());

    this._mvpInverseMatrix = new Matrix();

    this._clipQuad = WebGLUtils.createClipQuad(gl);
    this._clipQuadProgram = WebGLUtils.compileShaders(gl, {
        quad: SHADERS.quad
    }).quad;
};

_.destroy = function() {
    var gl = this._gl;
    this._frameBuffer.destroy();
    this._accumulationBuffer.destroy();
    this._renderBuffer.destroy();
    gl.deleteBuffer(this._clipQuad);
    gl.deleteProgram(this._clipQuadProgram);
};

// =========================== INSTANCE METHODS ============================ //

_.render = function() {
    // TODO: put the following logic in VAO
    var gl = this._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._clipQuad);
    gl.enableVertexAttribArray(0); // position always bound to attribute 0
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    this._frameBuffer.use();
    this._generateFrame();

    this._accumulationBuffer.use();
    this._integrateFrame();
    this._accumulationBuffer.swap();

    this._renderBuffer.use();
    this._renderFrame();
};

_.reset = function() {
    // TODO: put the following logic in VAO
    var gl = this._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._clipQuad);
    gl.enableVertexAttribArray(0); // position always bound to attribute 0
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    this._accumulationBuffer.use();
    this._resetFrame();
    this._accumulationBuffer.swap();
};

_.getTexture = function() {
    return this._renderBuffer.getTexture();
};

_.setMvpInverseMatrix = function(matrix) {
    this._mvpInverseMatrix.copy(matrix);
};

_._resetFrame = function() {
    throw Util.noimpl;
};

_._generateFrame = function() {
    throw Util.noimpl;
};

_._integrateFrame = function() {
    throw Util.noimpl;
};

_._renderFrame = function() {
    throw Util.noimpl;
};

_._getFrameBufferOptions = function() {
    throw Util.noimpl;
};

_._getAccumulationBufferOptions = function() {
    throw Util.noimpl;
};

_._getRenderBufferOptions = function() {
    var gl = this._gl;
    return {
        width:          this._bufferSize,
        height:         this._bufferSize,
        min:            gl.LINEAR,
        mag:            gl.LINEAR,
        format:         gl.RGBA,
        internalFormat: gl.RGBA,
        type:           gl.UNSIGNED_BYTE
    };
};

// ============================ STATIC METHODS ============================= //

})(this);