var Three = THREE

var renderer      // A three.js WebGL or Canvas renderer.
var scene         // The 3D scene that will be rendered, containing the model.
var camera        // The camera that takes the picture of the scene.
var controls      // adds mouse zoom and control.
var model         // The three.js object that represents the model.

var rotateX = 0   // rotation of model about the x-axis
var rotateY = 0   // rotation of model about the y-axis

function createWorld () {
  var light = []

  light[0] = new Three.PointLight(0xffffff, 1, 0)
  light[1] = new Three.PointLight(0xffffff, 1, 0)
  light[2] = new Three.PointLight(0xffffff, 1, 0)

  light[0].position.set(0, 200, 0)
  light[1].position.set(100, 200, 100)
  light[2].position.set(-100, -200, -100)

  scene.add(light[0])
  scene.add(light[1])
  scene.add(light[2])

  // A light shining from the direction of the camera.
  // light.position.set(0, 0, 1)
  // scene.add(light)
}

function modelLoadedCallback (geometry, materials) {
  /* create the object from the geometry and materials that were loaded.  There
  can be multiple materials, which can be applied to the object using MeshFaceMaterials.
  Note tha the material can include references to texture images might finish
  loading later. */
  var object = new Three.Mesh(geometry, new Three.MeshFaceMaterial(materials))

  /* Determine the ranges of x, y, and z in the vertices of the geometry. */
  var xmin = Infinity
  var xmax = -Infinity
  var ymin = Infinity
  var ymax = -Infinity
  var zmin = Infinity
  var zmax = -Infinity
  for (var i = 0; i < geometry.vertices.length; i++) {
    var v = geometry.vertices[i]
    if (v.x < xmin) {
      xmin = v.x
    } else if (v.x > xmax) {
      xmax = v.x
    }
    if (v.y < ymin) {
      ymin = v.y
    } else if (v.y > ymax) {
      ymax = v.y
    }
    if (v.z < zmin) {
      zmin = v.z
    } else if (v.z > zmax) {
      zmax = v.z
    }
  }

  /* translate the center of the object to the origin */
  var centerX = (xmin + xmax) / 2
  var centerY = (ymin + ymax) / 2
  var centerZ = (zmin + zmax) / 2
  var max = Math.max(centerX - xmin, xmax - centerX)
  max = Math.max(max, Math.max(centerY - ymin, ymax - centerY))
  max = Math.max(max, Math.max(centerZ - zmin, zmax - centerZ))
  var scale = 5 / max
  object.position.set(-centerX, -centerY, -centerZ) // ???
  // console informations
  console.log('Loading finished, scaling object by ' + scale)
  console.log('Center at ( ' + centerX + ', ' + centerY + ', ' + centerZ + ' )')

  /* Create the wrapper, model, to scale and rotate the object. */
  model = new Three.Object3D()
  model.add(object)
  model.scale.set(scale, scale, scale)
  // rotateX = rotateY = 0
  scene.add(model)
  render()
}

/**
* Called when the setting of the model-selection radio buttons is changed.
* starts loading the model from the specified file and sets the background
* color for the renderer (since black background doesn't work for all
* of the models.
*/
function installModel (file) {
  if (model) {
    scene.remove(model)
  }
  // renderer.setClearColor(#a3a3a3)
  render()
  var loader = new Three.JSONLoader()
  console.log('models/' + file)
  loader.load('models/' + file, modelLoadedCallback)
}

/**
 *  The render fucntion creates an image of the scene from the point of view
 *  of the camera and displays it in the canvas.  This is called at the end of
 *  init() to produce the initial view of the model, and it is called each time
 *  the user presses an arrow key, return, or home.
 */
function render () {
  requestAnimationFrame(render)
  // light[0].position.set(camera.position.x, camera.position.y, camera.position.z)
  renderer.render(scene, camera)
}
/**
 *  This function is called by the onload event so it will run after the
 *  page has loaded.  It creates the renderer, canvas, and scene objects,
 *  calls createWorld() to add objects to the scene, and renders the
 *  initial view of the scene.  If an error occurs, it is reported.
 */
function init () {
  try {
    var theCanvas = document.getElementById('cnvs')
    // try to create a WebGLRenderer
    if (window.WebGLRenderingContext) {
      renderer = new Three.WebGLRenderer({
        canvas: theCanvas,
        antialias: true
      })
    }
    if (!renderer) { // If the WebGLRenderer couldn't be created, try a CanvasRenderer.
      renderer = new Three.CanvasRenderer({
        canvas: theCanvas
      })
      renderer.setSize(theCanvas.width, theCanvas.height)
      document.getElementById('message').innerHTML = 'WebGL not available falling back to CanvasRenderer.'
    }
    renderer.setClearColor( 0xf0f0f0 );
    scene = new Three.Scene()
    camera = new Three.PerspectiveCamera(50, theCanvas.width / theCanvas.height, 0.1, 100)
    camera.position.z = 30
    controls = new Three.OrbitControls(camera, theCanvas)
    createWorld()
  } catch (e) {
    document.getElementById('message').innerHTML = 'Sorry, an error occurred: ' + e.message
  }
}
