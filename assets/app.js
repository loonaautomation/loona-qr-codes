// Loona QR Codes - 100% client-side QR generation. Nothing is uploaded to any server.
function trim(s){return (s||'').trim();}
function enc(s){return encodeURIComponent(trim(s));}
function ensureUrl(u){u=trim(u); if(!u) return ''; if(!/^https?:\/\//i.test(u) && !/^(upi:|bitcoin:|tel:|mailto:)/i.test(u)) u='https://'+u; return u;}
function escWifi(s){return trim(s).replace(/([\\;,:"'])/g,'\\$1');}
function escVcard(s){return trim(s).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
function dtVal(v){ // datetime-local -> VEVENT basic format YYYYMMDDTHHMMSS
  v=trim(v); if(!v) return ''; return v.replace(/[-:]/g,'').replace('T','T') + (v.length===16 ? '00' : '');
}
var BUILDERS = {
  url: function(d){ return ensureUrl(d.url); },
  text: function(d){ return trim(d.text); },
  wifi: function(d){ var e=d.encryption||'WPA'; var p = (e==='nopass') ? '' : ';P:'+escWifi(d.password); return 'WIFI:T:'+e+';S:'+escWifi(d.ssid)+p+';;'; },
  whatsapp: function(d){ var phone=trim(d.phone).replace(/[^0-9]/g,''); var q=trim(d.message)?'?text='+enc(d.message):''; return 'https://wa.me/'+phone+q; },
  vcard: function(d){ var lines=['BEGIN:VCARD','VERSION:3.0','FN:'+escVcard(d.fullname)]; if(d.org)lines.push('ORG:'+escVcard(d.org)); if(d.title)lines.push('TITLE:'+escVcard(d.title)); if(d.phone)lines.push('TEL;TYPE=CELL:'+trim(d.phone)); if(d.email)lines.push('EMAIL:'+trim(d.email)); if(d.website)lines.push('URL:'+ensureUrl(d.website)); if(d.address)lines.push('ADR:;;'+escVcard(d.address)+';;;;'); lines.push('END:VCARD'); return lines.join('\n'); },
  email: function(d){ var q=[]; if(d.subject)q.push('subject='+enc(d.subject)); if(d.body)q.push('body='+enc(d.body)); return 'mailto:'+trim(d.email)+(q.length?'?'+q.join('&'):''); },
  sms: function(d){ return 'SMSTO:'+trim(d.phone)+(trim(d.message)?':'+trim(d.message):''); },
  phone: function(d){ return 'tel:'+trim(d.phone).replace(/\s+/g,''); },
  instagram: function(d){ var u=trim(d.username).replace(/^@/,''); return u.indexOf('http')===0?u:'https://www.instagram.com/'+u+'/'; },
  facebook: function(d){ var u=trim(d.page); return u.indexOf('http')===0?u:'https://www.facebook.com/'+u.replace(/^@/,''); },
  youtube: function(d){ return ensureUrl(d.url); },
  tiktok: function(d){ var u=trim(d.username).replace(/^@/,''); return u.indexOf('http')===0?u:'https://www.tiktok.com/@'+u; },
  twitter: function(d){ var u=trim(d.username).replace(/^@/,''); return u.indexOf('http')===0?u:'https://x.com/'+u; },
  linkedin: function(d){ return ensureUrl(d.url); },
  telegram: function(d){ var u=trim(d.username).replace(/^@/,''); return u.indexOf('http')===0?u:'https://t.me/'+u; },
  snapchat: function(d){ var u=trim(d.username); return u.indexOf('http')===0?u:'https://www.snapchat.com/add/'+u; },
  location: function(d){ if(trim(d.query)) return 'https://www.google.com/maps/search/?api=1&query='+enc(d.query); if(trim(d.lat)&&trim(d.lng)) return 'geo:'+trim(d.lat)+','+trim(d.lng)+'?q='+trim(d.lat)+','+trim(d.lng); return ''; },
  review: function(d){ return ensureUrl(d.url); },
  menu: function(d){ return ensureUrl(d.url); },
  pdf: function(d){ return ensureUrl(d.url); },
  app: function(d){ return ensureUrl(d.url); },
  form: function(d){ return ensureUrl(d.url); },
  meeting: function(d){ return ensureUrl(d.url); },
  event: function(d){ var lines=['BEGIN:VEVENT','SUMMARY:'+trim(d.title)]; if(d.start)lines.push('DTSTART:'+dtVal(d.start)); if(d.end)lines.push('DTEND:'+dtVal(d.end)); if(d.location)lines.push('LOCATION:'+trim(d.location)); if(d.description)lines.push('DESCRIPTION:'+trim(d.description)); lines.push('END:VEVENT'); return lines.join('\n'); },
  paypal: function(d){ var u=trim(d.username).replace(/^https?:\/\/(www\.)?paypal\.(com|me)\/paypalme\//i,'').replace(/^paypal\.me\//i,''); var base='https://www.paypal.com/paypalme/'+u; if(trim(d.amount)) base+='/'+trim(d.amount); return base; },
  upi: function(d){ var q=['pa='+enc(d.upi_id)]; if(d.name)q.push('pn='+enc(d.name)); if(d.amount)q.push('am='+enc(d.amount)); q.push('cu=INR'); if(d.note)q.push('tn='+enc(d.note)); return 'upi://pay?'+q.join('&'); },
  jazzcash: function(d){ return 'Payment Information\nMethod: '+(d.provider||'JazzCash / EasyPaisa')+'\nAccount Title: '+trim(d.title)+'\nAccount Number: '+trim(d.number)+(trim(d.note)?'\nNote: '+trim(d.note):''); },
  bitcoin: function(d){ var q=[]; if(d.amount)q.push('amount='+enc(d.amount)); if(d.label)q.push('label='+enc(d.label)); return 'bitcoin:'+trim(d.address)+(q.length?'?'+q.join('&'):''); },
  spotify: function(d){ return ensureUrl(d.url); },
  resume: function(d){ return ensureUrl(d.url); }
};
function collect(form){ var data={}; var fd=new FormData(form); fd.forEach(function(v,k){data[k]=v;}); form.querySelectorAll('input,select,textarea').forEach(function(el){ if(el.name && !(el.name in data)) data[el.name]=el.value; }); return data; }
function generate(){
  var form=document.getElementById('qr-form'); if(!form) return;
  var type=form.getAttribute('data-type'); var builder=BUILDERS[type]; if(!builder) return;
  var payload=builder(collect(form));
  var box=document.getElementById('qrcode'); var msg=document.getElementById('qr-msg');
  if(!payload){ if(msg) msg.textContent='Please fill the required field above first.'; return; }
  if(msg) msg.textContent='';
  box.innerHTML='';
  var size=parseInt(document.getElementById('qrSize').value,10)||512;
  new QRCode(box,{text:payload,width:size,height:size,colorDark:document.getElementById('qrColor').value||'#000000',colorLight:document.getElementById('bgColor').value||'#ffffff',correctLevel:QRCode.CorrectLevel.M});
  var dl=document.getElementById('downloadBtn'); if(dl) dl.style.display='inline-block';
  window._loonaPayload=payload;
}
function downloadPNG(){
  var box=document.getElementById('qrcode'); if(!box) return;
  var canvas=box.querySelector('canvas'); var img=box.querySelector('img'); var url=null;
  if(canvas){ url=canvas.toDataURL('image/png'); }
  else if(img && img.src){ url=img.src; }
  if(!url) return;
  var a=document.createElement('a'); a.href=url; a.download='loona-qr-code.png'; document.body.appendChild(a); a.click(); a.remove();
}
document.addEventListener('DOMContentLoaded',function(){
  var form=document.getElementById('qr-form'); if(!form) return;
  var t; form.addEventListener('input',function(){ clearTimeout(t); t=setTimeout(generate,350); });
  ['qrColor','bgColor','qrSize'].forEach(function(id){ var el=document.getElementById(id); if(el) el.addEventListener('change',generate); });
  var gb=document.getElementById('generateBtn'); if(gb) gb.addEventListener('click',function(e){e.preventDefault();generate();});
  var dl=document.getElementById('downloadBtn'); if(dl) dl.addEventListener('click',function(e){e.preventDefault();downloadPNG();});
  generate();
  var box0=document.getElementById('qrcode');
  if(box0 && !box0.querySelector('canvas,img,table')){
    new QRCode(box0,{text:'https://loonaautomation.github.io/loona-qr-codes/',width:256,height:256,colorDark:'#000000',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
    var msg0=document.getElementById('qr-msg'); if(msg0) msg0.textContent='Sample QR shown above. Fill the form to create your own QR code.';
    var dl0=document.getElementById('downloadBtn'); if(dl0) dl0.style.display='none';
  }
});
