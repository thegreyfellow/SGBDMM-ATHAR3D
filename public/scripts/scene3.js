var Athar3D = {
  // exporter: new THREE.OBJExporter(),
  loader: new THREE.JSONLoader(),
  scene: null, camera: null, renderer: null, model: new THREE.Object3D(),
  container: null, controls: null,
  clock: null, stats: null,
  plane: null, selection: null, offset: new THREE.Vector3(), objects: [],
  raycaster: new THREE.Raycaster(),

  init: function() {

    // Create main scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xcce0ff, 0.0003);

    // Prepare container
    // this.container = document.createElement('div');
    // document.body.appendChild(this.container);
    // this.container.appendChild(this.renderer.domElement);
    this.container = document.getElementById('cnvs');

    var SCREEN_WIDTH = this.container.width, SCREEN_HEIGHT = this.container.height;

    // Prepare perspective camera
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 1000;
    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.add(this.camera);
    this.camera.position.set(100, 0, 0);
    this.camera.lookAt(new THREE.Vector3(0,0,0));

    // Prepare webgl renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.container, antialias:true });
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    // this.renderer.setSize(this.container.width, this.container.height)
    this.renderer.setClearColor(this.scene.fog.color);

    // Events
    // THREEx.WindowResize(this.renderer, this.camera);
    document.addEventListener('mousedown', this.onDocumentMouseDown, false);
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('mouseup', this.onDocumentMouseUp, false);

    // adding eventlistener to export the scene into a 3D model
    // var exportButton = document.getElementById('export')
    // exportButton.addEventListener('click', this.exportToObj)

    // Prepare Orbit controls
    this.controls = new THREE.OrbitControls(this.camera);
    // this.controls = new THREE.OrbitControls(this.camera, this.container);
    this.controls.target = new THREE.Vector3(0, 0, 0);
    this.controls.maxDistance = 150;

    // Prepare clock
    this.clock = new THREE.Clock();

    // // Prepare stats
    // this.stats = new Stats();
    // this.stats.domElement.style.position = 'absolute';
    // this.stats.domElement.style.left = '50px';
    // this.stats.domElement.style.bottom = '50px';
    // this.stats.domElement.style.zIndex = 1;
    // this.container.appendChild( this.stats.domElement );

    // Add lights
    this.scene.add( new THREE.AmbientLight(0x444444));

    var dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(200, 200, 1000).normalize();
    this.camera.add(dirLight);
    this.camera.add(dirLight.target);

    // // Display skybox
    // this.addSkybox();

   //  // Add 50 random objects (spheres)
   // var object, material, radius;
   // var objGeometry = new THREE.SphereGeometry(1, 24, 24);
   // for (var i = 0; i < 50; i++) {
   //   material = new THREE.MeshPhongMaterial({color: Math.random() * 0xffffff});
   //   material.transparent = true;
   //   object = new THREE.Mesh(objGeometry.clone(), material);
   //   this.objects.push(object);

   //   radius = Math.random() * 4 + 2;
   //   object.scale.x = radius;
   //   object.scale.y = radius;
   //   object.scale.z = radius;

   //   object.position.x = Math.random() * 50 - 25;
   //   object.position.y = Math.random() * 50 - 25;
   //   object.position.z = Math.random() * 50 - 25;

   //   this.scene.add(object);
   // }

    // loading self models
    // this.loader.load('models/arc.json', this.modelLoadedCallback)
    this.loader.load('models/colonne.json', this.modelLoadedCallback)
    this.loader.load('models-json/ogiveTest.json', this.modelLoadedCallback)
    // this.loader.load('models/modeles/pilier/pilier.js', this.modelLoadedCallback)

   // Plane, that helps to determinate an intersection position
    this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8, 8), new THREE.MeshBasicMaterial({color: 0xffffff}));
    this.plane.visible = false;
    this.scene.add(this.plane);
  },
  // addSkybox: function() {
  //   var iSBrsize = 500;
  //  var uniforms = {
  //    topColor: {type: "c", value: new THREE.Color(0x0077ff)}, bottomColor: {type: "c", value: new THREE.Color(0xffffff)},
  //    offset: {type: "f", value: iSBrsize}, exponent: {type: "f", value: 1.5}
  //  }

  //  var skyGeo = new THREE.SphereGeometry(iSBrsize, 32, 32);
  //  skyMat = new THREE.ShaderMaterial({vertexShader: sbVertexShader, fragmentShader: sbFragmentShader, uniforms: uniforms, side: THREE.DoubleSide, fog: false});
  //  skyMesh = new THREE.Mesh(skyGeo, skyMat);
  //  this.scene.add(skyMesh);
  // },
  onDocumentMouseDown: function (event) {
    // Get mouse position
   var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
   var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

   // Get 3D vector from 3D mouse position using 'unproject' function
   var vector = new THREE.Vector3(mouseX, mouseY, 1);
   vector.unproject(Athar3D.camera);

   // Set the raycaster position
   Athar3D.raycaster.set( Athar3D.camera.position, vector.sub( Athar3D.camera.position ).normalize() );

   // Find all intersected objects
   var intersects = Athar3D.raycaster.intersectObjects(Athar3D.objects);

   if (intersects.length > 0) {
     // Disable the controls
     Athar3D.controls.enabled = false;

     // Set the selection - first intersected object
     Athar3D.selection = intersects[0].object;

     // Calculate the offset
     var intersects = Athar3D.raycaster.intersectObject(Athar3D.plane);
     Athar3D.offset.copy(intersects[0].point).sub(Athar3D.plane.position);
   }
  },
  onDocumentMouseMove: function (event) {
    event.preventDefault();

    // Get mouse position
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // Get 3D vector from 3D mouse position using 'unproject' function
    var vector = new THREE.Vector3(mouseX, mouseY, 1);
    vector.unproject(Athar3D.camera);

    // Set the raycaster position
    Athar3D.raycaster.set( Athar3D.camera.position, vector.sub( Athar3D.camera.position ).normalize() );

    if (Athar3D.selection) {
      // Check the position where the plane is intersected
      var intersects = Athar3D.raycaster.intersectObject(Athar3D.plane);
      // Reposition the object based on the intersection point with the plane
      Athar3D.selection.position.copy(intersects[0].point.sub(Athar3D.offset));
    } else {
      // Update position of the plane if need
      var intersects = Athar3D.raycaster.intersectObjects(Athar3D.objects);
      if (intersects.length > 0) {
        Athar3D.plane.position.copy(intersects[0].object.position);
        Athar3D.plane.lookAt(Athar3D.camera.position);
      }
    }
  },
  onDocumentMouseUp: function (event) {
    // Enable the controls
    Athar3D.controls.enabled = true;
    Athar3D.selection = null;
  },

  modelLoadedCallback: function (geometry, materials) {
  /* create the object from the geometry and materials that were loaded.  There
  can be multiple materials, which can be applied to the object using MeshFaceMaterials.
  Note tha the material can include references to texture images might finish
  loading later. */
  materials.transparent = true;
  var object = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))

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
  object.position.set(-centerX, -centerY, -centerZ) // ???

  // console informations
  console.log('Loading finished, scaling object by ' + scale)
  console.log('Center at ( ' + centerX + ', ' + centerY + ', ' + centerZ + ' )')
  // some stuff
  Athar3D.objects.push(object);

  Athar3D.scene.add(object)
  }

  // exportToObj: function () {
  // var result = Athar3D.exporter.parse(Athar3D.scene)
  // var saver = new Blob([result], {type: 'text/plain;charset=utf-8'})
  // saveAs(saver, 'model.obj')
  // }
};

// Animate the scene
function animate() {
  requestAnimationFrame(animate);
  render();
  update();
}

// Update controls and stats
function update() {
  var delta = Athar3D.clock.getDelta();

  Athar3D.controls.update(delta);
  // Athar3D.stats.update();
}

// Render the scene
function render() {
  if (Athar3D.renderer) {
    Athar3D.renderer.render(Athar3D.scene, Athar3D.camera);
  }
}

// Initialize Project on page load
function initializeProject() {
  Athar3D.init();
  animate();
}

if (window.addEventListener)
  window.addEventListener('load', initializeProject, false);
else if (window.attachEvent)
  window.attachEvent('onload', initializeProject);
else window.onload = initializeProject;
