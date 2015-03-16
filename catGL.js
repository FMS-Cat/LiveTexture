var CatGL={};

CatGL.program = null;

CatGL.createProgram=function(_v,_f){
	var v=gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(v,document.getElementById(_v).text);
	gl.compileShader(v);
	if(!gl.getShaderParameter(v,gl.COMPILE_STATUS)){alert(gl.getShaderInfoLog(v));return;}

	var f=gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(f,document.getElementById(_f).text);
	gl.compileShader(f);
	if(!gl.getShaderParameter(f,gl.COMPILE_STATUS)){alert(gl.getShaderInfoLog(f));return;}

	var p=gl.createProgram();
	gl.attachShader(p,v);
	gl.attachShader(p,f);
	gl.linkProgram(p);
	if(gl.getProgramParameter(p,gl.LINK_STATUS)){
		gl.useProgram(p);
		return p;
	}else{
		alert(gl.getProgramInfoLog(p));
	}
};

CatGL.createVbo=function(_d){
	var vbo=gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(_d),gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);

	return vbo;
};

CatGL.createIbo=function(_d){
	var ibo=gl.createBuffer();

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Int16Array(_d),gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

	ibo.length=_d.length;
	ibo.content=_d;
	return ibo;
};

CatGL.setAttribute=function(_n,_v,_s){
	var loc=gl.getAttribLocation(CatGL.program,_n);
	var str=_s;

	gl.bindBuffer(gl.ARRAY_BUFFER,_v);
	gl.enableVertexAttribArray(loc);
	gl.vertexAttribPointer(loc,str,gl.FLOAT,false,0,0);
};

CatGL.createFrameBuffer=function( _w, _h ){

	var f = gl.createFramebuffer();
	gl.bindFramebuffer( gl.FRAMEBUFFER, f );

	var r = gl.createRenderbuffer();
	gl.bindRenderbuffer( gl.RENDERBUFFER, r );
	gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _w, _h );
	gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, r );

	var t = gl.createTexture();
	gl.bindTexture( gl.TEXTURE_2D, t );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _w, _h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
	gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0 );

	gl.bindTexture( gl.TEXTURE_2D, null );
	gl.bindRenderbuffer( gl.RENDERBUFFER, null );
	gl.bindFramebuffer( gl.FRAMEBUFFER, null );

	return { frameBuffer : f, renderBuffer : r, texture : t };
};

// ------

CatGL.Object=function(){
	this.pos=[];
	this.posBuffer=null;
	this.nor=[];
	this.norBuffer=null;
	this.col=[];
	this.colBuffer=null;
	this.index=[];
	this.indexBuffer=null;
};

CatGL.Object.prototype={
	poly:function(_i,_c){
		l=this.pos.length/3;
		i=_i.length;
		for(var c=6;c<i;c+=3){
			for(var c2=0;c2<3;c2++){
				this.pos.push(_i[c2]);
			}
			for(var c2=c-3;c2<c+3;c2++){
				this.pos.push(_i[c2]);
			}

			var v=CatMAT.cross([_i[c-3]-_i[0],_i[c-2]-_i[1],_i[c-1]-_i[2]],[_i[c]-_i[c-3],_i[c+1]-_i[c-2],_i[c+2]-_i[c-1]]);
			for(var c2=0;c2<3;c2++){
				this.nor.push(v[0]);this.nor.push(v[1]);this.nor.push(v[2]);
			}

			for(var c2=0;c2<3;c2++){
				this.index.push(l+c-6+c2);
				switch(c2){
					case 0:this.col.push(1,1);break;
					case 1:this.col.push(0,c==6?1:0);break;
					case 2:this.col.push(c==6?0:1,0);break;
				}
				this.col.push(_c);
			}
		}
	},

	polyExt:function(_i,_e,_c){
		var a=[_i[0],_i[1],_e],l=_i.length;
		for(var c=2;c<l;c+=2)
		{
			a.push(_i[c],_i[c+1],_e);
		}
		this.poly(a,_c);

		a=[_i[0],_i[1],-_e];
		for(var c=l-2;2<=c;c-=2)
		{
			a.push(_i[c],_i[c+1],-_e);
		}
		this.poly(a,_c);

		for(var c=0;c<l;c+=2)
		{
			this.poly([_i[c],_i[c+1],-_e,_i[(c+2)%l],_i[(c+2)%l+1],-_e,_i[(c+2)%l],_i[(c+2)%l+1],_e,_i[c],_i[c+1],_e],_c);
		}
	},

	polyCube:function(_v,_c){
		var w=_v[0]/2,h=_v[1]/2,d=_v[2]/2;
		this.poly([w,h,d,-w,h,d,-w,-h,d,w,-h,d],_c);
		this.poly([-w,h,-d,w,h,-d,w,-h,-d,-w,-h,-d],_c);
		this.poly([w,h,-d,w,h,d,w,-h,d,w,-h,-d],_c);
		this.poly([-w,h,d,-w,h,-d,-w,-h,-d,-w,-h,d],_c);
		this.poly([w,h,-d,-w,h,-d,-w,h,d,w,h,d],_c);
		this.poly([w,-h,d,-w,-h,d,-w,-h,-d,w,-h,-d],_c);
	},

	poly12hedron:function(_l,_c){
		var r=1/Math.cos(3*Math.PI/10)*.5*_l;
		for(var c=0;c<12;c++)
		{
			var p=[];
			for(var cc=0;cc<5;cc++)
			{
				var v=[0,r,0];
				v=CatMAT.vector(CatMAT.translate([0,0,r*((1+Math.sqrt(5))/2+1)/2]),v);
				v=CatMAT.vector(CatMAT.rotate([0,0,1],cc*Math.PI*2/5),v);
				if(0<c%6)
				{
					v=CatMAT.vector(CatMAT.rotate([0,0,1],Math.PI),v);
					v=CatMAT.vector(CatMAT.rotate([1,0,0],Math.acos(1/Math.sqrt(5))),v);
					v=CatMAT.vector(CatMAT.rotate([0,0,1],c*Math.PI*2/5),v);
				}
				if(5<c)
				{
					v=CatMAT.vector(CatMAT.rotate([0,0,1],Math.PI),v);
					v=CatMAT.vector(CatMAT.rotate([0,1,0],Math.PI),v);
				}
				p.push(v[0],v[1],v[2]);
			}
			this.poly(p,_c);
		}
	},

	setBuffer:function(){
		this.posBuffer=CatGL.createVbo(this.pos);
		this.norBuffer=CatGL.createVbo(this.nor);
		this.colBuffer=CatGL.createVbo(this.col);
		this.indexBuffer=CatGL.createIbo(this.index);
	},

	draw:function(){
		CatGL.setAttribute('a_pos',this.posBuffer,3);
		CatGL.setAttribute('a_nor',this.norBuffer,3);
		CatGL.setAttribute('a_col',this.colBuffer,3);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
		gl.drawElements(gl.TRIANGLES,this.indexBuffer.length,gl.UNSIGNED_SHORT,0);
	}
};

// ------

CatGL.Texture = function(){

	this.texture = gl.createTexture();
	gl.bindTexture( gl.TEXTURE_2D, this.texture );
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
	gl.bindTexture(gl.TEXTURE_2D,null);

	this.image = new Image();
	this.image.texture = this;

};

CatGL.Texture.prototype.setImage = function( _image ){

	this.image = _image;

	gl.bindTexture (gl.TEXTURE_2D, this.texture );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image );
	gl.bindTexture( gl.TEXTURE_2D, null );

};

CatGL.Texture.prototype.setUrl = function( _url ){

	this.image = new Image();
	this.image.texture = this;

	this.image.onload = function(){

		gl.bindTexture (gl.TEXTURE_2D, this.texture.texture );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this );
		gl.bindTexture( gl.TEXTURE_2D, null );

	};

	this.image.src = _url;

};

// ------

CatGL.SegmentDisplay=function(_v,_s,_c){
	this.segs=[];
	this.hot=[];

	for(var i=0;i<16;i++){
		this.hot[i]=false;
	}

	for(var i=0;i<16;i++){
		var o=new CatGL.Object();

		if(i==0){d([-.97,.98,-.69,.85,-.01,.85,-.01,1,-.9,1]);}
		if(i==1){d([.97,.98,.9,1,.01,1,.01,.85,.69,.85]);}
		if(i==2){d([.98,.97,.7,.84,.7,.085,.9,.01,1,.05,1,.95]);}
		if(i==3){d([.98,-.97,1,-.95,1,-.05,.9,-.01,.7,-.085,.7,-.84]);}
		if(i==4){d([.97,-.98,.69,-.85,.01,-.85,.01,-1,.9,-1]);}
		if(i==5){d([-.97,-.98,-.9,-1,-.01,-1,-.01,-.85,-.69,-.85]);}
		if(i==6){d([-.98,-.97,-.7,-.84,-.7,-.085,-.9,-.01,-1,-.05,-1,-.95]);}
		if(i==7){d([-.98,.97,-1,.95,-1,.05,-.9,.01,-.7,.085,-.7,.84]);}
		if(i==8){d([-.89,0,-.69,-.075,-.01,-.075,-.01,.075,-.69,.075]);}
		if(i==9){d([.89,0,.69,.075,.01,.075,.01,-.075,.69,-.075]);}
		if(i==10){d([-.68,.84,-.68,.55,-.2,.085,-.12,.085,-.17,.35]);}
		if(i==11){d([.15,.84,-.15,.84,-.15,.35,-.1,.085,.1,.085,.15,.35]);}
		if(i==12){d([.68,.84,.17,.35,.12,.085,.2,.085,.68,.55]);}
		if(i==13){d([.68,-.84,.68,-.55,.2,-.085,.12,-.085,.17,-.35]);}
		if(i==14){d([.15,-.84,.15,-.35,.1,-.085,-.1,-.085,-.15,-.35,-.15,-.84]);}
		if(i==15){d([-.68,-.84,-.17,-.35,-.12,-.085,-.2,-.085,-.68,-.55]);}
		o.setBuffer();

		this.segs.push(o);
	}

	function d(i)
	{
		var a=[];
		for(var c=0;c<i.length;c+=2)
		{
			a.push(i[c]*_v[0]+i[c+1]*_v[1]*_s,i[c+1]*_v[1]);
		}
		o.polyExt(a,_v[2],_c);
	}
};

CatGL.SegmentDisplay.prototype={
	set:function(_v){
		this.hot=_v;
	},

	not:function(){
		for(var i=0;i<16;i++){
			this.hot[i]=!this.hot[i];
		}
	},

	draw:function(){
		for(var i=0;i<16;i++){
			if(this.hot[i]){
				this.segs[i].draw();
			}
		}
	}
};
