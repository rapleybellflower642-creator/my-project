"""Rebuild original 3D cinematic objects for Ding Feng Bo. Blender 4.3+, CPU only.
Example: blender -b -t 2 --python scripts/v3g/build_assets.py -- --asset seal --frames 30
No downloaded artwork, characters, fonts or generated image dependencies.
"""
import bpy, math, os, argparse, json, time
from mathutils import Vector
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
args = argparse.ArgumentParser()
args.add_argument('--asset', choices=['seal','scroll','cup','sandals','cloak'], required=True)
args.add_argument('--frames',type=int,default=1)
args.add_argument('--size',type=int,default=800)
args.add_argument('--samples',type=int,default=16)
args.add_argument('--review',action='store_true')
args.add_argument('--engine',choices=['CYCLES','BLENDER_EEVEE_NEXT'],default='CYCLES')
opts=args.parse_args(__import__('sys').argv[__import__('sys').argv.index('--')+1:])
for obj in list(bpy.data.objects): bpy.data.objects.remove(obj,do_unlink=True)
scene=bpy.context.scene
scene.render.engine=opts.engine
scene.render.image_settings.compression=35
scene.cycles.device='CPU'; scene.cycles.samples=opts.samples
scene.cycles.use_denoising=False
scene.cycles.use_adaptive_sampling=True;scene.cycles.adaptive_threshold=.04
scene.cycles.max_bounces=6;scene.cycles.diffuse_bounces=3;scene.cycles.glossy_bounces=4
scene.render.threads_mode='FIXED';scene.render.threads=2
scene.render.resolution_x=opts.size;scene.render.resolution_y=opts.size;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.image_settings.color_depth='8';scene.render.image_settings.compression=60
scene.render.film_transparent=True
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=0.7
world=bpy.data.worlds.new('Soft neutral studio')
scene.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Color'].default_value=(0.11,0.12,0.13,1);world.node_tree.nodes['Background'].inputs['Strength'].default_value=0.33

def material(name,color,metal=0,rough=.42,noise=0,scale=8,bump=.08):
    m=bpy.data.materials.new(name);m.use_nodes=True
    n=m.node_tree.nodes;links=m.node_tree.links;bs=n.get('Principled BSDF')
    bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
    if noise:
        tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=scale;tex.inputs['Detail'].default_value=3.2;tex.inputs['Roughness'].default_value=.72
        ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.22;ramp.color_ramp.elements[0].color=(*(c*(1-noise) for c in color),1)
        ramp.color_ramp.elements[1].position=.8;ramp.color_ramp.elements[1].color=(*(min(1,c*(1+noise)) for c in color),1)
        links.new(tex.outputs['Fac'],ramp.inputs[0]);links.new(ramp.outputs[0],bs.inputs['Base Color'])
        b=n.new('ShaderNodeBump');b.inputs['Strength'].default_value=bump;b.inputs['Distance'].default_value=.025;links.new(tex.outputs['Fac'],b.inputs['Height']);links.new(b.outputs['Normal'],bs.inputs['Normal'])
    return m
brass=material('Antique warm brass',(0.58,.32,.085),.82,.29,.4,7,.18)
edgegold=material('Worn brass edges',(.72,.46,.16),.88,.23,.12,13,.1)
inkred=material('Old cinnabar traces',(.20,.023,.013),.18,.56,.3,18,.08)
wood=material('Dark oiled wood',(.105,.041,.018),.05,.34,.38,6,.2)
paper=material('Unbleached mulberry paper',(.69,.56,.32),0,.72,.08,68,.2)
yarn=material('Dry straw fibers',(.55,.36,.13),0,.63,.22,26,.16)
yarn2=material('Light straw fibers',(.70,.49,.20),0,.7,.2,33,.17)
bamboo=material('Weathered bamboo',(.29,.21,.063),.03,.49,.26,17,.14)
glaze=material('Black tea glaze',(.033,.022,.016),.25,.19,.5,12,.10)
liquid=material('Wine surface',(.065,.035,.009),.28,.11,.08,5,.04)
objects=[]

def addmat(o,m):o.data.materials.append(m);objects.append(o);return o

def smooth(o):
    for p in o.data.polygons:p.use_smooth=True
    return o

def bevel(o,width=.06,segments=4):
    mod=o.modifiers.new('Soft worn edges','BEVEL');mod.width=width;mod.segments=segments
    mod=o.modifiers.new('Weighted smooth normals','WEIGHTED_NORMAL');mod.keep_sharp=True
    return o

def cube(name,loc,size,mat,bev=.05):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);addmat(o,mat)
    if bev:bevel(o,bev)
    return o

def curve(name,points,mat,r=.025,closed=False,res=3):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=12;c.bevel_depth=r;c.bevel_resolution=res
    s=c.splines.new('POLY');s.points.add(len(points)-1)
    for p,v in zip(s.points,points):p.co=(*v,1)
    s.use_cyclic_u=closed
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);addmat(o,mat);return o

def cylinder(name,loc,radius,depth,mat,rot=(0,0,0),verts=64):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=radius,depth=depth,location=loc,rotation=rot);o=bpy.context.object;o.name=name;addmat(o,mat);bevel(o,.024,3);smooth(o);return o

def lathe(name,profile,mat,n=96):
    vs=[];faces=[]
    for r,z in profile:
        for i in range(n):
            a=i/n*2*math.pi;vs.append((r*math.cos(a),r*math.sin(a),z))
    for j in range(len(profile)-1):
        for i in range(n):a=j*n+i;b=j*n+(i+1)%n;faces.append((a,b,b+n,a+n))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vs,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);addmat(o,mat);smooth(o)
    sub=o.modifiers.new('Silky pottery surface','SUBSURF');sub.levels=1;sub.render_levels=1
    return o

def make_seal():
    cube('Heavy square seal base',(0,0,.31),(2.7,2.7,.6),brass,.11)
    cube('Cinnabar underside',(0,0,.015),(2.48,2.48,.04),inkred,.035)
    cube('Upper worn border',(0,0,.61),(2.60,2.60,.075),edgegold,.03)
    cube('Inset top',(0,0,.66),(2.43,2.43,.06),brass,.035)
    # A solid arched bridge handle, formed as a bevelled annular segment extruded front to back.
    seg=48;vs=[]
    for y in [-.30,.30]:
        for r in [.53,.83]:
            for i in range(seg+1):
                a=math.pi*i/seg;vs.append((r*math.cos(a),y,.68+r*math.sin(a)))
    stride=seg+1;fs=[]
    for i in range(seg):
        fs += [(i,i+1,stride+i+1,stride+i),(2*stride+i,3*stride+i,3*stride+i+1,2*stride+i+1),
               (i,2*stride+i,2*stride+i+1,i+1),(stride+i,stride+i+1,3*stride+i+1,3*stride+i)]
    fs += [(0,stride,3*stride,2*stride),(seg,2*stride-1,4*stride-1,3*stride-1)]
    mesh=bpy.data.meshes.new('Carved bridge');mesh.from_pydata(vs,[],fs);mesh.update();o=bpy.data.objects.new('Solid bridge seal knob',mesh);bpy.context.collection.objects.link(o);addmat(o,brass);bevel(o,.065,5);smooth(o)
    # Small geometric casting borders on the two visible vertical sides, no counterfeit inscription.
    for y in [-1.358,1.358]:
        curve('Casting border',[(-1.10,y,.17),(1.10,y,.17),(1.10,y,.44),(-1.10,y,.44)],edgegold,.009,True)
    return 5.1,Vector((0,0,.68)),(6,-8,6)

def make_scroll():
    # Paper with a shallow central drape and tight upward curls next to the wooden rollers.
    nx,ny=110,22;vs=[];fs=[]
    for j in range(ny+1):
        y=-1.38+2.76*j/ny
        for i in range(nx+1):
            x=-2.10+4.2*i/nx
            z=.19+.105*(x/2.1)**2+.13*math.exp(-((abs(x)-2.05)/.22)**2)+.014*math.sin(y*2.1+x)
            vs.append((x,y,z))
    for j in range(ny):
        for i in range(nx):a=j*(nx+1)+i;fs.append((a,a+1,a+nx+2,a+nx+1))
    me=bpy.data.meshes.new('Curled paper mesh');me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new('Open mulberry paper',me);bpy.context.collection.objects.link(o);addmat(o,paper);smooth(o)
    sol=o.modifiers.new('Paper thickness','SOLIDIFY');sol.thickness=.018
    for x in [-2.15,2.15]:
        cylinder('Paper roll',(x,0,.29),.23,2.86,paper,(math.pi/2,0,0))
        for y in [-1.52,1.52]:
            cylinder('Exposed wooden spindle',(x,y,.29),.17,.34,wood,(math.pi/2,0,0))
            cylinder('Carved wooden end',(x,y*1.10,.29),.22,.11,wood,(math.pi/2,0,0))
            cylinder('Small brass collar',(x,y*1.04,.29),.175,.035,edgegold,(math.pi/2,0,0))
    # Empty paper intentionally accepts typeset genuine poem text in the compositing scene.
    return 6.9,Vector((0,0,.15)),(4,-7,7.8)

def make_cup():
    # Continuous exterior, lip, and interior profile: actual open vessel, not a dark cylinder.
    profile=[(.36,.05),(.38,.10),(.36,.18),(.40,.23),(.59,.34),(.82,.56),(1.03,.89),(1.14,1.14),(1.15,1.20),(1.11,1.23),(1.065,1.19),(.99,.93),(.77,.60),(.54,.38),(.28,.28),(0,.28)]
    lathe('Hand thrown black glazed wine bowl',profile,glaze)
    lathe('Warm bare clay foot',[(.35,.025),(.39,.04),(.39,.10),(.35,.12)],wood)
    lathe('Thin worn glaze rim',[(1.12,1.205),(1.14,1.215),(1.13,1.228),(1.108,1.218)],edgegold)
    cylinder('Still wine inside',(0,0,.76),.86,.009,liquid,verts=96)
    # One tiny concentric highlight contour provides surface depth without painted imagery.
    curve('Liquid meniscus',[(.852*math.cos(i*2*math.pi/120),.852*math.sin(i*2*math.pi/120),.765) for i in range(120)],liquid,.006,True,2)
    return 4.35,Vector((0,0,.55)),(5,-7,5.8)

def sole_outline(cx,cy,angle,scale=1):
    out=[]
    for k in range(96):
        a=k/96*math.pi*2
        # Rounded oblong sole, wide at the toes and slightly tapered heel.
        y=1.03*math.cos(a);x=.43*math.sin(a)*(1+.13*math.cos(a))
        out.append((cx+scale*(x*math.cos(angle)-y*math.sin(angle)),cy+scale*(x*math.sin(angle)+y*math.cos(angle))))
    return out

def make_sandals():
    for num,(cx,cy,angle) in enumerate([(0,-.2,-.20),(.93,.13,.23)]):
        outline=sole_outline(cx,cy,angle)
        vs=[(x,y,z) for z in [.045,.14] for x,y in outline];fs=[];n=len(outline)
        fs += [tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]
        for i in range(n):j=(i+1)%n;fs.append((i,j,j+n,i+n))
        me=bpy.data.meshes.new('Woven sole');me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new('Straw sandal sole',me);bpy.context.collection.objects.link(o);addmat(o,yarn);bevel(o,.045,3)
        def xyz(x,y,z):return(cx+x*math.cos(angle)-y*math.sin(angle),cy+x*math.sin(angle)+y*math.cos(angle),z)
        # Real intersecting woven geometry, with alternating over/under heights.
        for i in range(25):
            y=-.94+i*.078;w=.43*math.sqrt(max(.02,1-(y/1.03)**2))*(1+.13*y/1.03)
            pts=[xyz(-w+2*w*k/36,y,.17+.011*math.sin(k/36*2*w/.062*math.pi)) for k in range(37)]
            curve('Crosswoven straw',pts,yarn2,.025,False,2)
        for i in range(13):
            x=-.36+i*.06;ymax=1.03*math.sqrt(max(.02,1-(x/.44)**2))
            pts=[xyz(x,-ymax+2*ymax*k/55,.17-.012*math.sin((-ymax+2*ymax*k/55+.94)/.078*math.pi)) for k in range(56)]
            curve('Longitudinal straw',pts,yarn,.021,False,2)
        # Rope-bound perimeter plus two woven forefoot straps.
        curve('Rope bound edge',[(x,y,.15) for x,y in outline],yarn2,.045,True,3)
        for side in [-1,1]:
            for q in [-1,0,1]:
                pts=[]
                for k in range(45):
                    u=k/44;x=side*(.025+.33*u)+q*.026;y=.48-.80*u;z=.20+.43*math.sin(math.pi*u*.90)
                    pts.append(xyz(x,y,z))
                curve('Braided sandal thong',pts,yarn2,.035,False,3)
    # A continuous bamboo walking stick leaning behind the sandals, never a floating product line-up.
    start=Vector((-1.17,.36,.08));end=Vector((-.72,.8,4.75));d=end-start
    for i in range(8):
        a=start+d*i/8;b=start+d*(i+1)/8;mid=(a+b)/2
        o=cylinder('Bamboo internode',mid,.065-.002*i,(b-a).length,bamboo,verts=32);o.rotation_euler=d.to_track_quat('Z','Y').to_euler()
        o=cylinder('Raised bamboo joint',a,.077-.002*i,.048,yarn,verts=32);o.rotation_euler=d.to_track_quat('Z','Y').to_euler()
    return 6.55,Vector((-.05,0,2.33)),(5,-10,6)

def make_cloak():
    import random
    rng=random.Random(1082)
    bodymat=material('Dark woven straw backing',(.16,.080,.025),0,.88,.45,28,.3)
    strawdark=material('Weathered raincape fiber',(.28,.145,.044),0,.71,.30,35,.25)
    strawlight=material('Dry raincape fiber tips',(.42,.245,.079),0,.74,.24,31,.2)
    # An empty, open-front shoulder cape. The broad shoulders stay nearly vertical below,
    # rather than becoming a regular conical lampshade.
    sections=[(3.00,.36,.26),(2.86,.68,.38),(2.65,1.05,.52),(2.25,1.15,.57),(1.80,1.17,.60),(1.2,1.13,.62),(.55,1.10,.60),(.32,1.07,.58)]
    def surface(z,a,offset=0):
        for j in range(len(sections)-1):
            z0,rx0,ry0=sections[j];z1,rx1,ry1=sections[j+1]
            if z>=z1:
                u=max(0,min(1,(z0-z)/(z0-z1)));rx=rx0+(rx1-rx0)*u;ry=ry0+(ry1-ry0)*u;break
        else:rx,ry=sections[-1][1:]
        ripple=.022*math.sin(a*13+z*1.8)+.016*math.sin(a*23-z*3)
        return ((rx+offset+ripple)*math.sin(a),(ry+offset+ripple*.6)*math.cos(a),z)
    na,nz=90,38;vs=[];fs=[]
    for j in range(nz+1):
        z=3-(3-.35)*j/nz
        for i in range(na+1):
            a=-math.pi+.13+(2*math.pi-.26)*i/na
            zz=z+.034*math.sin(a*4+z)*((3-z)/2.65)
            vs.append(surface(zz,a))
    for j in range(nz):
        for i in range(na):k=j*(na+1)+i;fs.append((k,k+1,k+na+2,k+na+1))
    me=bpy.data.meshes.new('Open shoulder cape backing');me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new('Empty draped straw raincoat',me);bpy.context.collection.objects.link(o);addmat(o,bodymat);smooth(o)
    sol=o.modifiers.new('Thin woven underside','SOLIDIFY');sol.thickness=.025
    # Two densely laid, uneven straw tiers; every strand has a different length, lean and bend.
    for layer,count in [(0,220),(1,270)]:
        for i in range(count):
            a=-math.pi+.105+(2*math.pi-.21)*(i+.3*rng.random())/count
            if layer==0:
                top=2.96-rng.random()*.15;bottom=1.65+rng.random()*.28+.09*math.sin(a*3)
            else:
                top=2.22+rng.random()*.15;bottom=.21+rng.random()*.33+.07*math.sin(a*5)
            drift=rng.uniform(-.055,.055);off=.018+(0.025 if layer==0 else .012)+rng.uniform(0,.025)
            pts=[]
            for j in range(23):
                u=j/22;z=top+(bottom-top)*u
                aa=a+drift*u+.007*math.sin(u*8+i)
                x,y,zz=surface(z,aa,off+.03*u*u)
                # Loose frayed ends do not share a planar horizontal edge.
                pts.append((x+.01*math.sin(u*11+i),y+.009*math.cos(u*8+i),zz))
            strand=curve('Loose hanging straw strand',pts,strawlight if rng.random()<.29 else strawdark,rng.uniform(.010,.019),False,2)
            for j,p in enumerate(strand.data.splines[0].points):p.radius=1-.45*j/22
    # Irregular binding and a simple neck tie make the object legible as clothing.
    for z,rr in [(2.40,.020),(2.43,.017)]:
        curve('Twined shoulder binding',[surface(z,-math.pi+.14+(2*math.pi-.28)*i/130,.07) for i in range(131)],yarn,.018,False,2)
    curve('Soft neck opening',[surface(2.99,-math.pi+.14+(2*math.pi-.28)*i/90,.013) for i in range(91)],strawdark,.031,False,3)
    curve('Front rope tie',[(-.07,-.29,2.96),(-.12,-.46,2.77),(0,-.52,2.69),(.11,-.45,2.80),(.07,-.29,2.96)],yarn,.019,False,3)
    return 4.65,Vector((0,0,1.65)),(4.4,-8,4.3)

scale,target,camera_position=globals()['make_'+opts.asset]()
root=bpy.data.objects.new('Asset orbit',None);bpy.context.collection.objects.link(root)
for o in objects:o.parent=root
bpy.ops.object.camera_add(location=camera_position);camera=bpy.context.object;camera.name='Cinematic orthographic';camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=scale;camera.data.lens=65;scene.camera=camera

def area(name,loc,power,size,color,target=(0,0,.65),shape='DISK',size_y=None):
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape=shape;o.data.size=size;o.data.color=color
    if size_y and shape=='RECTANGLE':o.data.size_y=size_y
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
area('Warm overhead softbox',(-3,-4,7),750,4.0,(1,.81,.53))
area('Narrow gold reflection strip',(4,-2,4),480,2.8,(1,.91,.74),shape='RECTANGLE',size_y=.8)
area('Cool restrained edge',(1,4,4.8),620,3,(.63,.76,1))
area('Gentle frontal bounce',(-1,-6,2),160,3,(1,.89,.73))
base=ROOT/('out/v3g/assets-review' if opts.review else 'public/v3g/assets/'+opts.asset)
base.mkdir(parents=True,exist_ok=True)
start_time=time.time();frames=[]
for i in range(opts.frames):
    if opts.frames==1:a=0
    else:a=i/(opts.frames-1)
    # Quiet, restrained rotation. A full turn makes an ancient object feel like a commodity.
    spans={'seal':(-.105,.105),'scroll':(-.06,.06),'cup':(-.08,.08),'sandals':(-.045,.045),'cloak':(-.03,.03)}
    low,high=spans[opts.asset]
    root.rotation_euler[2]=0 if opts.frames==1 else low+(high-low)*a
    if opts.asset=='seal':root.rotation_euler[0]=.035*math.sin(a*math.pi)
    if opts.asset=='cup' and opts.frames>1:
        root.rotation_euler[0]=.018*math.sin(a*math.pi)
        root.rotation_euler[1]=-.018+.036*a
    path=base/(opts.asset+'-'+str(i).zfill(3)+'.png' if opts.review else str(i).zfill(3)+'.png')
    scene.render.filepath=str(path);bpy.ops.render.render(write_still=True);frames.append(path.name)
    print('ASSET_PROGRESS '+json.dumps({'asset':opts.asset,'frame':i+1,'frames':opts.frames,'elapsed':round(time.time()-start_time,1)}),flush=True)
manifest={'asset':opts.asset,'frames':frames,'size':opts.size,'alpha':True,'rotationRadians':spans[opts.asset] if opts.frames>1 else [0,0],'render':opts.engine+' CPU, '+str(opts.samples)+' samples','seconds':round(time.time()-start_time,2)}
(base/(opts.asset+'-manifest.json' if opts.review else 'manifest.json')).write_text(json.dumps(manifest,indent=2)+'\n')
