var scene, camera, renderer, controls;
var geometry, material, sphere;

var onPlatform = [];

var blenderScale = 50;

$(function() {
  init();
  animate();
});

function init() {
  renderer = makeRenderer();

  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = makeCamera();
  camera.lookAt(scene.position);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  scene.add(makeLight());
  scene.add(makeFloor());
  var platform = makePlatform();
  scene.add(platform);

  loadModel(scene, 'models/teapot.dae', [0, platform.geometry.parameters.height, 0]);

}

function makeRenderer() {
  var renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMapType = THREE.PCFSoftShadowMap; // options are THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
  return renderer;
}

function makeCamera() {
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
  //camera.position.z = 1000;
  camera.position.set(0, 10, 20);
  return camera;
}

function makeLight() {
  var light = new THREE.SpotLight( 0xffffff, 1);

  light.shadowMapWidth = 2048; // default is 512
  light.shadowMapHeight = 2048; // default is 512

  light.position.y = 70;
  light.position.x = 50;
  //light.shadowCameraVisible = true;
  light.castShadow = true;
  light.shadowDarkness = 0.5;
  return light;
}

function makePlatform() {
  var rad = 10,
    height = 5;
  var geo = new THREE.CylinderGeometry(rad, rad, height, 64);
  var mat = new THREE.MeshLambertMaterial();

  var platform = new THREE.Mesh(geo, mat);
  platform.castShadow = true;
  platform.receiveShadow = true;
  platform.position.y = platform.geometry.parameters.height / 2;
  return platform;
}

function makeFloor() {

  var size = 50;
  var edgeWidth = 5;

  var geometry = new THREE.Geometry();
  var material = new THREE.LineBasicMaterial({ color: 'lightgrey' });

  for(var x = -size; x <= size; x += edgeWidth) {
    geometry.vertices.push(new THREE.Vector3(-size, -0.04, x));
    geometry.vertices.push(new THREE.Vector3(size, -0.04, x));
    geometry.vertices.push(new THREE.Vector3(x, -0.04, -size));
    geometry.vertices.push(new THREE.Vector3(x, -0.04, size));
  }

  return new THREE.Line(geometry, material, THREE.LinePieces);
}

function loadModel(scene, path, position) {
  var loader = new THREE.ColladaLoader();
  loader.options.convertUpAxis = true;
  loader.load(path, function(collada) {
    var dae = collada.scene;

    var daemesh = dae.children[0].children[0];
    daemesh.castShadow = true;
    daemesh.receiveShadow = true;

    dae.scale.set(blenderScale, blenderScale, blenderScale);

    if(_.isArray(position) && position.length === 3) {
      dae.position.set(position[0], position[1], position[2]);
    }

    scene.add(dae);

    onPlatform.push(dae)
  });
}

function animate() {

  requestAnimationFrame(animate);

  _.each(onPlatform, function(mesh) {
    mesh.rotation.y += Math.PI / 1440;
  });

  renderer.render(scene, camera);
  controls.update();

}