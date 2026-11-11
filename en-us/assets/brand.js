// Loona QR Codes — branding strip for downloaded code images.
// Composes a NEW image: the code itself (quiet zone included) stays
// pixel-for-pixel untouched on top; below it a clean white gap, then a
// white strip carrying the small Loona badge and the line
// "Made free with Loona Automation". The strip always sits BELOW the
// code, outside its quiet zone, so downloads scan exactly as before.
(function(){
  'use strict';
  var TEXT='Made free with Loona Automation';
  var GREEN='#062e2a';
  var badge=new Image(), badgeOk=false;
  badge.onload=function(){ badgeOk=true; };
  (function(){
    var src='../assets/icon-192.png';
    var tags=document.getElementsByTagName('script');
    for(var i=0;i<tags.length;i++){
      var s=tags[i].src||'';
      if(/brand\.js($|\?)/.test(s)){ src=s.replace(/brand\.js($|\?.*)$/,'')+'icon-192.png'; break; }
    }
    badge.src=src;
  })();

  // strip(srcCanvas[, stripHeight]) -> new canvas with the band appended.
  function strip(srcCanvas, stripH){
    if(!srcCanvas || !srcCanvas.width || !srcCanvas.height) return srcCanvas;
    var W=srcCanvas.width, H=srcCanvas.height;
    var gap=Math.max(12, Math.round(W*0.05));
    var sh=stripH || Math.max(32, Math.round(W*0.095));
    var out=document.createElement('canvas');
    out.width=W; out.height=H+gap+sh;
    var x=out.getContext('2d');
    x.fillStyle='#ffffff'; x.fillRect(0,0,W,out.height);
    x.drawImage(srcCanvas,0,0);
    var fs=Math.floor(sh*0.38);
    x.font='600 '+fs+'px Arial, sans-serif';
    x.textBaseline='middle'; x.textAlign='left';
    var tw=x.measureText(TEXT).width;
    var bh=Math.round(sh*0.66), lg=Math.round(sh*0.22);
    var tot=tw+(badgeOk ? bh+lg : 0);
    var sx=Math.round((W-tot)/2), sy=H+gap;
    if(badgeOk){ x.drawImage(badge, sx, Math.round(sy+(sh-bh)/2), bh, bh); sx+=bh+lg; }
    x.fillStyle=GREEN;
    x.fillText(TEXT, sx, Math.round(sy+sh/2)+1);
    return out;
  }

  // svg(xmlString) -> same SVG with a white band + the line appended below.
  function brandedSVG(xml){
    if(!xml || xml.indexOf('<svg')<0) return xml;
    var m=xml.match(/<svg[^>]*>/); if(!m) return xml;
    var tag=m[0];
    var wm=tag.match(/width="([\d.]+)"/), hm=tag.match(/height="([\d.]+)"/);
    if(!wm || !hm) return xml;
    var w=parseFloat(wm[1]), h=parseFloat(hm[1]);
    if(!w || !h) return xml;
    var sh=Math.max(16, Math.round(h*0.30)), gap=Math.round(sh*0.35);
    var newTag=tag.replace(/height="([\d.]+)"/, 'height="'+(h+gap+sh)+'"');
    var add='<rect x="0" y="'+h+'" width="'+w+'" height="'+(gap+sh)+'" fill="#ffffff"/>'
      +'<text x="'+(w/2)+'" y="'+(h+gap+sh/2)+'" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-weight="600" font-size="'+Math.round(sh*0.52)+'" fill="'+GREEN+'">'+TEXT+'</text>';
    var out=xml.replace(tag, newTag);
    if(/<\/svg>\s*$/.test(out)) out=out.replace(/<\/svg>\s*$/, add+'</svg>');
    else out=out+add;
    return out;
  }

  window.loonaBrand={ strip:strip, svg:brandedSVG, text:TEXT };
})();
