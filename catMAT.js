var CatMAT={
	// vec3 vを単位ベクトル化（長さを1にする）して返す(vec3)
	normalize:function(v){
		var d=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
		return [v[0]/d,v[1]/d,v[2]/d];
	},

	// vec3 aとvec3 bの内積を返す(float)
	dot:function(a,b){
		return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
	},

	// vec3 aとvec3 bの外積を返す(vec3)
	cross:function(a,b){
		return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
	},

	// 単位行列を返す(mat4)
	identity:function(){
		return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
	},

	// 配列 aと配列 bの各項を足したものを返す(配列aと同じ長さの配列を返す)
	add:function(a,b){
		var r=[];
		for(var c=0;c<Math.min(a.length,b.length);c++){
			r[c]=a[c]+b[c];
		}
		return r;
	},

	// 配列 aの各項をfloat s倍する(配列aと同じ長さの配列を返す)
	scalar:function(s,m){
		var r=[];
		for(var c=0;c<m.length;c++){
			r[c]=m[c]*s;
		}
		return r;
	},

	// vec3 vを移動量とする平行移動行列を返す(mat4)
	translate:function(v){
		return [1,0,0,0,0,1,0,0,0,0,1,0,v[0],v[1],v[2],1];
	},

	// vec3 vを倍率とする拡大縮小行列を返す(mat4)
	scale:function(v){
		return [v[0],0,0,0,0,v[1],0,0,0,0,v[2],0,0,0,0,1];
	},

	// vec3 vを軸、float t(rad)を回転角とする回転行列を返す(mat4)
	rotate:function(v,t){
		var x=CatMAT.unit(v)[0],y=CatMAT.unit(v)[1],z=CatMAT.unit(v)[2];
		var m=[0,z,-y,0,-z,0,x,0,y,-x,0,0,0,0,0,0];
		return CatMAT.add(CatMAT.identity(),CatMAT.add(CatMAT.scalar(Math.sin(t),m),CatMAT.scalar((1-Math.cos(t)),CatMAT.multiply(m,m))));
	},

	// mat4 mの転置行列を返す(mat4)
	transpose:function(m){
		var r=[];
		for(var c=0;c<16;c++){
			r[c]=m[c%4*4+Math.floor(c/4)];
		}
		return r;
	},

	// mat4 mとvec3 vの積のxyz成分を返す（vのw成分には1が代入される）(vec3)
	vector:function(m,v){
		v[3]=1;
		var r=[];
		for(var c=0;c<3;c++){
			r[c]=0;
			for(var d=0;d<4;d++){
				r[c]+=m[d*4+c]*v[d];
			}
		}
		return r;
	},

	// mat4 aとmat4 bの積を返す(mat4)
	multiply:function(a,b){
		var r=[];
		for(var c=0;c<16;c++){
			r[c]=0;
			for(var d=0;d<4;d++){
				r[c]+=a[d*4+c%4]*b[d+Math.floor(c/4)*4];
			}
		}
		return r;
	},

	// vec3 eを目の位置、vec3 cを目標、vec3 uと天としたビュー変換行列を返す
	lookAt:function(e,c,u){
		var z=CatMAT.normalize([e[0]-c[0],e[1]-c[1],e[2]-c[2]]),
		x=CatMAT.normalize(CatMAT.cross(z,CatMAT.normalize(u))),
		y=CatMAT.cross(z,x);
		return CatMAT.multiply([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,0,0,0,1],CatMAT.translate([-e[0],-e[1],-e[2]]));
	},

	// float f(deg)を視野、float aをアスペクト比、float Nをニアクリップ、float Fをファークリップとした射影変換行列を返す
	perspective:function(f,a,N,F){
		p=-1/Math.tan(f*Math.PI/360);
		return [p/a,0,0,0,0,p,0,0,0,0,F/(N-F),-1,0,0,N*F/(N-F),0];
	},
};

// mat4 _m の行列式を返す (float)
CatMAT.determinant = function( _m ){
	// reference : http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm

	var
		m00 = _m[0], m01 = _m[4], m02 = _m[8], m03 = _m[12],
		m10 = _m[1], m11 = _m[5], m12 = _m[9], m13 = _m[13],
		m20 = _m[2], m21 = _m[6], m22 = _m[10], m23 = _m[14],
		m30 = _m[3], m31 = _m[7], m32 = _m[11], m33 = _m[15];

	return (
	  m03*m12*m21*m30 - m02*m13*m21*m30 - m03*m11*m22*m30 + m01*m13*m22*m30+
	  m02*m11*m23*m30 - m01*m12*m23*m30 - m03*m12*m20*m31 + m02*m13*m20*m31+
	  m03*m10*m22*m31 - m00*m13*m22*m31 - m02*m10*m23*m31 + m00*m12*m23*m31+
	  m03*m11*m20*m32 - m01*m13*m20*m32 - m03*m10*m21*m32 + m00*m13*m21*m32+
	  m01*m10*m23*m32 - m00*m11*m23*m32 - m02*m11*m20*m33 + m01*m12*m20*m33+
	  m02*m10*m21*m33 - m00*m12*m21*m33 - m01*m10*m22*m33 + m00*m11*m22*m33
	);
};

// mat4 _m の逆行列を返す (mat4)
CatMAT.inverse = function( _m ){
	var det = CatMAT.determinant( _m );
	if( det == 0 ){
		console.warn('CatMAT.inverse : determinant is 0, return identity instead of inverse');
		return CatMAT.identity();
	}

	var
		m00 = _m[0], m01 = _m[4], m02 = _m[8], m03 = _m[12],
		m10 = _m[1], m11 = _m[5], m12 = _m[9], m13 = _m[13],
		m20 = _m[2], m21 = _m[6], m22 = _m[10], m23 = _m[14],
		m30 = _m[3], m31 = _m[7], m32 = _m[11], m33 = _m[15];

	var ret = [];

  ret[0] = m12*m23*m31 - m13*m22*m31 + m13*m21*m32 - m11*m23*m32 - m12*m21*m33 + m11*m22*m33;
  ret[4] = m03*m22*m31 - m02*m23*m31 - m03*m21*m32 + m01*m23*m32 + m02*m21*m33 - m01*m22*m33;
  ret[8] = m02*m13*m31 - m03*m12*m31 + m03*m11*m32 - m01*m13*m32 - m02*m11*m33 + m01*m12*m33;
  ret[12] = m03*m12*m21 - m02*m13*m21 - m03*m11*m22 + m01*m13*m22 + m02*m11*m23 - m01*m12*m23;
  ret[1] = m13*m22*m30 - m12*m23*m30 - m13*m20*m32 + m10*m23*m32 + m12*m20*m33 - m10*m22*m33;
  ret[5] = m02*m23*m30 - m03*m22*m30 + m03*m20*m32 - m00*m23*m32 - m02*m20*m33 + m00*m22*m33;
  ret[9] = m03*m12*m30 - m02*m13*m30 - m03*m10*m32 + m00*m13*m32 + m02*m10*m33 - m00*m12*m33;
  ret[13] = m02*m13*m20 - m03*m12*m20 + m03*m10*m22 - m00*m13*m22 - m02*m10*m23 + m00*m12*m23;
  ret[2] = m11*m23*m30 - m13*m21*m30 + m13*m20*m31 - m10*m23*m31 - m11*m20*m33 + m10*m21*m33;
  ret[6] = m03*m21*m30 - m01*m23*m30 - m03*m20*m31 + m00*m23*m31 + m01*m20*m33 - m00*m21*m33;
  ret[10] = m01*m13*m30 - m03*m11*m30 + m03*m10*m31 - m00*m13*m31 - m01*m10*m33 + m00*m11*m33;
  ret[14] = m03*m11*m20 - m01*m13*m20 - m03*m10*m21 + m00*m13*m21 + m01*m10*m23 - m00*m11*m23;
  ret[3] = m12*m21*m30 - m11*m22*m30 - m12*m20*m31 + m10*m22*m31 + m11*m20*m32 - m10*m21*m32;
  ret[7] = m01*m22*m30 - m02*m21*m30 + m02*m20*m31 - m00*m22*m31 - m01*m20*m32 + m00*m21*m32;
  ret[11] = m02*m11*m30 - m01*m12*m30 - m02*m10*m31 + m00*m12*m31 + m01*m10*m32 - m00*m11*m32;
  ret[15] = m01*m12*m20 - m02*m11*m20 + m02*m10*m21 - m00*m12*m21 - m01*m10*m22 + m00*m11*m22;

	return ret;
};

// mat4 _m の逆行列を返さない (null)
CatMAT.inverseOld = function( _m ){
	alert('逆行列は無理');
	return null;
};

// vec3 _v を mat4 _m で射影したものを返す
CatMAT.applyProjection = function( _m, _v ){
	var ret = [];

	var mul = 1/(_m[3]*_v[0]+_m[7]*_v[1]+_m[11]*_v[2]+_m[15]);
	return CatMAT.scalar( mul, CatMAT.vector( _m, _v ) );
}

// 変換行列が mat4 _m で、カメラ位置が vec3 _c で、カーソル位置が ( _x, _y ) のとき（正規化されているものとする）、カーソルが z=0 にあるときの空間上のカーソル位置を返す (vec3)
CatMAT.raycastZ0 = function( _m, _c, _x, _y ){
	var inv = CatMAT.inverse( _m );
	var pos = CatMAT.applyProjection( inv, [ _x, _y, 1 ] );
	var dir = CatMAT.normalize( CatMAT.add( pos, CatMAT.scalar( -1, _c ) ) );
	var mul = -_c[2]/dir[2];

	return CatMAT.add( CatMAT.scalar( mul, dir ), CatMAT.scalar( 1, _c ) );
};
