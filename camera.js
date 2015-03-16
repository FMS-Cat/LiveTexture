Camera = function(){

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  window.URL = window.URL || window.webkitURL;

  this.video = document.createElement( 'video' );
  this.video.autoplay = true;
  this.canvas = document.createElement( 'canvas' );
  this.canvas.width = 256;
  this.canvas.height = 256;
  this.context = this.canvas.getContext( '2d' );

  this.localMediaStream = null;

  var camera = this;

  if( navigator.getUserMedia ){
    navigator.getUserMedia( { // navigator.getUserMedia 第一引数、プロパティ
      video : true, audio : false
    }, function( _stream ){ // navigator.getUserMedia 第二引数、成功時ストリーム
      camera.localMediaStream = _stream;
      camera.video.src = window.URL.createObjectURL( camera.localMediaStream );
    }, function( _error ){ // navigator.getUserMedia 第三引数、失敗時エラー
      console.error( 'getUserMedia error: ', _error.code );
    } );
  }else{
    alert( 'カメラ未対応のブラウザです。' );
  }

};

Camera.prototype.capture = function(){
  this.context.drawImage( this.video, 0, 0, this.canvas.width, this.canvas.height );
};
