var scene, camera, renderer;
var objectControls;
var objects = [];
var intersectionPlane;
var controls;
init();
animate();
function init(){
  /*
     Default threejs stuff!
  */
  scene = new THREE.Scene();
  var ar = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 75, ar , 1, 1000 );
  camera.position.z = 100;
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  light = new THREE.DirectionalLight( 0xff6666 , .9 );
  light.position.set( 1 , 0 , 0 );
  scene.add( light );
  light = new THREE.DirectionalLight( 0x66ff77 , .9 );
  light.position.set( -1 , 0 , 0 );
  scene.add( light );
  light = new THREE.DirectionalLight( 0x6688ff , .9 );
  light.position.set( 0 , 0 , 1 );
  scene.add( light );

  controls = new THREE.OrbitControls(camera)

  /*
     Object Control stuff!!!!
  */
  objectControls = new ObjectControls( camera );
  var geo = new THREE.PlaneGeometry( 100000 , 100000 );
  var mat = new THREE.MeshNormalMaterial({side: THREE.DoubleSide});
  intersectionPlane = new THREE.Mesh( geo , mat );
  intersectionPlane.visible = false;
  scene.add( intersectionPlane );
  var hoverMaterial     = new THREE.MeshNormalMaterial();
  var neutralMaterial   = new THREE.MeshLambertMaterial({color:0xffcccc});
  var selectedMaterial  = new THREE.MeshBasicMaterial({color:0x55ff88});
  var geo = new THREE.IcosahedronGeometry( 10 , 1 );
  for( var i = 0; i < 50; i++ ){
    var mesh = new THREE.Mesh( geo , neutralMaterial );
    mesh.hoverMaterial    = hoverMaterial;
    mesh.neutralMaterial  = neutralMaterial;
    mesh.selectedMaterial = selectedMaterial;
    mesh.selected = false;
    mesh.hoverOver = function(){
      this.material = this.hoverMaterial;
      this.materialNeedsUpdate = true;
      intersectionPlane.position.copy( this.position );

    }.bind( mesh );
    mesh.hoverOut = function(){
      if( this.selected ){
        this.material = this.selectedMaterial;
        this.materialNeedsUpdate = true;
      }else{
        this.material = this.neutralMaterial;
        this.materialNeedsUpdate = true;
      }
    }.bind( mesh );
    mesh.select = function(){
      this.selected = true;
      this.material = this.selectedMaterial;
      this.materialNeedsUpdate = true;
      intersectionPlane.position.copy( this.position );

    }.bind( mesh );
    mesh.deselect = function(){
      this.selected = false;
      this.material = this.neutralMaterial;
      this.materialNeedsUpdate = true;
    }.bind( mesh );
    mesh.update = function(){

      var raycaster = objectControls.raycaster;
      var i = raycaster.intersectObject( intersectionPlane );
      if( !i[0] ){
        console.log( 'something is terribly wrong' );
      }else{
        this.position.copy( i[0].point );
      }
    }.bind( mesh );
    mesh.position.x = (Math.random() -.5 ) * 200;
    mesh.position.y = (Math.random() -.5 ) * 200;
    mesh.position.z = (Math.random() -.5 ) * 100;
    scene.add( mesh );
    objectControls.add( mesh );
  }
}
function animate(){
  requestAnimationFrame( animate );

  objectControls.update();
  renderer.render( scene , camera );

}
