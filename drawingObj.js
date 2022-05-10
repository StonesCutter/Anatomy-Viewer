var program;
var gl;
var shaderDir;
var baseDir;
var pigModel; // Used to load obj model later in the code
var modelStr = 'model/pigmech.obj';
var modelTexture = 'model/texture.png';

var timer = null;
// Timer for mouseDown Event Click

var S = 2.0;
// Transform Data
var transform = {
  originalPosition: {
    x: -.5,
    y: -1.5,
    z: 0
  },
  rotation: {
    x: 0,
    y: 0,
    z: 0
  },
  position: {
    x: -.5,
    y: -1.5,
    z: 0
  },
  pointOfInterest: {
    leg: {
      x: 0,
      y: -1.5,
      z: 0
    },
    hand: {
      x: 0,
      y: -4.0,
      z: 0
    },
    back: {
      x: 0,
      y: -5.0,
      z: 0
      }
  },
  rotationSpeed: 4,
}


function main() {

  var lastUpdateTime = (new Date).getTime();
//rotation of the model
  var Rx = 0.0;
  var Ry = 0.0;
  var Rz = 0.0;
// Resize canvas with the window opened
  utils.resizeCanvasToDisplaySize(gl.canvas);
//specify how to go from normalized to screen cordinates
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
//clear canvas with specified colours
  gl.clearColor(0.85, 1.0, 0.85, 1.0);
//clear both color_buffer_bit e Depth_buffer_bit
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//test to fill up depth buffer
  gl.enable(gl.DEPTH_TEST);

  //###################################################################################
  //Here we extract the position of the vertices, the normals, the indices, and the uv coordinates
  var pigVertices = pigModel.vertices;
  var pigIndices = pigModel.indices;
  var pigTexCoords = pigModel.textures;
  //###################################################################################

// here we look for the position of the attribute
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var uvAttributeLocation = gl.getAttribLocation(program, "a_uv");
//passes the uniform from the vertex shader shader, retrieve texture
  var matrixLocation = gl.getUniformLocation(program, "matrix");
//passes the uniform from the fragment shader
  var textLocation = gl.getUniformLocation(program, "u_texture");

// vao: vertex array object
  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

// creation of buffer
  var positionBuffer = gl.createBuffer();
//binding the buffer positionBuffer to specify what current buffer to use to store data
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pigVertices), gl.STATIC_DRAW);
//in order to use the attribute we need to enable it (var in line 80);
  gl.enableVertexAttribArray(positionAttributeLocation);

//here we specify how glsl should interpret the data given.
//3 stands for the 3 coordinates x,y,z
// false because our data don't need to be normalized [??????]
// the first 0 is the stride, in this case is 0 cause consequential.
// the second 0 is offset which tells the first element of the array to consider.
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

//buffer for uv coordinates
  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  //pigTextCoords (var line 76)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pigTexCoords), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation);
  gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

//buffer for index, contains vertex data,so ELEMENT is used
//since its buffer texture we don't need to enable
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
//cause indeces are integer, we use U(unsigned)Int16(of 16 bits)Array
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pigIndices), gl.STATIC_DRAW);


//#######################     TEXTURE     ######################################
  // we declare the variable texture
  var texture = gl.createTexture();
  //indicate the number of textures used, in this case is only one so we set 0 as number
  gl.activeTexture(gl.TEXTURE0);
  // and we specify it will use the 2D slot of "texture" cause is a 2d texture
  gl.bindTexture(gl.TEXTURE_2D, texture);

  //var textLocation initialized at line 85
  //handler
  gl.uniform1i(textLocation, texture);

//To load image files in WebGL we use the HTML Image() object.
  var image = new Image();
  image.src = baseDir + modelTexture;

  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    //filters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // to automatically optimize the picture
    gl.generateMipmap(gl.TEXTURE_2D);
  };
  //###################################################################################
  // Events
  // Handle mouse down event
  // basing where we put the mouse on the screen (left ot right) rotation will be DONE
  // in opposite directions.
  function mouseRotationDown(e, mesh) {
    let offset = 10;
    let width = gl.canvas.width / 2;
    if (e.clientX + offset > width) {
      transform.rotation.x += transform.rotationSpeed;

    } else if (e.clientY + offset < width) {
      transform.rotation.x -= transform.rotationSpeed;
    }
  }


  drawScene();

  function _cl(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
  }

// the model itself doesn't move. Variables left in case of future developement
  function animate() {
    var currentTime = (new Date).getTime();
    var tx = 0.0,
      ty = 0.0,
      tz = 0.0;
    if (lastUpdateTime != null) {
      var deltaC = 0;
      Rx += deltaC;
      Ry -= deltaC;
      Rz += deltaC;
    }
    //creates the world matrix
    worldMatrix = utils.MakeWorld(_cl(tx, transform.position.x, transform.position.x),
      _cl(ty, transform.position.y, transform.position.y),
      _cl(tz, transform.position.z, transform.position.z),
      _cl(Rz, transform.rotation.x, transform.rotation.x),
      Ry, Rz, S);
    lastUpdateTime = currentTime;
  }

  function drawScene() {
    animate();

    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// create perspective matrix with (field of view up-direction, aspect ratio, position near plane, p. far plane)
    var perspectiveMatrix = utils.MakePerspective(45, gl.canvas.width / gl.canvas.height, 0.1, 200.0);
// build perspective matrix (x,y,z, rotation x, rotation y)
    var viewMatrix = utils.MakeView(0, 0.0, 4.0, 0, 0);
// multiply matries to create viewWorldMatrix and Projection Matrix
    var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, worldMatrix);
    var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
//matrix is being transposed because WebGl will interpet it in the wrong order so wrong way
//and we pass projectionMatrix we built to matrixLocation where vertex shader will find it as input
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

    gl.bindVertexArray(vao);
// draw the triangles of the model
    gl.drawElements(gl.TRIANGLES, pigIndices.length, gl.UNSIGNED_SHORT, 0);
//before the browser end to render, calls the function "DrawScene" (up before)
    window.requestAnimationFrame(drawScene);
  }

// event to handle the click of the mouse and the start of the rotation
  var _c = gl.canvas;
  // Set up an event handler for mousedown
  _c.addEventListener("mousedown", function (evt) {
    // Start a timer that fires a function at 50 millisecond intervals
    timer = setInterval(() => {
    // console.log("111");
      mouseRotationDown(evt);
    }, 50);
  });
  // Set up a custom mouseup event handler
  /*_c.addEventListener("mouseup", function () {
    clearInterval(timer);
  });*/
}


async function init() {
// retrieve shader using path
  var path = window.location.pathname;
  var page = path.split("/").pop();
  baseDir = window.location.href.replace(page, '');
  shaderDir = baseDir + "shaders/";

// load the canvas with the id in the htmml file
  var canvas = document.getElementById("c");
  gl = canvas.getContext("webgl2");
// handle errors
  if (!gl) {
    document.write("GL context not opened");
    return;
  }
// loads fragment shader and vertex shader using the path found before
// and await until the load is complete, otherwise the program can't load
  await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {

    // creation of vertex shader and fragment shader, and the program which use the two
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
    program = utils.createProgram(gl, vertexShader, fragmentShader);

  });
  gl.useProgram(program);

  //###################################################################################
  //This loads the obj model in the pigModel variable
  var pigObjStr = await utils.get_objstr(baseDir + modelStr);
  pigModel = new OBJ.Mesh(pigObjStr);
  //###################################################################################

  main();

}

// starts previous function "async function init()"
window.onload = init;
//event used to stop the rotation once the mouse stops to click
window.onmouseup = () => {
  clearInterval(timer);
}

// allow to zoom by scrolling the wheel of the mouse
// where delta is wheel angle changes, where The
//Math.sign() function returns either a positive or negative +/- 1
window.addEventListener("wheel", event => {
  const delta = Math.sign(event.deltaY);
  if (delta >= 1) {
    transform.position.z += 0.1;
  } else if (delta <= -1) {
    transform.position.z -= 0.1;
  }
});

function handsPos() {
  // transform.position.x = transform.position.
  S=6.0;
  transform.position.x = transform.pointOfInterest.hand.x;
  transform.position.y = transform.pointOfInterest.hand.y;
  transform.position.z = transform.pointOfInterest.hand.z;
  transform.rotation.x = 90;
}

function legsPos() {
  S=4.0;
  transform.position.x = transform.pointOfInterest.leg.x;
  transform.position.y = transform.pointOfInterest.leg.y;
  transform.position.z = transform.pointOfInterest.leg.z;
  transform.rotation.x = 45;
}

function backPos() {
  S=4.0;
  transform.position.x = transform.pointOfInterest.back.x;
  transform.position.y = transform.pointOfInterest.back.y;
  transform.position.z = transform.pointOfInterest.back.z;
  transform.rotation.x = 180;
}

function resetPos() {
  S=2.0;
  transform.position.x = transform.originalPosition.x;
  transform.position.y = transform.originalPosition.y;
  transform.position.z = transform.originalPosition.z;
  transform.rotation.x = 0;
  transform.rotation.y = 0;
  transform.rotation.z = 0;
}
