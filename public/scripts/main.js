const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
var Three = THREE
var controls, material, texture
var scene, renderer, camera, mesh, lights

init()
render()
function init () {
  // instantiate container
  // var container = document.createElement('div')
  // document.body.appendChild(container)

  // instantiate scene
  scene = new Three.Scene()

  // instantiate camera
  camera = new Three.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000)
  camera.position.set(0, -3.5, 5)
  camera.lookAt(scene.position)

  // // instantiate AmbientLight
  // var ambientLight = new Three.AmbientLight(0xffffff)
  // ambientLight.position.set(10, 0, 0)
  // scene.add(ambientLight)

  // instantiate point light
  lights = []
  lights[0] = new Three.PointLight(0xffffff, 1, 0)
  lights[1] = new Three.PointLight(0xffffff, 1, 0)
  lights[2] = new Three.PointLight(0xffffff, 1, 0)

  lights[0].position.set(0, 200, 0)
  lights[1].position.set(100, 200, 100)
  lights[2].position.set(-100, -200, -100)

  scene.add(lights[0])
  scene.add(lights[1])
  scene.add(lights[2])

  // instantiate renderer
  renderer = new Three.WebGLRenderer({antialias: true})
  renderer.setSize(WIDTH, HEIGHT)

  // instantiate controls
  controls = new Three.OrbitControls(camera)

  // // instantiate texture
  texture = new Three.TextureLoader().load('utils/aa.jpg')

  // // set wrap mode to repeat
  // texture.wrapS = Three.RepeatWrapping
  // texture.wrapT = Three.RepeatWrapping
  // texture.repeat.set(4, 4)
  // instantiate texture
  // texture = new Three.TextureLoader()
  // texture.load('utils/aa.jpg', function (texture) {
  //   material = new Three.MeshLambertMaterial({map: texture, overdraw: 0.5})
  // })

  // instantiate a loader
  var loader = new Three.JSONLoader()

  // append renderer element to the domcument body as canvas
  document.body.appendChild(renderer.domElement)

  // var ground_texture = Three.ImageUtils.loadTexture('utils/aa.jpg', {}, function() {
  //   renderer.render(scene, camera)
  // })

  // load a resource
  loader.load(
    // resource URL
    // 'models/modeles/pilier/pilier.js',
    'models/ogiveTst2.json',
    // 'models/colonne.js',
    // Function when resource is loaded
    function (geometry, materials) {
      // material = new Three.MeshBasicMaterial({
      //   map: texture,
      //   wireframe: false,
      //   side: Three.DoubleSide
      // })
      // material = new Three.MeshBasicMaterial(materials)
      material = new Three.MeshLambertMaterial()
      // ({
      //   wireframe: false,
      //   map: texture,
      //   side: Three.DoubleSide
      // })
      mesh = new Three.Mesh(geometry, material)
      mesh.translation = geometry.center(geometry)
      mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.50
      scene.add(mesh)
    }
  )
  // resize event handler
  window.addEventListener('resize', onWindowResize, true)
}

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}



  // rendering function
function render () {
  requestAnimationFrame(render)
  renderer.setClearColor(0x787878) // 0x787878
  renderer.render(scene, camera)
}
