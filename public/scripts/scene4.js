var Three = THREE
var camera, scene, light, renderer
var exportButton, floatingDiv
var mouseX = 0
var mouseY = 0
var model
var controls      // adds mouse zoom and control.
var posX = false
// var posY = null
// var posZ = null

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
  var scale = 100 / max
  if (posX === true) {
    object.position.set(-centerX - 20, -centerY, -centerZ) // ???
  } else {
    object.position.set(-centerX, -centerY, -centerZ) // ???
  }

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

function exportToObj () {
  var exporter = new Three.OBJExporter()
  var result = exporter.parse(scene)
  // floatingDiv.style.display = 'block'
  // floatingDiv.innerHTML = result.split('\n').join ('<br />')
  // console.log(result.split('\n').join ('<br />'))
  // var content = result
  // window.open('data:text/plain;charset=utf-8,' + encodeURIComponent(content))
  var saver = new Blob([result], {type: 'text/plain;charset=utf-8'})
  saveAs(saver, 'model.obj')
}

function addGeometry (file) {
  var loader = new Three.JSONLoader()

  if (file !== 'both') {
    if (model) {
      scene.remove(model)
    }
    render()
    console.log('models/' + file)
    loader.load('models/' + file, modelLoadedCallback)
  } else {
    if (model) {
      scene.remove(model)
    }
    render()
    posX = true
    console.log('models/colonne.json')
    loader.load('models/colonne.json', modelLoadedCallback)
    console.log('models/ogiveTest.json')
    loader.load('models/ogiveTest.json', modelLoadedCallback)

    camera.lookAt(scene.position(100, 0, 400))
  }

}

function init() {
  // var theCanvas = document.getElementById('cnvs')

  renderer = new Three.WebGLRenderer({alpha: true})
  renderer.setPixelRatio( window.devicePixelRatio )
  renderer.setSize( window.innerWidth, window.innerHeight )
  document.body.appendChild( renderer.domElement )

  camera = new Three.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.set(0, 0, 400)
  controls = new Three.OrbitControls(camera)
  scene = new Three.Scene()
  // scene.background = new Three.Color(0xe7e7e7)
  renderer.setClearColor(0xe7e7e7, 0)

  light = new Three.DirectionalLight(0xffffff)
  scene.add(light)

  // initialize ObjectControls
  objectControls = new ObjectControls(camera)

  window.addEventListener('click', onWindowClick, false)
  window.addEventListener('resize', onWindowResize, false)
  // document.addEventListener('mousemove', onDocumentMouseMove, false)
  // document.addEventListener('mouseover', onDocumentMouseMove, false)

  document.getElementById('colonne').addEventListener('click', function () { addGeometry('colonne.json') })
  document.getElementById('ogive').addEventListener('click', function () { addGeometry('ogiveTest.json') })
  // document.getElementById('cylinder' ).addEventListener( 'click', function() { addGeometry( 3 ) } )
  document.getElementById('both').addEventListener('click', function () { addGeometry('both') })
  // document.getElementById('transformed' ).addEventListener( 'click', function() { addGeometry( 5 ) } )

  exportButton = document.getElementById('export')
  exportButton.addEventListener('click', function () { exportToObj() })

  floatingDiv = document.createElement('div')
  floatingDiv.className = 'floating'
  document.body.appendChild(floatingDiv)

}

function onWindowClick (event) {
  var needToClose = true
  var target = event.target

  while (target !== null) {
    if (target === floatingDiv || target === exportButton) {
      needToClose = false
      break
    }

    target = target.parentElement
  }

  if (needToClose) {
    floatingDiv.style.display = 'none'
  }
}

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}


function render () {
  requestAnimationFrame(render)
  light.position.set(camera.position.x, camera.position.y, camera.position.z)
  objectControls.update()
  renderer.render(scene, camera)
}

init()
// animate()
