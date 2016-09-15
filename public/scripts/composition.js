var data = '';
var container;
var camera, controls, scene, renderer;
var objects = [];
var exporter = new THREE.OBJExporter()
var loader = new THREE.JSONLoader()
var plane = new THREE.Plane();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2()
var model = new THREE.Object3D(),
offset = new THREE.Vector3(),
intersection = new THREE.Vector3(),
INTERSECTED, SELECTED;

init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 1000;

  controls = new THREE.TrackballControls( camera );
  controls.rotateSpeed = 5.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 4.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  scene = new THREE.Scene();

  scene.add( new THREE.AmbientLight( 0x505050 ) );

  var light = new THREE.SpotLight( 0xffffff, 1.5 );
  light.position.set( 0, 500, 2000 );
  light.castShadow = true;

  light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 200, 10000 ) );
  light.shadow.bias = - 0.00022;

  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;

  scene.add( light );

  // var geometry = new THREE.BoxGeometry( 40, 40, 40 );
  //
  // for ( var i = 0; i < 200; i ++ ) {
  //
  //   var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
  //
  //   object.position.x = Math.random() * 1000 - 500;
  //   object.position.y = Math.random() * 600 - 300;
  //   object.position.z = Math.random() * 800 - 400;
  //
  //   object.rotation.x = Math.random() * 2 * Math.PI;
  //   object.rotation.y = Math.random() * 2 * Math.PI;
  //   object.rotation.z = Math.random() * 2 * Math.PI;
  //
  //   object.scale.x = Math.random() * 2 + 1;
  //   object.scale.y = Math.random() * 2 + 1;
  //   object.scale.z = Math.random() * 2 + 1;
  //
    // object.castShadow = true;
    // object.receiveShadow = true;
    //
    // scene.add( object );
    //
    // objects.push( object );
    // }

  // adding self models
  data = document.getElementById('models');
  var array = data.value.split('-')
  for(var i = 0; i < array.length; i++) {
    loader.load('models/' + array[i] + '.json' , modelLoadedCallback)
  }

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0xf0f0f0 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.sortObjects = false;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  container.appendChild( renderer.domElement );

  var info = document.createElement( 'div' );
  info.style.position = 'absolute';
  info.style.top = '10px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  info.innerHTML = '<h1>Projet ATHAR 3D - Composition de modèles 3D</h1> - <a class="link" id="export" href="#" onclick="exportToObj()">Telecharger ce modèle</a>';
  container.appendChild( info );

  // event listeners for mouse stats
  renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
  renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
  renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

  // adding eventlistener to export the scene into a 3D model
  var exportButton = document.getElementById('export')
  exportButton.addEventListener('onclick', this.exportToObj)

  //

  window.addEventListener( 'resize', onWindowResize, false );

}

function modelLoadedCallback (geometry, materials) {
  /* create the object from the geometry and materials that were loaded.  There
  can be multiple materials, which can be applied to the object using MeshFaceMaterials.
  Note tha the material can include references to texture images might finish
  loading later. */
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
  var scale = 200 / max
  object.position.set(-centerX, -centerY, -centerZ) // ???
  object.scale.set(scale, scale, scale)

  // add object to objects array & scene
  scene.add( object );
  objects.push( object );
  // console informations
  console.log('Loading finished, scaling object by ' + scale)
  console.log('Center at ( ' + centerX + ', ' + centerY + ', ' + centerZ + ' )')

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

  event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );

  if ( SELECTED ) {

    if ( raycaster.ray.intersectPlane( plane, intersection ) ) {

      SELECTED.position.copy( intersection.sub( offset ) );

    }

    return;

  }

  var intersects = raycaster.intersectObjects( objects );

  if ( intersects.length > 0 ) {

    if ( INTERSECTED != intersects[ 0 ].object ) {

      // if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

      INTERSECTED = intersects[ 0 ].object
      // INTERSECTED.currentHex = INTERSECTED.material.color.getHex()

      plane.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection( plane.normal ),
        INTERSECTED.position );

    }

    container.style.cursor = 'pointer';

  } else {

    // if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

    INTERSECTED = null;

    container.style.cursor = 'auto';

  }

}

function onDocumentMouseDown( event ) {

  event.preventDefault();

  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects( objects );

  if ( intersects.length > 0 ) {

    controls.enabled = false;

    SELECTED = intersects[ 0 ].object;

    if ( raycaster.ray.intersectPlane( plane, intersection ) ) {

      offset.copy( intersection ).sub( SELECTED.position );

    }

    container.style.cursor = 'move';

  }

}

function onDocumentMouseUp( event ) {

  event.preventDefault();

  controls.enabled = true;

  if ( INTERSECTED ) {

    SELECTED = null;

  }

  container.style.cursor = 'auto';

}

function exportToObj () {
  var result = exporter.parse(scene)
  var saver = new Blob([result], {type: 'text/plain;charset=utf-8'})
  saveAs(saver, data.value + '.obj')
}

//

function animate() {

  requestAnimationFrame( animate );

  render();
  // stats.update();

}

function render() {

  controls.update();

  renderer.render( scene, camera );

}
